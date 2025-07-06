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

const ROUND_DURATION_SECONDS = 60;
const CATEGORIES_BY_LANG = {
  es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"],
  en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit or Vegetable"],
  fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit ou Légume"],
  pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta ou Legume"]
} as const;

const ALPHABET = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";

interface GameTexts {
  welcomeTitle: Record<string, string>;
  startGameButton: Record<string, string>;
  currentLetterLabel: Record<string, string>;
  timeLeftLabel: Record<string, string>;
  resultsTitle: Record<string, string>;
  yourRoundScore: Record<string, string>;
  myTotalScore: Record<string, string>;
  nextRoundButton: Record<string, string>;
  highScoreLabel: Record<string, string>;
}

interface RoundResult {
  playerScore: number;
  aiScore: number;
  playerResponse: string;
  aiResponse: string;
  playerResponseIsValid?: boolean;
  playerResponseErrorReason?: "format" | "invalid_word" | "api_error" | null;
}

export default function GamePage() {
  const { user } = useAuth();
  const { activeRoomId } = useRoomGameContext();
  const { language } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [personalHighScore, setPersonalHighScore] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [roundResults, setRoundResults] = useState<Record<string, RoundResult>>({});
  const [gameMode, setGameMode] = useState<"solo" | "room">(activeRoomId ? "room" : "solo");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
    setIsEvaluating(gameState === "EVALUATING");
    setShowResults(gameState === "RESULTS" || gameState === "EVALUATING");
  }, [gameState]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('globalStopHighScore');
    if (storedHighScore) {
      setPersonalHighScore(parseInt(storedHighScore, 10));
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const resetRound = useCallback(() => {
    setPlayerResponses({});
    setRoundResults({});
    setTimeLeft(ROUND_DURATION_SECONDS);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    resetRound();
    setGameState("SPINNING");
    setIsSpinning(true);
  }, [resetRound]);

  const handleSpinComplete = useCallback((letter: string) => {
    setCurrentLetter(letter);
    setGameState("PLAYING");
    setIsSpinning(false);
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
    const results: Record<string, RoundResult> = {};
    let roundScore = 0;
    
    Object.entries(playerResponses).forEach(([category, answer]) => {
      const isValid = Boolean(answer && answer.toLowerCase().startsWith(currentLetter?.toLowerCase() || ''));
      results[category] = {
        playerScore: isValid ? 10 : 0,
        aiScore: 0,
        playerResponse: answer,
        aiResponse: "",
        playerResponseIsValid: isValid,
        playerResponseErrorReason: isValid ? null : "invalid_word"
      };
      if (isValid) {
        roundScore += 10;
      }
    });

    setRoundResults(results);
    const newTotalScore = totalPlayerScore + roundScore;
    setTotalPlayerScore(newTotalScore);
    
    if (newTotalScore > personalHighScore) {
      setPersonalHighScore(newTotalScore);
      localStorage.setItem('globalStopHighScore', newTotalScore.toString());
    }

    setGameState("RESULTS");
  }, [playerResponses, currentLetter, totalPlayerScore, personalHighScore]);

  const getText = (key: keyof GameTexts) => {
    const texts = UI_TEXTS as unknown as GameTexts;
    return texts[key][language] || '';
  };

  const handleResponseChange = useCallback((category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      
      <main className="flex-grow container mx-auto p-4">
        {gameState === "IDLE" && (
          <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold text-center">
              {getText('welcomeTitle')}
            </h1>
            <Button onClick={startGame} size="lg">
              {getText('startGameButton')}
            </Button>
          </div>
        )}

        {gameState === "SPINNING" && (
          <RouletteWheel 
            isSpinning={isSpinning}
            alphabet={ALPHABET}
            language={language}
            onSpinComplete={handleSpinComplete}
          />
        )}

        {gameState === "PLAYING" && currentLetter && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {getText('currentLetterLabel')}: {currentLetter}
              </h2>
              <Progress value={(timeLeft / ROUND_DURATION_SECONDS) * 100} />
              <p>{timeLeft}s {getText('timeLeftLabel')}</p>
            </div>

            <GameArea
              categories={[...CATEGORIES_BY_LANG[language as keyof typeof CATEGORIES_BY_LANG]]}
              letter={currentLetter}
              playerResponses={playerResponses}
              onInputChange={handleResponseChange}
              isEvaluating={isEvaluating}
              showResults={showResults}
              roundResults={roundResults}
              language={language}
              gameMode={gameMode}
            />

            <StopButton 
              onClick={endRound}
              disabled={Object.keys(playerResponses).length === 0}
              language={language}
            />
          </div>
        )}

        {gameState === "RESULTS" && (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>{getText('resultsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{getText('yourRoundScore')}: {totalPlayerScore - personalHighScore}</p>
              <p>{getText('myTotalScore')}: {totalPlayerScore}</p>
              <p>{getText('highScoreLabel')}: {personalHighScore}</p>
            </CardContent>
            <div className="flex justify-center p-4">
              <Button onClick={startGame}>
                {getText('nextRoundButton')}
              </Button>
            </div>
          </Card>
        )}
      </main>

      {activeRoomId && (
        <ChatPanel 
          currentRoomId={activeRoomId}
          currentUserUid={user?.uid || 'guest'}
          currentUserName={user?.displayName || 'Guest'}
          messages={messages}
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          language={language}
        />
      )}

      <AppFooter language={language} />
    </div>
  );
}