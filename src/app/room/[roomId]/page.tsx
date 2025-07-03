"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteWheel } from '@/components/game/roulette-wheel';
import { GameArea } from '@/components/game/game-area';
import { StopButton } from '@/components/game/stop-button';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { useRoomGameContext } from '@/contexts/room-game-context';
import { UI_TEXTS } from "@/constants/ui-texts";
import { useLanguage } from '@/contexts/language-context';
import { Progress } from '@/components/ui/progress';
import { ChatPanel } from '@/components/chat/chat-panel';

// Constantes del juego
const ROUND_DURATION_SECONDS = 60;
const CATEGORIES_BY_LANG = {
  es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"],
  en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit or Vegetable"],
  fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit ou Légume"],
  pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta ou Legume"]
};

type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";

export default function GamePage() {
  const { user } = useAuth();
  const { activeRoomId } = useRoomGameContext();
  const { language } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  // Estado del juego
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [personalHighScore, setPersonalHighScore] = useState(0);

  // Referencias
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);

  // Efectos
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    // Cargar puntuación máxima local
    const storedHighScore = localStorage.getItem('globalStopHighScore');
    if (storedHighScore) {
      setPersonalHighScore(parseInt(storedHighScore, 10));
    }

    return () => {
      // Limpiar intervalo al desmontar
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Funciones del juego
  const resetRound = useCallback(() => {
    setPlayerResponses({});
    setTimeLeft(ROUND_DURATION_SECONDS);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    resetRound();
    setGameState("SPINNING");
  }, [resetRound]);

  const handleSpinComplete = useCallback((letter: string) => {
    setCurrentLetter(letter);
    setGameState("PLAYING");
    startTimer();
  }, []);

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current as NodeJS.Timeout);
          if (gameStateRef.current === "PLAYING") {
            endRound();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const endRound = useCallback(() => {
    setGameState("EVALUATING");
    evaluateAnswers();
  }, [playerResponses, currentLetter]);

  const evaluateAnswers = useCallback(() => {
    // Lógica de evaluación simplificada
    let roundScore = 0;
    
    Object.entries(playerResponses).forEach(([category, answer]) => {
      if (answer && answer.toLowerCase().startsWith(currentLetter?.toLowerCase() || '')) {
        roundScore += 10; // Puntos básicos por respuesta válida
      }
    });

    setTotalPlayerScore(prev => prev + roundScore);
    setGameState("RESULTS");
  }, [playerResponses, currentLetter]);

  // Renderizado
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      
      <main className="flex-grow container mx-auto p-4">
        {gameState === "IDLE" && (
          <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold text-center">
              {UI_TEXTS.welcomeTitle[language]}
            </h1>
            <Button onClick={startGame} size="lg">
              {UI_TEXTS.startGameButton[language]}
            </Button>
          </div>
        )}

        {gameState === "SPINNING" && (
          <RouletteWheel 
            letters={Object.keys(CATEGORIES_BY_LANG).flatMap(lang => CATEGORIES_BY_LANG[lang as keyof typeof CATEGORIES_BY_LANG])}
            onSpinComplete={handleSpinComplete}
          />
        )}

        {gameState === "PLAYING" && currentLetter && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {UI_TEXTS.currentLetterLabel[language]}: {currentLetter}
              </h2>
              <Progress value={(timeLeft / ROUND_DURATION_SECONDS) * 100} />
              <p>{timeLeft}s {UI_TEXTS.timeLeftLabel[language]}</p>
            </div>

            <GameArea
              categories={CATEGORIES_BY_LANG[language]}
              letter={currentLetter}
              responses={playerResponses}
              onInputChange={(category, value) => 
                setPlayerResponses(prev => ({ ...prev, [category]: value }))
              }
            />

            <StopButton 
              onClick={endRound}
              disabled={Object.keys(playerResponses).length === 0}
            />
          </div>
        )}

        {gameState === "RESULTS" && (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>{UI_TEXTS.resultsTitle[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{UI_TEXTS.yourRoundScore[language]}: {totalPlayerScore}</p>
              <p>{UI_TEXTS.myTotalScore[language]}: {totalPlayerScore}</p>
            </CardContent>
            <div className="flex justify-center p-4">
              <Button onClick={startGame}>
                {UI_TEXTS.nextRoundButton[language]}
              </Button>
            </div>
          </Card>
        )}
      </main>

      {activeRoomId && (
        <ChatPanel 
          roomId={activeRoomId}
          userId={user?.uid || 'guest'}
          userName={user?.displayName || 'Guest'}
        />
      )}

      <AppFooter language={language} />
    </div>
  );
}
