
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
import { Loader2, PlayCircle, RotateCcw, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context'; // Importar useAuth

type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";
const CATEGORIES = ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface RoundResultDetail {
  playerScore: number;
  aiScore: number;
  playerResponse: string;
  aiResponse: string;
}
export type RoundResults = Record<string, RoundResultDetail>;


export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Obtener el usuario del contexto de autenticación

  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);


  const resetRound = useCallback(() => {
    setPlayerResponses({});
    setAiResponses({});
    setPlayerRoundScore(0);
    setAiRoundScore(0);
    setRoundResults(null);
    setRoundWinner(null);
  }, []);

  const startGame = useCallback(() => {
    if (gameState === "IDLE") { // Reset total scores for a new game session
        setTotalPlayerScore(0);
        setTotalAiScore(0);
    }
    resetRound();
    setGameState("SPINNING");
  }, [resetRound, gameState]);

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
        // Simular un pequeño retraso variable para la respuesta de la IA
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        const aiInput: AiOpponentResponseInput = { letter: currentLetter, category };
        const aiResult = await generateAiOpponentResponse(aiInput);
        tempAiResponses[category] = aiResult.response;
      } catch (error) {
        console.error(`Error al obtener respuesta de IA para ${category}:`, error);
        tempAiResponses[category] = ""; // Respuesta vacía en caso de error
      }
    });

    try {
      await Promise.all(aiPromises);
      setAiResponses(tempAiResponses); // Establecer respuestas de la IA

      // Calcular puntuaciones
      let currentRoundPlayerScore = 0;
      let currentRoundAiScore = 0;
      const detailedRoundResults: RoundResults = {};

      CATEGORIES.forEach(category => {
        const playerResponseRaw = playerResponses[category] || "";
        const playerResponse = playerResponseRaw.trim();
        const aiResponseRaw = tempAiResponses[category] || "";
        const aiResponse = aiResponseRaw.trim();
        
        let pScore = 0;
        let aScore = 0;

        const isPlayerResponseValid = playerResponse !== "" && playerResponse.toLowerCase().startsWith(currentLetter!.toLowerCase());
        const isAiResponseValid = aiResponse !== "" && aiResponse.toLowerCase().startsWith(currentLetter!.toLowerCase());

        if (isPlayerResponseValid && !isAiResponseValid) {
          pScore = 100;
        } else if (!isPlayerResponseValid && isAiResponseValid) {
          aScore = 100;
        } else if (isPlayerResponseValid && isAiResponseValid) {
          if (playerResponse.toLowerCase() === aiResponse.toLowerCase()) {
            pScore = 50;
            aScore = 50;
          } else {
            pScore = 100;
            aScore = 100;
          }
        }
        
        detailedRoundResults[category] = { 
          playerScore: pScore, 
          aiScore: aScore, 
          playerResponse: playerResponseRaw, // Guardar respuesta original para mostrar
          aiResponse: aiResponseRaw // Guardar respuesta original para mostrar
        };
        currentRoundPlayerScore += pScore;
        currentRoundAiScore += aScore;
      });

      setPlayerRoundScore(currentRoundPlayerScore);
      setAiRoundScore(currentRoundAiScore);
      setTotalPlayerScore(prev => prev + currentRoundPlayerScore);
      setTotalAiScore(prev => prev + currentRoundAiScore);
      setRoundResults(detailedRoundResults);

      if (currentRoundPlayerScore > currentRoundAiScore) {
        setRoundWinner("¡Jugador Gana la Ronda!");
      } else if (currentRoundAiScore > currentRoundPlayerScore) {
        setRoundWinner("¡IA Gana la Ronda!");
      } else if (currentRoundPlayerScore > 0 || currentRoundAiScore > 0) { // Empate pero alguien puntuó
        setRoundWinner("¡Empate en la Ronda!");
      } else { // Nadie puntuó
        setRoundWinner("Nadie puntuó en esta ronda.");
      }

    } catch (error) {
      console.error("Error al procesar respuestas de IA o puntuaciones:", error);
       toast({
        title: "Error de IA o Puntuación",
        description: "Algunas respuestas o puntuaciones no pudieron procesarse. Por favor, revisa los resultados.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
      setGameState("RESULTS");
    }
  }, [currentLetter, playerResponses, toast]);

  const startNextRound = useCallback(() => {
    // No reiniciar puntuaciones totales aquí, solo las de la ronda
    startGame();
  }, [startGame]);

  const handleShareToWhatsApp = () => {
    const playerName = user?.displayName ? `${user.displayName} jugó` : "Acabo de jugar a";
    const message = 
      `${playerName} Global Stop! 🕹️\n\n` +
      `Mi puntuación total: ${totalPlayerScore}\n` +
      `Puntuación total de la IA: ${totalAiScore}\n\n` +
      `¿Crees que puedes superarme? ¡Inténtalo en Global Stop!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
                onInputChange={handleInputChange}
                isEvaluating={gameState === "EVALUATING" || isLoadingAi}
                showResults={gameState === "RESULTS"}
                roundResults={roundResults} 
              />
            </div>
          )}
          
          {gameState === "PLAYING" && (
            <div className="flex justify-center animate-fadeInUp mt-6">
              <StopButton onClick={handleStop} />
            </div>
          )}

          {gameState === "EVALUATING" && (
            <Card className="shadow-xl rounded-lg animate-fadeIn p-8 mt-6">
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-primary">IA está Pensando y Calculando Puntos...</p>
                <p className="text-muted-foreground">Por favor, espera mientras la IA prepara sus respuestas y calculamos las puntuaciones.</p>
              </CardContent>
            </Card>
          )}

          {gameState === "RESULTS" && (
            <>
              <Card className="shadow-xl rounded-lg animate-fadeInUp mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-center text-primary">Resultados de la Ronda</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3 p-6">
                  {roundWinner && <p className="text-xl font-bold text-accent">{roundWinner}</p>}
                  <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                        <p>Tu Puntuación (Ronda):</p>
                        <p className="font-bold text-primary text-2xl">{playerRoundScore}</p>
                    </div>
                    <div>
                        <p>Puntuación IA (Ronda):</p>
                        <p className="font-bold text-primary text-2xl">{aiRoundScore}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xl font-semibold">Puntuación Total Acumulada</p>
                  <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                        <p>Tú:</p>
                        <p className="font-bold text-primary text-2xl">{totalPlayerScore}</p>
                    </div>
                    <div>
                        <p>IA:</p>
                        <p className="font-bold text-primary text-2xl">{totalAiScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fadeInUp mt-6">
                <Button 
                  onClick={startNextRound} 
                  size="lg" 
                  className="text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg 
                            transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                            focus-visible:ring-4 focus-visible:ring-primary/50 rounded-lg w-full sm:w-auto"
                >
                  <RotateCcw className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                  Jugar Siguiente Ronda
                </Button>
                <Button 
                  onClick={handleShareToWhatsApp} 
                  size="lg" 
                  variant="outline"
                  className="text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 border-accent text-accent-foreground hover:bg-accent/10 shadow-lg 
                            transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                            focus-visible:ring-4 focus-visible:ring-accent/50 rounded-lg w-full sm:w-auto"
                >
                  <Share2 className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                  Compartir Puntuación
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <AppFooter />
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards; /* Added forwards to maintain end state */
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

