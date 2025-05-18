
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RouletteWheel } from '@/components/game/roulette-wheel';
import { GameArea } from '@/components/game/game-area';
import { StopButton } from '@/components/game/stop-button';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { generateAiOpponentResponse, type AiOpponentResponseInput } from '@/ai/flows/generate-ai-opponent-response';
import { validatePlayerWord, type ValidatePlayerWordInput, type ValidatePlayerWordOutput } from '@/ai/flows/validate-player-word-flow';
import { Loader2, PlayCircle, RotateCcw, Share2, Copy, Trophy, Users, BarChart3, PlusCircle, LogIn, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { PersonalHighScoreCard } from '@/components/game/personal-high-score-card';
import { GlobalLeaderboardCard } from '@/components/game/global-leaderboard-card';
import { FriendsLeaderboardCard } from '@/components/game/friends-leaderboard-card';
import { Progress } from '@/components/ui/progress';

type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";
const CATEGORIES = ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROUND_DURATION_SECONDS = 60; // Duración de la ronda en segundos

export interface PlayerScore {
  name: string;
  score: number;
  avatar?: string;
}

export interface RoundResultDetail {
  playerScore: number;
  aiScore: number;
  playerResponse: string;
  aiResponse: string;
  playerResponseIsValid?: boolean; 
  playerResponseErrorReason?: 'format' | 'invalid_word' | 'api_error' | null;
}
export type RoundResults = Record<string, RoundResultDetail>;


export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [personalHighScore, setPersonalHighScore] = useState(0);

  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
  const [showJoinRoomDialog, setShowJoinRoomDialog] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState<string>("");

  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playerResponsesRef = useRef(playerResponses);
  const currentLetterRef = useRef(currentLetter);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    playerResponsesRef.current = playerResponses;
  }, [playerResponses]);

  useEffect(() => {
    currentLetterRef.current = currentLetter;
  }, [currentLetter]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);


  const exampleGlobalLeaderboard: PlayerScore[] = [
    { name: "Jugador Estrella", score: 12500 },
    { name: "ReyDelStop", score: 11800 },
    { name: "LetrasVeloces", score: 10500 },
    { name: "ProPlayer123", score: 9800 },
    { name: "Ana S.", score: 9200 },
  ];

  const exampleFriendsLeaderboard: PlayerScore[] = [
    { name: "Amigo Juan", score: 7500 },
    { name: "Vecina Sofia", score: 6800 },
    { name: "Compañero Alex", score: 6500 },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/music/tension-music.mp3'); 
      audioRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (gameState === "PLAYING" && currentLetter) {
        audioRef.current.currentTime = 0; 
        audioRef.current.play().catch(error => console.error("Error al reproducir audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [gameState, currentLetter]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('globalStopHighScore');
    if (storedHighScore) {
      setPersonalHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (totalPlayerScore > personalHighScore) {
      setPersonalHighScore(totalPlayerScore);
      localStorage.setItem('globalStopHighScore', totalPlayerScore.toString());
    }
  }, [totalPlayerScore, personalHighScore]);


  const resetRound = useCallback(() => {
    setPlayerResponses({});
    setAiResponses({});
    setPlayerRoundScore(0);
    setAiRoundScore(0);
    setRoundResults(null);
    setRoundWinner(null);
    setTimeLeft(ROUND_DURATION_SECONDS);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    if (gameStateRef.current === "IDLE") { 
        setTotalPlayerScore(0);
        setTotalAiScore(0);
    }
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

  const handleStopInternal = useCallback(async () => {
    const letterForValidation = currentLetterRef.current;
    const currentResponses = playerResponsesRef.current;
    
    console.log(`[GamePage] handleStopInternal triggered. Current Letter: ${letterForValidation}, Game State: ${gameStateRef.current}`);

    if (!letterForValidation || gameStateRef.current === "EVALUATING") {
      console.log("[GamePage] handleStopInternal: Aborting - No letter or already evaluating.");
      return;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setGameState("EVALUATING");
    setIsLoadingAi(true);
    
    console.log("[GamePage] Generating AI responses...");
    const tempAiResponses: Record<string, string> = {};
    const aiPromises = CATEGORIES.map(async (category) => {
      try {
        const aiInput: AiOpponentResponseInput = { letter: letterForValidation, category };
        const aiResult = await generateAiOpponentResponse(aiInput);
        tempAiResponses[category] = aiResult.response;
        console.log(`[GamePage] AI response for ${category} (letter ${letterForValidation}): "${aiResult.response}"`);
      } catch (error) {
        console.error(`[GamePage] Error getting AI response for ${category}:`, error);
        tempAiResponses[category] = ""; 
      }
    });

    await Promise.all(aiPromises);
    setAiResponses(tempAiResponses); 
    console.log("[GamePage] AI responses generated:", tempAiResponses);

    console.log("[GamePage] Iniciando validación de palabras del jugador...");
    const playerValidationPromises = CATEGORIES.map(async (category) => {
      const playerResponse = (currentResponses[category] || "").trim();
      
      console.log(`[GamePage] Validando para Categoría: ${category}, Player Word: "${playerResponse}", Required Letter: "${letterForValidation!}"`);

      if (playerResponse === "") {
        console.log(`[GamePage] Player word for ${category} is empty. Marking as invalid locally.`);
        return { category, isValid: false, errorReason: null }; 
      }
      if (!playerResponse.toLowerCase().startsWith(letterForValidation!.toLowerCase())) {
        console.log(`[GamePage] Player word "${playerResponse}" for ${category} does not start with letter "${letterForValidation!}" (frontend check). Marking as invalid locally.`);
        return { category, isValid: false, errorReason: 'format' as 'format' }; 
      }
      try {
        const validationInput: ValidatePlayerWordInput = {
          letter: letterForValidation!,
          category, 
          playerWord: playerResponse,
        };
        console.log(`[GamePage] Calling validatePlayerWord for ${category} with input:`, validationInput);
        const validationResult = await validatePlayerWord(validationInput);
        console.log(`[GamePage] Result from validatePlayerWord for ${category} ("${playerResponse}"): ${JSON.stringify(validationResult)}`);
        return { category, isValid: validationResult.isValid, errorReason: validationResult.isValid ? null : 'invalid_word' as 'invalid_word'};
      } catch (error) {
        console.error(`[GamePage] Error validating player word for ${category} ("${playerResponse}"):`, error);
        return { category, isValid: false, errorReason: 'api_error' as 'api_error' }; 
      }
    });

    const playerValidationResults = await Promise.all(playerValidationPromises);
    console.log("[GamePage] Raw playerValidationResults from promises:", JSON.stringify(playerValidationResults, null, 2));
    
    const playerWordValidity: Record<string, {isValid: boolean, errorReason: RoundResultDetail['playerResponseErrorReason']}> = {};
    playerValidationResults.forEach(res => {
      if (res && typeof res.category === 'string') { 
         playerWordValidity[res.category] = {isValid: res.isValid, errorReason: res.errorReason};
      } else {
        console.warn("[GamePage] Invalid result structure in playerValidationResults, skipping:", res);
      }
    });
    console.log("[GamePage] Constructed playerWordValidity object:", JSON.stringify(playerWordValidity, null, 2));


    let currentRoundPlayerScore = 0;
    let currentRoundAiScore = 0;
    const detailedRoundResults: RoundResults = {};

    console.log(`\n[GamePage] --- STARTING SCORE CALCULATION FOR LETTER: ${letterForValidation} ---`);
    CATEGORIES.forEach(category => {
      console.log(`\n[GamePage] Processing Category: "${category}"`);
      const playerResponseRaw = currentResponses[category] || "";
      const playerResponseTrimmed = playerResponseRaw.trim();
      
      const aiResponseRaw = tempAiResponses[category] || ""; 
      const aiResponseTrimmed = aiResponseRaw.trim();
      
      console.log(`  [GamePage] Player Response (Raw): "${playerResponseRaw}", Trimmed: "${playerResponseTrimmed}"`);
      console.log(`  [GamePage] AI Response (Raw): "${aiResponseRaw}", Trimmed: "${aiResponseTrimmed}"`);

      const validationStatus = playerWordValidity[category];
      // DETAILED LOG FOR VALIDATION STATUS
      console.log(`  [GamePage] DEBUG: Category: "${category}", playerWordValidity[category] is:`, JSON.stringify(validationStatus));

      const isPlayerWordValidatedByAI = validationStatus ? validationStatus.isValid : false; 
      console.log(`  [GamePage] isPlayerWordValidatedByAI (from Genkit flow): ${isPlayerWordValidatedByAI}`);
      
      let pScore = 0;
      let aScore = 0;

      const playerPassesFormatCheck = playerResponseTrimmed !== "" && playerResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      console.log(`  [GamePage] playerPassesFormatCheck (frontend check: not empty, starts with letter): ${playerPassesFormatCheck}`);
      
      const isPlayerResponseConsideredValid = playerPassesFormatCheck && isPlayerWordValidatedByAI;
      console.log(`  [GamePage] isPlayerResponseConsideredValid (passes format AND AI validation): ${isPlayerResponseConsideredValid}`);
      
      const isAiResponseValid = aiResponseTrimmed !== "" && aiResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      console.log(`  [GamePage] isAiResponseValid (AI not empty, starts with letter): ${isAiResponseValid}`);

      if (isPlayerResponseConsideredValid && !isAiResponseValid) {
        pScore = 100;
        console.log(`  [GamePage] Condition: Player valid, AI not. Player gets 100.`);
      } else if (!isPlayerResponseConsideredValid && isAiResponseValid) {
        aScore = 100;
        console.log(`  [GamePage] Condition: Player not valid, AI valid. AI gets 100.`);
      } else if (isPlayerResponseConsideredValid && isAiResponseValid) {
        if (playerResponseTrimmed.toLowerCase() === aiResponseTrimmed.toLowerCase()) {
          pScore = 50;
          aScore = 50;
          console.log(`  [GamePage] Condition: Both valid, same response. Player 50, AI 50.`);
        } else {
          pScore = 100;
          aScore = 100;
          console.log(`  [GamePage] Condition: Both valid, different responses. Player 100, AI 100.`);
        }
      } else {
         console.log(`  [GamePage] Condition: Neither player nor AI has a valid response according to rules, or one is invalid and the other empty/invalid. Both 0.`);
      }
      
      detailedRoundResults[category] = { 
        playerScore: pScore, 
        aiScore: aScore, 
        playerResponse: playerResponseRaw, 
        aiResponse: aiResponseRaw,       
        playerResponseIsValid: isPlayerWordValidatedByAI, 
        playerResponseErrorReason: validationStatus ? validationStatus.errorReason : (playerPassesFormatCheck ? null : 'format'),
      };
      console.log(`  [GamePage] Scores for "${category}" -> Player: ${pScore}, AI: ${aScore}`);
      currentRoundPlayerScore += pScore;
      currentRoundAiScore += aScore;
    });
    console.log(`[GamePage] --- END OF SCORE CALCULATION ---`);
    console.log(`[GamePage] Total Player Round Score: ${currentRoundPlayerScore}, Total AI Round Score: ${currentRoundAiScore}`);

    setPlayerRoundScore(currentRoundPlayerScore);
    setAiRoundScore(currentRoundAiScore);
    setTotalPlayerScore(prev => prev + currentRoundPlayerScore);
    setTotalAiScore(prev => prev + currentRoundAiScore);
    setRoundResults(detailedRoundResults);

    if (currentRoundPlayerScore > currentRoundAiScore) {
      setRoundWinner("¡Jugador Gana la Ronda!");
    } else if (currentRoundAiScore > currentRoundPlayerScore) {
      setRoundWinner("¡IA Gana la Ronda!");
    } else if (currentRoundPlayerScore === 0 && currentRoundAiScore === 0) {
      setRoundWinner("Nadie puntuó en esta ronda.");
    } else { 
      setRoundWinner("¡Empate en la Ronda!");
    }

    setIsLoadingAi(false);
    setGameState("RESULTS");

  }, [ 
    setGameState, setIsLoadingAi, setAiResponses, 
    setPlayerRoundScore, setAiRoundScore, setTotalPlayerScore, setTotalAiScore, 
    setRoundResults, setRoundWinner, toast
  ]);

  const handleStop = useCallback(() => {
    handleStopInternal();
  }, [handleStopInternal]);

  useEffect(() => {
    if (gameState === "PLAYING" && currentLetter) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); 
      setTimeLeft(ROUND_DURATION_SECONDS); 

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            handleStop(); 
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => { 
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState, currentLetter, handleStop]); 


  const startNextRound = useCallback(() => {
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

  const handleShareGameLink = async () => {
    try {
      const gameUrl = window.location.href;
      await navigator.clipboard.writeText(gameUrl);
      toast({
        title: "¡Enlace Copiado!",
        description: "El enlace del juego ha sido copiado a tu portapapeles. ¡Compártelo con tus amigos!",
      });
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
      toast({
        title: "Error al Copiar",
        description: "No se pudo copiar el enlace. Por favor, inténtalo manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreateRoomDialog = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedRoomId(newRoomId);
    setShowCreateRoomDialog(true);
  };

  const handleOpenJoinRoomDialog = () => {
    setJoinRoomId(""); 
    setShowJoinRoomDialog(true);
  };
  
  const handleActualJoinRoom = () => {
    if (joinRoomId.trim() === "") {
      toast({ title: "ID de Sala Vacío", description: "Por favor, ingresa un ID de sala para unirte.", variant: "destructive" });
      return;
    }
    toast({ title: "Intentando Unirse a Sala", description: `Te unirías a la sala: ${joinRoomId}. (Funcionalidad no implementada aún)`, duration: 5000 });
    setShowJoinRoomDialog(false);
  };

  const copyRoomIdToClipboard = async () => {
    if (generatedRoomId) {
      try {
        await navigator.clipboard.writeText(generatedRoomId);
        toast({
          title: "¡ID de Sala Copiado!",
          description: "El ID ha sido copiado. ¡Compártelo con tus amigos!",
        });
      } catch (err) {
        toast({
          title: "Error al Copiar ID",
          description: "No se pudo copiar el ID. Por favor, cópialo manualmente.",
          variant: "destructive",
        });
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-6">
          {gameState === "IDLE" && (
            <>
              <Card className="shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
                <CardHeader className="text-center p-8">
                  <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">¡Bienvenido a Global Stop!</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-3">
                    Elige cómo quieres jugar:
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-10 px-6">
                  <Button 
                    onClick={startGame} 
                    size="lg" 
                    className="text-xl px-10 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg 
                              transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                              focus-visible:ring-4 focus-visible:ring-primary/50 rounded-lg w-full"
                  >
                    <PlayCircle className="mr-3 h-7 w-7" />
                    Jugar vs IA
                  </Button>
                  <Button 
                    onClick={handleOpenCreateRoomDialog}
                    size="lg" 
                    variant="outline"
                    className="text-xl px-10 py-8 border-accent text-accent-foreground hover:bg-accent/10 shadow-lg 
                              transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                              focus-visible:ring-4 focus-visible:ring-accent/50 rounded-lg w-full"
                  >
                    <PlusCircle className="mr-3 h-7 w-7" />
                    Crear Sala (Amigos)
                  </Button>
                   <Button 
                    onClick={handleOpenJoinRoomDialog}
                    size="lg" 
                    variant="outline"
                    className="text-xl px-10 py-8 border-secondary text-secondary-foreground hover:bg-secondary/10 shadow-lg 
                              transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                              focus-visible:ring-4 focus-visible:ring-secondary/50 rounded-lg w-full"
                  >
                    <LogIn className="mr-3 h-7 w-7" />
                    Unirse a Sala
                  </Button>
                  <Button 
                    onClick={handleShareGameLink} 
                    size="lg" 
                    variant="ghost"
                    className="text-xl px-10 py-8 text-muted-foreground hover:bg-muted/20 shadow-md 
                              transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                              focus-visible:ring-4 focus-visible:ring-muted/50 rounded-lg w-full"
                  >
                    <Share2 className="mr-3 h-7 w-7" />
                    Compartir Juego
                  </Button>
                </CardContent>
                 <CardFooter className="text-xs text-muted-foreground text-center block px-6 pb-6">
                   La opción "Crear Sala" y "Unirse a Sala" son para la futura funcionalidad multijugador. Por ahora, solo se muestra la interfaz.
                </CardFooter>
              </Card>
              <PersonalHighScoreCard highScore={personalHighScore} />
              <GlobalLeaderboardCard leaderboardData={exampleGlobalLeaderboard} />
              <FriendsLeaderboardCard leaderboardData={exampleFriendsLeaderboard} />
            </>
          )}

          <AlertDialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¡Sala Creada (Simulación)!</AlertDialogTitle>
                <AlertDialogDescription>
                  Comparte este ID con tus amigos para que se unan a tu sala.
                  Recuerda, esta es una simulación, la conexión multijugador aún no está activa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground">ID de Sala:</p>
                <p className="text-2xl font-bold text-primary tracking-widest">{generatedRoomId}</p>
                 <Button variant="outline" size="sm" onClick={copyRoomIdToClipboard} className="mt-2">
                  <Copy className="mr-2 h-4 w-4" /> Copiar ID
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cerrar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showJoinRoomDialog} onOpenChange={setShowJoinRoomDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unirse a una Sala (Simulación)</AlertDialogTitle>
                <AlertDialogDescription>
                  Ingresa el ID de la sala a la que quieres unirte.
                  La conexión multijugador aún no está activa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 space-y-2">
                <Label htmlFor="join-room-id" className="text-primary">ID de la Sala</Label>
                <Input 
                  id="join-room-id" 
                  placeholder="Ej: ABC123XYZ" 
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="text-lg"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleActualJoinRoom}>Unirse</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          {gameState === "SPINNING" && (
            <div className="animate-fadeIn">
              <RouletteWheel isSpinning={true} onSpinComplete={handleSpinComplete} alphabet={ALPHABET} />
            </div>
          )}

          {gameState === "PLAYING" && currentLetter && (
            <div className="my-4 w-full max-w-md text-center p-4 bg-card rounded-lg shadow animate-fadeIn">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                <p className="text-2xl font-semibold text-primary">Tiempo Restante: {timeLeft}s</p>
              </div>
              <Progress value={(timeLeft / ROUND_DURATION_SECONDS) * 100} className="w-full h-3 mb-2" />
              {timeLeft <= 10 && timeLeft > 0 && (
                  <p className="text-destructive font-medium mt-1 animate-pulse">¡El tiempo se acaba!</p>
              )}
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "EVALUATING" || gameState === "RESULTS") && currentLetter && (
             <div className="animate-fadeIn w-full">
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
              <StopButton onClick={handleStop} disabled={isLoadingAi || timeLeft <= 0} />
            </div>
          )}

          {gameState === "EVALUATING" && (
            <Card className="shadow-xl rounded-lg animate-fadeIn p-8 mt-6 w-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-primary">IA está Pensando, Validando y Calculando Puntos...</p>
                <p className="text-muted-foreground">Por favor, espera mientras la IA prepara sus respuestas, validamos las tuyas y calculamos las puntuaciones.</p>
              </CardContent>
            </Card>
          )}

          {gameState === "RESULTS" && (
            <>
              <Card className="shadow-xl rounded-lg animate-fadeInUp mt-6 w-full">
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
              <PersonalHighScoreCard highScore={personalHighScore} className="animate-fadeInUp" />
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
              <GlobalLeaderboardCard leaderboardData={exampleGlobalLeaderboard} className="animate-fadeInUp" />
              <FriendsLeaderboardCard leaderboardData={exampleFriendsLeaderboard} className="animate-fadeInUp" />
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
          animation: fadeInUp 0.5s ease-out forwards;
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

