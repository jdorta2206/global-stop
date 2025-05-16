"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteWheel } from '@/components/game/roulette-wheel';
import { GameArea } from '@/components/game/game-area';
import { StopButton } from '@/components/game/stop-button';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { generateAiOpponentResponse, type AiOpponentResponseInput } from '@/ai/flows/generate-ai-opponent-response';
import { Loader2, PlayCircle, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";
const CATEGORIES = ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();

  const resetRound = useCallback(() => {
    // setCurrentLetter(null); // Keep current letter for display until new spin
    setPlayerResponses({});
    setAiResponses({});
  }, []);

  const startGame = useCallback(() => {
    resetRound();
    setGameState("SPINNING");
  }, [resetRound]);

  const handleSpinComplete = useCallback((letter: string) => {
    setCurrentLetter(letter);
    setGameState("PLAYING");
  }, []);

  const handleInputChange = useCallback((category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  }, []);

  const handleStop = useCallback(async () => {
    if (!currentLetter) return;
    setGameState("EVALUATING");
    setIsLoadingAi(true);
    
    const tempAiResponses: Record<string, string> = {};
    const aiPromises = CATEGORIES.map(async (category) => {
      try {
        // Add a small randomized delay to make AI seem like it's "thinking"
        // and to avoid potential rapid-fire API calls if backend has limits.
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        const aiInput: AiOpponentResponseInput = { letter: currentLetter, category };
        const aiResult = await generateAiOpponentResponse(aiInput);
        tempAiResponses[category] = aiResult.response;
      } catch (error) {
        console.error(`Error fetching AI response for ${category}:`, error);
        tempAiResponses[category] = "Error al generar respuesta"; // Translated
        // Individual toast for each error might be too noisy, group them or show one general error.
      }
    });

    try {
      await Promise.all(aiPromises);
      setAiResponses(tempAiResponses);
    } catch (error) { // This catch is for Promise.all, individual errors handled above.
      console.error("Error in processing AI responses:", error);
       toast({
        title: "Error de IA", // Translated
        description: "Algunas respuestas de la IA no pudieron generarse. Por favor, revisa los resultados.", // Translated
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
      setGameState("RESULTS");
    }
  }, [currentLetter, toast]);

  const startNextRound = useCallback(() => {
    startGame();
  }, [startGame]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {gameState === "IDLE" && (
            <Card className="shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">¡Bienvenido a Global Stop!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-3">
                  ¿Listo para poner a prueba tu vocabulario y rapidez mental contra nuestra IA?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-10">
                <Button 
                  onClick={startGame} 
                  size="lg" 
                  className="text-xl px-10 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg 
                             transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                             focus-visible:ring-4 focus-visible:ring-primary/50 rounded-lg"
                >
                  <PlayCircle className="mr-3 h-7 w-7" />
                  Empezar Juego
                </Button>
              </CardContent>
            </Card>
          )}

          {gameState === "SPINNING" && (
            <div className="animate-fadeIn">
              <RouletteWheel isSpinning={true} onSpinComplete={handleSpinComplete} alphabet={ALPHABET} />
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "EVALUATING" || gameState === "RESULTS") && currentLetter && (
             <div className="animate-fadeIn">
              <GameArea
                letter={currentLetter}
                categories={CATEGORIES}
                playerResponses={playerResponses}
                aiResponses={aiResponses}
                onInputChange={handleInputChange}
                isEvaluating={gameState === "EVALUATING" || isLoadingAi}
                showResults={gameState === "RESULTS"}
              />
            </div>
          )}
          
          {gameState === "PLAYING" && (
            <div className="flex justify-center animate-fadeInUp">
              <StopButton onClick={handleStop} />
            </div>
          )}

          {gameState === "EVALUATING" && (
            <Card className="shadow-xl rounded-lg animate-fadeIn p-8">
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-primary">IA está Pensando...</p>
                <p className="text-muted-foreground">Por favor, espera mientras la IA prepara sus respuestas.</p>
              </CardContent>
            </Card>
          )}

          {gameState === "RESULTS" && (
             <div className="flex justify-center animate-fadeInUp">
              <Button 
                onClick={startNextRound} 
                size="lg" 
                className="text-xl px-10 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg 
                           transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                           focus-visible:ring-4 focus-visible:ring-primary/50 rounded-lg"
              >
                <RotateCcw className="mr-3 h-7 w-7" />
                Jugar Siguiente Ronda
              </Button>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
