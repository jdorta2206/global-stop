
"use client";

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image from next/image
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
import { Loader2, PlayCircle, RotateCcw, Share2, Copy, Trophy, Users, BarChart3, PlusCircle, LogIn, Clock, AlertTriangle, MessageSquare, ArrowRight, LogOut, Link as LinkIcon, Gamepad2, PartyPopper, UserPlus, Sword, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage, type Language, type LanguageOption } from '@/contexts/language-context';
import { useRoom } from '@/contexts/room-context';
import { PersonalHighScoreCard } from '@/components/game/personal-high-score-card';
import { GlobalLeaderboardCard } from '@/components/game/global-leaderboard-card';
import { FriendsLeaderboardCard } from '@/components/game/friends-leaderboard-card';
import { Progress } from '@/components/ui/progress';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { EnrichedPlayerScore } from '@/components/game/leaderboard-table';
// Removed Firebase imports as they are not directly used in page.tsx anymore for game logic
// import { getDatabase, ref, onValue, update, serverTimestamp, set, off, push, child, remove } from "firebase/database";
// import { app as firebaseApp } from '@/lib/firebase/config'; // Renamed to avoid conflict
import { UI_TEXTS } from '@/constants/ui-texts';


type GameState = "IDLE" | "SPINNING" | "PLAYING" | "EVALUATING" | "RESULTS";

const CATEGORIES_BY_LANG: Record<Language, string[]> = {
  es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura"],
  en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit or Vegetable"],
  fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit ou Légume"],
  pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta ou Legume"],
};
const ALPHABET_BY_LANG: Record<Language, string[]> = {
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  fr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  pt: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};
const ROUND_DURATION_SECONDS = 60;

export interface PlayerScore {
  name: string;
  score: number;
  avatar?: string;
  id?: string;
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

interface PlayerInLobby {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
}

const MOCK_PLAYERS_IN_LOBBY: Omit<PlayerInLobby, 'isCurrentUser' | 'isOnline'>[] = [
  { id: 'player2', name: 'Amigo Carlos', avatar: `https://placehold.co/40x40.png?text=C` },
  { id: 'player3', name: 'Compañera Ana', avatar: `https://placehold.co/40x40.png?text=A` },
  { id: 'player4', name: 'Vecina Laura', avatar: `https://placehold.co/40x40.png?text=L` },
];

// const db = getDatabase(firebaseApp); // Not used directly here anymore

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, setLanguage: setGlobalLanguage, translate } = useLanguage();
  const { activeRoomId, setActiveRoomId } = useRoom();
  const router = useRouter();

  const playerResponsesRef = useRef(playerResponses);
  const currentLetterRef = useRef(currentLetter);
  const gameStateRef = useRef(gameState);

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
  const [countdownWarningText, setCountdownWarningText] = useState<string>("");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownTickAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownUrgentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playersInLobby, setPlayersInLobby] = useState<PlayerInLobby[]>([]);
  const [friendsList, setFriendsList] = useState<PlayerScore[]>([]);

  const currentCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;
  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;

  useEffect(() => {
    playerResponsesRef.current = playerResponses;
  }, [playerResponses]);

  useEffect(() => {
    currentLetterRef.current = currentLetter;
  }, [currentLetter]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const storedFriends = localStorage.getItem('globalStopFriendsList');
    if (storedFriends) {
      try {
        let parsedFriends = JSON.parse(storedFriends) as PlayerScore[];
        if (Array.isArray(parsedFriends)) {
          parsedFriends = parsedFriends.map(f => ({
            ...f,
            id: (f.id && String(f.id).trim() !== "") ? String(f.id) : `friend-${f.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`
          }));
          setFriendsList(parsedFriends);
        }
      } catch (error) {
        console.error("Error parsing friends list from localStorage:", error);
        localStorage.removeItem('globalStopFriendsList');
      }
    }
  }, []);

  useEffect(() => {
    if (friendsList.length > 0 || localStorage.getItem('globalStopFriendsList')) {
      localStorage.setItem('globalStopFriendsList', JSON.stringify(friendsList));
    }
  }, [friendsList]);


  useEffect(() => {
    if (activeRoomId && user) {
        const lobbyPlayersFromRoomContext: PlayerInLobby[] = [];
         lobbyPlayersFromRoomContext.push({
            id: user.uid,
            name: user.displayName || translate(UI_TEXTS.playerNameDefault),
            avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || translate(UI_TEXTS.playerNameDefault)).charAt(0)}`,
            isCurrentUser: true,
            isOnline: true,
        });
        MOCK_PLAYERS_IN_LOBBY.forEach(player => {
             lobbyPlayersFromRoomContext.push({ ...player, id: player.id || `mock-${Date.now()}`, isCurrentUser: false, isOnline: Math.random() > 0.5 });
        });
        setPlayersInLobby(lobbyPlayersFromRoomContext);

    } else if (!activeRoomId) {
        setPlayersInLobby([]);
    }
  }, [user, activeRoomId, language, translate]);


  const exampleGlobalLeaderboard: EnrichedPlayerScore[] = [
    { id: "global-player-1", name: "Star Player", score: 12500, avatar: "https://placehold.co/40x40.png?text=S" },
    { id: "global-player-2", name: "StopKing", score: 11800, avatar: "https://placehold.co/40x40.png?text=K" },
    { id: "global-player-3", name: "FastLetters", score: 10500, avatar: "https://placehold.co/40x40.png?text=F" },
    { id: "global-player-4", name: "ProPlayer123", score: 9800, avatar: "https://placehold.co/40x40.png?text=P" },
    { id: "global-player-5", name: "Ana S.", score: 9200, avatar: "https://placehold.co/40x40.png?text=A" },
  ];

  useEffect(() => {
    if (!activeRoomId) {
      const defaultPlayerName = user?.displayName || translate(UI_TEXTS.playerNameDefault);
      const defaultPlayerAvatar = user?.photoURL || `https://placehold.co/40x40.png?text=${defaultPlayerName.charAt(0)}`;
      setChatMessages([
          { id: 'system-1', text: translate(UI_TEXTS.chatLoginTitle), sender: { name: 'System', uid: 'system', avatar: 'https://placehold.co/40x40.png?text=S' }, timestamp: new Date(Date.now() - 120000) },
          { id: 'user-welcome-1', text: translate(UI_TEXTS.welcomeTitle), sender: { name: defaultPlayerName, uid: user?.uid || 'user-local', avatar: defaultPlayerAvatar }, timestamp: new Date(Date.now() - 60000) },
      ]);
    } else {
        setChatMessages([]);
    }
  }, [activeRoomId, language, user, translate]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!backgroundAudioRef.current) {
        backgroundAudioRef.current = new Audio('/music/2019-12-11_-_Retro_Platforming_-_David_Fesliyan.mp3');
        backgroundAudioRef.current.loop = true;
      }
      if (!countdownTickAudioRef.current) {
        // countdownTickAudioRef.current = new Audio('/music/countdown_tick.mp3');
      }
      if (!countdownUrgentAudioRef.current) {
        countdownUrgentAudioRef.current = new Audio('/music/countdown_urgent.mp3');
      }
    }
    return () => {
      backgroundAudioRef.current?.pause();
      countdownTickAudioRef.current?.pause();
      countdownUrgentAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (backgroundAudioRef.current) {
      if (gameState === "PLAYING" && currentLetter && !activeRoomId) {
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(error => console.error("Error playing background audio:", error));
      } else {
        backgroundAudioRef.current.pause();
      }
    }
  }, [gameState, currentLetter, activeRoomId]);

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
    setCountdownWarningText("");
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    if (gameStateRef.current === "IDLE" && !activeRoomId) {
        setTotalPlayerScore(0);
        setTotalAiScore(0);
    }
    resetRound();
    setGameState("SPINNING");
  }, [resetRound, activeRoomId]);

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
    const currentLang = language;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] [GamePage] handleStopInternal triggered. Current Letter: ${letterForValidation}, Game State: ${gameStateRef.current}, Lang: ${currentLang}`);

    if (!letterForValidation || gameStateRef.current === "EVALUATING") {
      console.log(`[${timestamp}] [GamePage] handleStopInternal: Aborting - No letter or already evaluating.`);
      return;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setGameState("EVALUATING");
    setIsLoadingAi(true);

    console.log(`[${timestamp}] [GamePage] Generating AI responses...`);
    const aiPromises = currentCategories.map(async (category) => {
      try {
        const aiInput: AiOpponentResponseInput = { letter: letterForValidation, category, language: currentLang };
        console.log(`[${timestamp}] [GamePage] Calling generateAiOpponentResponse for ${category} (letter ${letterForValidation}) with input:`, JSON.stringify(aiInput));
        const aiResult = await generateAiOpponentResponse(aiInput);
        console.log(`[${timestamp}] [GamePage] AI response for ${category} (letter ${letterForValidation}): "${aiResult.response}"`);
        return { category, response: aiResult.response };
      } catch (error) {
        console.error(`[${timestamp}] [GamePage] Error getting AI response for ${category}:`, error);
        return { category, response: "" };
      }
    });

    const aiResults = await Promise.all(aiPromises);
    const tempAiResponses = aiResults.reduce((acc, result) => {
      acc[result.category] = result.response;
      return acc;
    }, {} as Record<string, string>);
    console.log(`[${timestamp}] [GamePage] AI responses generated:`, JSON.stringify(tempAiResponses, null, 2));

    setAiResponses(tempAiResponses);

    console.log(`[${timestamp}] [GamePage] Initiating player word validation...`);
    const playerValidationPromises = currentCategories.map(async (category) => {
      const playerResponse = (currentResponses[category] || "").trim();
      console.log(`[${timestamp}] [GamePage] Validating for Category: ${category}, Player Word: "${playerResponse}", Required Letter: "${letterForValidation!}", Lang: ${currentLang}`);

      if (playerResponse === "") {
        return { category, isValid: false, errorReason: null };
      }
      if (!playerResponse.toLowerCase().startsWith(letterForValidation!.toLowerCase())) {
        console.warn(`[${timestamp}] [GamePage] Word "${playerResponse}" for category "${category}" does not start with letter "${letterForValidation!}". Marking as format error.`);
        return { category, isValid: false, errorReason: 'format' as 'format' };
      }
      try {
        const validationInput: ValidatePlayerWordInput = {
          letter: letterForValidation!,
          category,
          playerWord: playerResponse,
          language: currentLang,
        };
        console.log(`[${timestamp}] [GamePage] Calling validatePlayerWord for ${category} with input:`, JSON.stringify(validationInput));
        const validationResult: ValidatePlayerWordOutput = await validatePlayerWord(validationInput);
        console.log(`[${timestamp}] [GamePage] Result from validatePlayerWord for ${category} ("${playerResponse}"):`, JSON.stringify(validationResult));
        return { category, isValid: validationResult.isValid, errorReason: validationResult.isValid ? null : 'invalid_word' as 'invalid_word'};
      } catch (error) {
        console.error(`[${timestamp}] [GamePage] Error validating player word for ${category} ("${playerResponse}"):`, error);
        return { category, isValid: false, errorReason: 'api_error' as 'api_error' };
      }
    });

    const playerValidationResults = await Promise.all(playerValidationPromises);
    console.log(`[${timestamp}] [GamePage] Raw playerValidationResults from promises:`, JSON.stringify(playerValidationResults, null, 2));

    const playerWordValidity: Record<string, {isValid: boolean, errorReason: RoundResultDetail['playerResponseErrorReason']}> = {};
    playerValidationResults.forEach(res => {
      if (res && typeof res.category === 'string') {
         playerWordValidity[res.category] = {isValid: res.isValid, errorReason: res.errorReason};
      } else {
        console.warn(`[${timestamp}] [GamePage] Invalid result structure in playerValidationResults, skipping:`, res);
      }
    });
    console.log(`[${timestamp}] [GamePage] Constructed playerWordValidity object:`, JSON.stringify(playerWordValidity, null, 2));


    let currentRoundPlayerScore = 0;
    let currentRoundAiScore = 0;
    const detailedRoundResults: RoundResults = {};

    console.log(`\n[${timestamp}] [GamePage] --- STARTING SCORE CALCULATION FOR LETTER: ${letterForValidation} ---`);
    currentCategories.forEach(category => {
      console.log(`\n[${timestamp}] [GamePage] Processing Category: "${category}"`);
      const playerResponseRaw = currentResponses[category] || "";
      const playerResponseTrimmed = playerResponseRaw.trim();

      const aiResponseRaw = tempAiResponses[category] || "";
      const aiResponseTrimmed = aiResponseRaw.trim();

      const validationStatus = playerWordValidity[category]; // This can be undefined if category wasn't in results
      console.log(`  [${timestamp}] [GamePage] DEBUG: Category: "${category}", playerWordValidity[category] is:`, JSON.stringify(validationStatus));


      const playerPassesFormatCheck = playerResponseTrimmed !== "" && playerResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      const isPlayerWordValidatedByAI = validationStatus ? validationStatus.isValid : false;
      const isPlayerResponseConsideredValid = playerPassesFormatCheck && isPlayerWordValidatedByAI;
      const isAiResponseValid = aiResponseTrimmed !== "" && aiResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      
      console.log(`  [${timestamp}] [GamePage] Player Word: "${playerResponseTrimmed}", AI Word: "${aiResponseTrimmed}"`);
      console.log(`  [${timestamp}] [GamePage] playerPassesFormatCheck (frontend check...): ${playerPassesFormatCheck}`);
      console.log(`  [${timestamp}] [GamePage] isPlayerWordValidatedByAI (from Genkit flow): ${isPlayerWordValidatedByAI}`);
      console.log(`  [${timestamp}] [GamePage] isPlayerResponseConsideredValid (passes format AND AI validation): ${isPlayerResponseConsideredValid}`);
      console.log(`  [${timestamp}] [GamePage] isAiResponseValid (AI not empty, starts with letter): ${isAiResponseValid}`);


      let pScore = 0;
      let aScore = 0;

      if (isPlayerResponseConsideredValid && !isAiResponseValid) {
        pScore = 100;
      } else if (!isPlayerResponseConsideredValid && isAiResponseValid) {
        aScore = 100;
      } else if (isPlayerResponseConsideredValid && isAiResponseValid) {
        if (playerResponseTrimmed.toLowerCase() === aiResponseTrimmed.toLowerCase()) {
          pScore = 50;
          aScore = 50;
        } else {
          pScore = 100;
          aScore = 100;
        }
      }
      console.log(`  [${timestamp}] [GamePage] Scores for "${category}" -> Player: ${pScore}, AI: ${aScore}`);

      detailedRoundResults[category] = {
        playerScore: pScore,
        aiScore: aScore,
        playerResponse: playerResponseRaw,
        aiResponse: aiResponseRaw,
        playerResponseIsValid: isPlayerWordValidatedByAI, // Use the validated status
        playerResponseErrorReason: validationStatus ? validationStatus.errorReason : (playerPassesFormatCheck ? null : 'format'),
      };
      currentRoundPlayerScore += pScore;
      currentRoundAiScore += aScore;
    });

    console.log(`[${timestamp}] [GamePage] Total Player Round Score: ${currentRoundPlayerScore}, Total AI Round Score: ${currentRoundAiScore}`);
    setPlayerRoundScore(currentRoundPlayerScore);
    setAiRoundScore(currentRoundAiScore);
    setTotalPlayerScore(prev => prev + currentRoundPlayerScore);
    setTotalAiScore(prev => prev + currentRoundAiScore);
    setRoundResults(detailedRoundResults);

    if (currentRoundPlayerScore > currentRoundAiScore) {
      setRoundWinner(translate(UI_TEXTS.roundWinnerPlayer));
    } else if (currentRoundAiScore > currentRoundPlayerScore) {
      setRoundWinner(translate(UI_TEXTS.roundWinnerAI));
    } else if (currentRoundPlayerScore === 0 && currentRoundAiScore === 0) {
      setRoundWinner(translate(UI_TEXTS.roundNoScore));
    } else {
      setRoundWinner(translate(UI_TEXTS.roundTie));
    }

    setIsLoadingAi(false);
    setGameState("RESULTS");

  }, [
    currentCategories, language,
    setGameState, setIsLoadingAi, setAiResponses,
    setPlayerRoundScore, setAiRoundScore, setTotalPlayerScore, setTotalAiScore,
    setRoundResults, setRoundWinner, toast, translate
  ]);

  const handleStop = useCallback(() => {
    handleStopInternal();
  }, [handleStopInternal]);

  useEffect(() => {
    if (gameState === "PLAYING" && currentLetter && !activeRoomId) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimeLeft(ROUND_DURATION_SECONDS);
      setCountdownWarningText("");

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            handleStop();
            return 0;
          }

          if (prevTime === 11) {
            setCountdownWarningText(translate(UI_TEXTS.timeEndingSoon));
            countdownUrgentAudioRef.current?.play().catch(e => console.error("Error playing urgent audio:", e));
          } else if (prevTime === 6) {
            setCountdownWarningText(translate(UI_TEXTS.timeAlmostUp));
            countdownUrgentAudioRef.current?.play().catch(e => console.error("Error playing urgent audio:", e));
          } else if (prevTime === 4) {
            setCountdownWarningText(translate(UI_TEXTS.timeFinalCountdown));
            countdownUrgentAudioRef.current?.play().catch(e => console.error("Error playing urgent audio:", e));
          } else if (prevTime > 10) {
            setCountdownWarningText("");
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setCountdownWarningText("");
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState, currentLetter, handleStop, translate, activeRoomId]);


  const startNextRound = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleShareScoreToWhatsApp = () => {
    const playerName = user?.displayName ? `${user.displayName} ${translate(UI_TEXTS.playedText)}` : translate(UI_TEXTS.iJustPlayed);
    const message =
      `${playerName} Global Stop! 🕹️\n\n` +
      `${translate(UI_TEXTS.myTotalScore)}: ${totalPlayerScore}\n` +
      `${translate(UI_TEXTS.aiTotalScore)}: ${totalAiScore}\n\n` +
      translate(UI_TEXTS.canYouBeatMe);

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareGameViaWhatsApp = () => {
    const gameUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `${translate(UI_TEXTS.shareGameMessageWhatsApp)} ${gameUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOpenCreateRoomDialog = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedRoomId(newRoomId);
    setShowCreateRoomDialog(true);
  };

  const handleGoToCreatedRoom = () => {
    if (generatedRoomId) {
      setActiveRoomId(generatedRoomId);
      router.push(`/room/${generatedRoomId}`);
      setShowCreateRoomDialog(false);
    }
  };

  const handleOpenJoinRoomDialog = () => {
    setJoinRoomId("");
    setShowJoinRoomDialog(true);
  };

  const handleActualJoinRoom = () => {
    if (joinRoomId.trim() === "") {
      toast({ title: translate(UI_TEXTS.emptyRoomIdToastTitle), description: translate(UI_TEXTS.emptyRoomIdToastDescription), variant: "destructive" });
      return;
    }
    const roomIdToJoin = joinRoomId.trim().toUpperCase();
    setActiveRoomId(roomIdToJoin);
    router.push(`/room/${roomIdToJoin}`);
    setShowJoinRoomDialog(false);
  };

  const copyRoomIdToClipboard = async () => {
    if (generatedRoomId) {
      try {
        await navigator.clipboard.writeText(generatedRoomId);
        toast({
          title: translate(UI_TEXTS.idCopiedToastTitle),
          description: translate(UI_TEXTS.idCopiedToastDescription),
        });
      } catch (err) {
        toast({
          title: translate(UI_TEXTS.errorCopyingIdToastTitle),
          description: translate(UI_TEXTS.errorCopyingIdToastDescription),
          variant: "destructive",
        });
      }
    }
  };

  const handleLeaveRoomLobby = () => {
    if (user && activeRoomId) {
        // No direct Firebase update here; RoomPage manages player presence on its side.
    }
    setActiveRoomId(null);
    setPlayersInLobby([]);
    setGameState("IDLE");
    router.push('/');
  };

  const handleInviteFriendsLobby = () => {
    if (activeRoomId) {
      const roomUrl = `${window.location.origin}/room/${activeRoomId}`;
      const message = `${translate(UI_TEXTS.shareRoomLinkMessageWhatsApp)} ${activeRoomId}. ${translate(UI_TEXTS.joinHere)} ${roomUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCopyRoomLinkLobby = () => {
    if (activeRoomId) {
        const roomUrl = `${window.location.origin}/room/${activeRoomId}`;
        navigator.clipboard.writeText(roomUrl).then(() => {
            toast({
            title: translate(UI_TEXTS.roomLinkCopiedToastTitle),
            description: translate(UI_TEXTS.roomLinkCopiedToastDescription),
            });
        }).catch(() => {
            toast({
            title: translate(UI_TEXTS.errorCopyingLinkToastTitle),
            description: translate(UI_TEXTS.errorCopyingLinkToastDescription),
            variant: "destructive",
            });
        });
    }
  };

  const handleAddFriend = (player: PlayerInLobby) => {
    if (!user) {
      toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
      return;
    }
    if (player.id === user.uid) {
        toast({ title: translate(UI_TEXTS.cannotAddSelfTitle), description: translate(UI_TEXTS.cannotAddSelfDescription), variant: "default" });
        return;
    }

    const friendExists = friendsList.some(friend => (friend.id && friend.id === player.id) || friend.name === player.name);
    if (friendExists) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', player.name),
        variant: "default",
      });
      return;
    }
    const newFriend: PlayerScore = {
      id: (player.id && String(player.id).trim() !== "") ? String(player.id) : `mock-${player.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
      name: player.name,
      score: 0,
      avatar: player.avatar || `https://placehold.co/40x40.png?text=${player.name.charAt(0)}`,
    };
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
      title: translate(UI_TEXTS.friendAddedToastTitle),
      description: translate(UI_TEXTS.friendAddedToastDescription).replace('{name}', player.name),
    });
  };

  const handleAddFriendFromLeaderboard = (player: EnrichedPlayerScore) => {
    if (!user) {
        toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
        return;
    }
    if (player.id === user.uid) {
        toast({ title: translate(UI_TEXTS.cannotAddSelfTitle), description: translate(UI_TEXTS.cannotAddSelfDescription), variant: "default" });
        return;
    }
    const friendExists = friendsList.some(friend => (friend.id && friend.id === player.id) || friend.name === player.name);
    if (friendExists) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', player.name),
        variant: "default",
      });
      return;
    }
    const newFriend: PlayerScore = {
      id: (player.id && String(player.id).trim() !== "") ? String(player.id) : `global-${player.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2,7)}`,
      name: player.name,
      score: player.score,
      avatar: player.avatar,
    };
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
      title: translate(UI_TEXTS.friendAddedFromGlobalToastTitle),
      description: translate(UI_TEXTS.friendAddedFromGlobalToastDescription).replace('{name}', player.name),
    });
  };

  const handleChallengePlayer = (player: EnrichedPlayerScore) => {
    const playerId = (player.id && String(player.id).trim() !== "") ? String(player.id) : 'unknown';
    router.push(`/challenge-setup/${playerId}?name=${encodeURIComponent(player.name)}`);
  };

  const handleAddFriendManual = (identifier: string) => {
    if (!user) {
      toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
      return;
    }
    if (!identifier.trim()) {
      toast({ title: translate(UI_TEXTS.emptyIdentifierTitle), description: translate(UI_TEXTS.emptyIdentifierDescription), variant: "destructive"});
      return;
    }
    const trimmedIdentifier = identifier.trim();
    if (friendsList.some(friend => friend.name.toLowerCase() === trimmedIdentifier.toLowerCase())) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', trimmedIdentifier),
        variant: "default",
      });
      return;
    }
    const newFriendId = `manual-${trimmedIdentifier.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    const newFriend: PlayerScore = {
      id: newFriendId,
      name: trimmedIdentifier,
      score: 0,
      avatar: `https://placehold.co/40x40.png?text=${trimmedIdentifier.charAt(0).toUpperCase()}`,
    };
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
      title: translate(UI_TEXTS.friendManuallyAddedToastTitle),
      description: translate(UI_TEXTS.friendManuallyAddedToastDescription).replace('{name}', trimmedIdentifier),
    });
  };


  const handleSendChatMessageLocal = (text: string, roomId?: string | null) => { // Updated signature, roomId ignored here
    if (!user) {
      toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
      return;
    }
    const newMessage: ChatMessage = {
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        sender: {
            name: user.displayName || translate(UI_TEXTS.playerNameDefault),
            uid: user.uid,
            avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || translate(UI_TEXTS.playerNameDefault)).charAt(0)}`,
        },
        timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center relative">
        {(gameState === "PLAYING" || gameState === "RESULTS" || gameState === "IDLE") && (
            <Button
                onClick={toggleChat}
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/50 transform transition-all duration-150 ease-in-out hover:scale-110 active:scale-100"
                aria-label={translate(UI_TEXTS.openChatLabel)}
            >
                <MessageSquare className="h-7 w-7" />
            </Button>
        )}

        <div className="w-full max-w-2xl space-y-6">
          {gameState === "IDLE" && !activeRoomId && (
            <>
              <Card className="shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
                <CardHeader className="text-center p-8">
                  <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">{translate(UI_TEXTS.welcomeTitle)}</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-3">
                    {translate(UI_TEXTS.welcomeDescription)}
                  </CardDescription>
                  <div className="flex justify-center mt-4">
                    <Image
                      src="/logo_stop_game.png"
                      alt={translate(UI_TEXTS.logoAlt)}
                      width={150}
                      height={150}
                      className="rounded-lg shadow-md"
                      data-ai-hint="game logo"
                      priority
                    />
                  </div>
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
                    {translate(UI_TEXTS.playVsAI)}
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
                    {translate(UI_TEXTS.createRoom)}
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
                    {translate(UI_TEXTS.joinRoom)}
                  </Button>
                  <Button
                    onClick={handleShareGameViaWhatsApp}
                    size="lg"
                    variant="ghost"
                    className="text-xl px-10 py-8 text-muted-foreground hover:bg-muted/20 shadow-md
                              transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                              focus-visible:ring-4 focus-visible:ring-muted/50 rounded-lg w-full"
                  >
                    <Share2 className="mr-3 h-7 w-7" />
                    {translate(UI_TEXTS.shareGame)}
                  </Button>
                </CardContent>
              </Card>
              <PersonalHighScoreCard highScore={personalHighScore} language={language} />
              <GlobalLeaderboardCard
                leaderboardData={exampleGlobalLeaderboard}
                language={language}
                currentUserId={user?.uid}
                onAddFriend={handleAddFriendFromLeaderboard}
                onChallenge={handleChallengePlayer}
              />
              <FriendsLeaderboardCard
                leaderboardData={friendsList}
                language={language}
                currentUserId={user?.uid}
                onChallenge={handleChallengePlayer}
                onAddFriendManual={handleAddFriendManual}
              />
            </>
          )}

          {gameState === "IDLE" && activeRoomId && (
            <Card className="shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
              <CardHeader className="text-center p-6 sm:p-8">
                <div className="flex justify-center items-center mb-3">
                    <PartyPopper className="h-10 w-10 sm:h-12 sm:w-12 text-primary mr-2 sm:mr-3" />
                    <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">{translate(UI_TEXTS.lobbyTitle)}</CardTitle>
                </div>
                <CardDescription className="text-md sm:text-lg text-muted-foreground mt-2">
                  {translate(UI_TEXTS.inRoomMessage)} <span className="font-bold text-accent">{activeRoomId}</span>
                </CardDescription>
                 {user && <p className="text-sm sm:text-md text-muted-foreground mt-1">{translate(UI_TEXTS.loggedInAs).replace('{name}', user.displayName || translate(UI_TEXTS.playerNameDefault))}</p>}
              </CardHeader>
              <CardContent className="space-y-4 py-6 px-4 sm:px-6">
                 <div className="text-center">
                    <Button
                        size="lg"
                        className="w-full text-lg py-5 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                        onClick={() => {
                          if (!user) {
                            toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
                            return;
                          }
                          router.push(`/room/${activeRoomId}`);
                        }}
                        disabled={!user}
                    >
                        <Gamepad2 className="mr-2 h-5 w-5 sm:mr-3 sm:h-6 sm:w-6" />
                         {translate(UI_TEXTS.goToGameRoomButton)}
                    </Button>
                     <p className="text-xs text-muted-foreground mt-1 px-2">
                        {translate(UI_TEXTS.goToGameRoomDescription)}
                    </p>
                 </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleInviteFriendsLobby}
                      size="lg"
                      variant="outline"
                      className="w-full sm:flex-1 text-md sm:text-lg py-4 sm:py-5 border-accent text-accent-foreground hover:bg-accent/10 shadow-md"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      {translate(UI_TEXTS.inviteFriendsButton)} (WhatsApp)
                    </Button>
                    <Button
                      onClick={handleCopyRoomLinkLobby}
                      size="lg"
                      variant="outline"
                      className="w-full sm:flex-1 text-md sm:text-lg py-4 sm:py-5 border-secondary text-secondary-foreground hover:bg-secondary/10 shadow-md"
                    >
                      <LinkIcon className="mr-2 h-5 w-5" />
                      {translate(UI_TEXTS.copyRoomLinkButton)}
                    </Button>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-secondary mb-2 text-center flex items-center justify-center">
                      <Users className="mr-2 h-5 w-5" /> {translate(UI_TEXTS.playerListTitle)}
                    </h3>
                    <div className="p-3 sm:p-4 bg-muted/20 rounded-md min-h-[120px] space-y-2">
                      {playersInLobby.length > 0 ? (
                        playersInLobby.map(player => (
                          <div key={player.id} className="flex items-center justify-between p-2 bg-card/50 rounded shadow-sm">
                            <div className="flex items-center space-x-2">
                               <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatar || undefined} alt={player.name} data-ai-hint="avatar person"/>
                                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span
                                  className={cn(
                                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background",
                                    player.isOnline ? "bg-green-500" : "bg-gray-400"
                                  )}
                                  title={player.isOnline ? translate(UI_TEXTS.onlineStatus) : translate(UI_TEXTS.offlineStatus)}
                                />
                              </div>
                              <span className="text-sm text-card-foreground">
                                {player.name} {player.isCurrentUser && <span className="text-xs text-primary">{translate(UI_TEXTS.youSuffix)}</span>}
                              </span>
                            </div>
                            {!player.isCurrentUser && user && (
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAddFriend(player)}>
                                <UserPlus className="mr-1 h-3 w-3" /> {translate(UI_TEXTS.addFriendButton)}
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                         <p className="text-sm text-muted-foreground text-center py-2">{user ? translate(UI_TEXTS.waitingForPlayers) : translate(UI_TEXTS.chatLoginMessage) }</p>
                      )}
                        <p className="text-xs text-muted-foreground text-center pt-2">{translate(UI_TEXTS.playerListDescriptionLobby)}</p>
                    </div>
                  </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 border-t">
                <Button
                    onClick={handleLeaveRoomLobby}
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    {translate(UI_TEXTS.leaveRoomButton)}
                </Button>
              </CardFooter>
            </Card>
          )}


          <AlertDialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translate(UI_TEXTS.createRoomDialogTitle)}</AlertDialogTitle>
                <AlertDialogDescription>
                 {translate(UI_TEXTS.createRoomDialogDescription)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground">{translate(UI_TEXTS.roomIdLabel)}</p>
                <p className="text-2xl font-bold text-primary tracking-widest">{generatedRoomId}</p>
                 <Button variant="outline" size="sm" onClick={copyRoomIdToClipboard} className="mt-2">
                  <Copy className="mr-2 h-4 w-4" /> {translate(UI_TEXTS.copyIdButton)}
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowCreateRoomDialog(false)}>{translate(UI_TEXTS.closeButton)}</AlertDialogCancel>
                <AlertDialogAction onClick={handleGoToCreatedRoom}>
                  {translate(UI_TEXTS.goToRoomButton)} <ArrowRight className="ml-2 h-4 w-4" />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showJoinRoomDialog} onOpenChange={setShowJoinRoomDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translate(UI_TEXTS.joinRoomDialogTitle)}</AlertDialogTitle>
                <AlertDialogDescription>
                  {translate(UI_TEXTS.joinRoomDialogDescription)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 space-y-2">
                <Label htmlFor="join-room-id" className="text-primary">{translate(UI_TEXTS.joinRoomIdInputLabel)}</Label>
                <Input
                  id="join-room-id"
                  placeholder={translate(UI_TEXTS.joinRoomIdInputPlaceholder)}
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  className="text-lg"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowJoinRoomDialog(false)}>{translate(UI_TEXTS.cancelButton)}</AlertDialogCancel>
                <AlertDialogAction onClick={handleActualJoinRoom}>{translate(UI_TEXTS.joinButton)}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          {gameState === "SPINNING" && !activeRoomId && (
            <div className="animate-fadeIn">
              <RouletteWheel
                isSpinning={true}
                onSpinComplete={handleSpinComplete}
                alphabet={currentAlphabet}
                language={language}
              />
            </div>
          )}

          {gameState === "PLAYING" && currentLetter && !activeRoomId && (
            <div className="my-4 w-full max-w-md text-center p-4 bg-card rounded-lg shadow animate-fadeIn">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                <p className="text-2xl font-semibold text-primary">{translate(UI_TEXTS.timeLeftLabel)} {timeLeft}s</p>
              </div>
              <Progress value={(timeLeft / ROUND_DURATION_SECONDS) * 100} className="w-full h-3 mb-2" />
              {countdownWarningText && (
                  <p className="text-destructive font-medium mt-1 animate-pulse">{countdownWarningText}</p>
              )}
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "EVALUATING" || gameState === "RESULTS") && currentLetter && !activeRoomId && (
             <div className="animate-fadeIn w-full">
              <GameArea
                letter={currentLetter}
                categories={currentCategories}
                playerResponses={playerResponses}
                onInputChange={handleInputChange}
                isEvaluating={gameState === "EVALUATING" || isLoadingAi}
                showResults={gameState === "RESULTS"}
                roundResults={roundResults}
                language={language}
                gameMode="solo"
              />
            </div>
          )}

          {gameState === "PLAYING" && !activeRoomId && (
            <div className="flex justify-center animate-fadeInUp mt-6">
              <StopButton onClick={handleStop} disabled={isLoadingAi || timeLeft <= 0} language={language} />
            </div>
          )}

          {gameState === "EVALUATING" && !activeRoomId && (
            <Card className="shadow-xl rounded-lg animate-fadeIn p-8 mt-6 w-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-primary">{translate(UI_TEXTS.loadingAIMessage)}</p>
                <p className="text-muted-foreground">{translate(UI_TEXTS.loadingAIDescription)}</p>
              </CardContent>
            </Card>
          )}

          {gameState === "RESULTS" && roundResults && !activeRoomId && (
            <>
              <Card className="shadow-xl rounded-lg animate-fadeInUp mt-6 w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-center text-primary">{translate(UI_TEXTS.resultsTitle)}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3 p-6">
                  {roundWinner && <p className="text-xl font-bold text-accent">{roundWinner}</p>}
                  <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                        <p>{translate(UI_TEXTS.yourRoundScore)}</p>
                        <p className="font-bold text-primary text-2xl">{playerRoundScore}</p>
                    </div>
                    <div>
                        <p>{translate(UI_TEXTS.aiRoundScore)}</p>
                        <p className="font-bold text-primary text-2xl">{aiRoundScore}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xl font-semibold">{translate(UI_TEXTS.totalScoreLabel)}</p>
                  <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                        <p>{translate(UI_TEXTS.youLabel)}</p>
                        <p className="font-bold text-primary text-2xl">{totalPlayerScore}</p>
                    </div>
                    <div>
                        <p>{translate(UI_TEXTS.aiLabel)}</p>
                        <p className="font-bold text-primary text-2xl">{totalAiScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <PersonalHighScoreCard highScore={personalHighScore} className="animate-fadeInUp" language={language} />
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fadeInUp mt-6">
                <Button
                  onClick={startNextRound}
                  size="lg"
                  className="text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg
                            transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                            focus-visible:ring-4 focus-visible:ring-primary/50 rounded-lg w-full sm:w-auto"
                >
                  <RotateCcw className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                  {translate(UI_TEXTS.nextRoundButton)}
                </Button>
                <Button
                  onClick={handleShareScoreToWhatsApp}
                  size="lg"
                  variant="outline"
                  className="text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 border-accent text-accent-foreground hover:bg-accent/10 shadow-lg
                            transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                            focus-visible:ring-4 focus-visible:ring-accent/50 rounded-lg w-full sm:w-auto"
                >
                  <Share2 className="mr-2 sm:mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                  {translate(UI_TEXTS.shareScoreButton)}
                </Button>
              </div>
              <GlobalLeaderboardCard
                leaderboardData={exampleGlobalLeaderboard}
                className="animate-fadeInUp"
                language={language}
                currentUserId={user?.uid}
                onAddFriend={handleAddFriendFromLeaderboard}
                onChallenge={handleChallengePlayer}
              />
              <FriendsLeaderboardCard
                leaderboardData={friendsList}
                className="animate-fadeInUp"
                language={language}
                currentUserId={user?.uid}
                onChallenge={handleChallengePlayer}
                onAddFriendManual={handleAddFriendManual}
              />
            </>
          )}
        </div>
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendChatMessageLocal} // Use local sending if not in a room
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          currentUserUid={user?.uid}
          currentUserName={user?.displayName || translate(UI_TEXTS.playerNameDefault)}
          currentUserAvatar={user?.photoURL}
          language={language}
          currentRoomId={null} // This chat panel on main page is not tied to a DB room
        />
      </main>
      <AppFooter language={language} />
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

