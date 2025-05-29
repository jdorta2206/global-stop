"use client";

// Define ROUND_DURATION_SECONDS here
const ROUND_DURATION_SECONDS = 60; // Defaulting to 60 seconds

// Define PlayerScore interface
interface PlayerScore {
  id: string; // Make id mandatory
  name: string;
  score: number;
  avatar?: string;
}

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Assuming Link is needed for the join room button
import Image from 'next/image';
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
import { useRoomGameContext, type RoomGameContext } from '@/contexts/room-game-context'; // Import useRoomGameContext and RoomGameContextValue
import { PersonalHighScoreCard } from '@/components/game/personal-high-score-card';
import { GlobalLeaderboardCard } from '@/components/game/global-leaderboard-card';
import { FriendsLeaderboardCard } from '@/components/game/friends-leaderboard-card';
import { Progress } from '@/components/ui/progress';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { EnrichedPlayerScore } from '@/components/game/leaderboard-table';
import { db } from '@/lib/firebase/config';
import { ref, get, set, update } from 'firebase/database'; // Import Firebase functions
import { UI_TEXTS } from "@/constants/ui-texts";
import { useLanguage, type Language, type LanguageOption, type LanguageContextType } from '@/contexts/language-context'; // Assuming LanguageContextType is defined and exported here


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

export interface PlayerSubmission {
  playerId: string;
  answers: Record<string, string>;
  timestamp: number; // Server timestamp
}

export interface ValidatedWordInfo {
  playerWord: string;
  isValid: boolean;
  errorReason: 'format' | 'invalid_word' | 'api_error' | null;
}

// Corrected PlayerRoundOutcome interface
export interface PlayerRoundOutcome {
  totalScore: number;
  categories: Record<string, ValidatedWordInfo & { score: number }>;
  playerName: string; // Added
  playerAvatar?: string; // Added
};

export interface RoundResultDetail {
  playerScore: number;
  aiScore: number;
  playerResponse: string;
  aiResponse: string;
  playerResponseIsValid?: boolean;
  playerResponseErrorReason?: 'format' | 'invalid_word' | 'api_error' | null;
}
export type RoundResults = Record<string, RoundResultDetail>;

export interface PlayerInLobby {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
}

const MOCK_PLAYERS_IN_LOBBY: Omit<PlayerInLobby, 'isCurrentUser' | 'isOnline'>[] = [
  { id: 'player2', name: 'Amigo Carlos', avatar: `https://placehold.co/40x40.png?text=C` },
];
export default function GamePage() {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState<string | null>(null);
  const [showJoinRoomDialog, setShowJoinRoomDialog] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Assuming useAuth provides user
  const { activeRoomId, setActiveRoomId, gameData, connectedPlayers, isEvaluatingByHost, setIsEvaluatingByHost } = useRoomGameContext(); // Explicitly cast here


  const router = useRouter();

  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [personalHighScore, setPersonalHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [countdownWarningText, setCountdownWarningText] = useState<string>("");

  const { language, setLanguage: setGlobalLanguage, translate: translateUi } = useLanguage() as LanguageContextType;
  // Room Game State (if in a room)
  const roomIdFromParams = activeRoomId; // Use activeRoomId from context, which should be set by RoomPage component
  const defaultCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es; // Use the language variable directly

  const playerResponsesRef = useRef<Record<string, string>>(playerResponses);
  const currentLetterRef = useRef<string | null>(currentLetter);
  const gameStateRef = useRef<GameState>(gameState);

  const homeScreenAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopSoundRef = useRef<HTMLAudioElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playersInLobby, setPlayersInLobby] = useState<PlayerInLobby[]>([]);
  const [friendsList, setFriendsList] = useState<PlayerScore[]>([]);

  const currentCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es; // Use the language variable directly
  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es; // Use the language variable directly

  const translate = useCallback((key: keyof typeof UI_TEXTS, replacements?: Record<string, string>) => {
    if (!UI_TEXTS[key]) {
      console.warn(`[GamePage] Missing UI_TEXTS key: ${key} for language ${language}`);
      return key;
    }
    let text = translateUi(UI_TEXTS[key]);
    if (replacements) {
        Object.keys(replacements).forEach(k => {
            text = text.replace(`{${k}}`, replacements[k]);
        });
    }
    return text;
  }, [translateUi, language]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          parsedFriends = parsedFriends.map((f: PlayerScore) => ({ // Added type annotation
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
            id: user?.uid,
            name: user.displayName || translate('playerNameDefault'),
            avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || translate('playerNameDefault')).charAt(0)}`,
            isCurrentUser: true,
            isOnline: true,
        });
        MOCK_PLAYERS_IN_LOBBY.forEach((player: Omit<PlayerInLobby, 'isCurrentUser' | 'isOnline'>) => { // Added type annotation
             lobbyPlayersFromRoomContext.push({ ...player, id: player.id || `mock-${Date.now()}`, isCurrentUser: false, isOnline: Math.random() > 0.5 });
        });
        setPlayersInLobby(lobbyPlayersFromRoomContext);

    } else if (!activeRoomId) {
        setPlayersInLobby([]);
   }
  }, [activeRoomId, user, translate]);

  const exampleGlobalLeaderboard: EnrichedPlayerScore[] = [
    { id: "global-player-1", name: "Star Player", score: 12500, avatar: "https://placehold.co/40x40.png?text=S" },
    { id: "global-player-2", name: "StopKing", score: 11800, avatar: "https://placehold.co/40x40.png?text=K" },
    { id: "global-player-3", name: "FastLetters", score: 10500, avatar: "https://placehold.co/40x40.png?text=F" },
    { id: "global-player-4", name: "ProPlayer123", score: 9800, avatar: "https://placehold.co/40x40.png?text=P" },
    { id: "global-player-5", name: "Ana S.", score: 9200, avatar: "https://placehold.co/40x40.png?text=A" },
  ];
  useEffect(() => {
    if (!activeRoomId) {
      const defaultPlayerName = user?.displayName || translate('playerNameDefault');
      const defaultPlayerAvatar = user?.photoURL || `https://placehold.co/40x40.png?text=${defaultPlayerName.charAt(0)}`;
      setChatMessages([
          { id: 'system-1', text: translate('chatLoginTitle'), sender: { name: 'System', uid: 'system', avatar: 'https://placehold.co/40x40.png?text=S' }, timestamp: new Date(Date.now() - 120000) },
          { id: 'user-welcome-1', text: translate('welcomeTitle'), sender: { name: defaultPlayerName, uid: user?.uid || 'user-local', avatar: defaultPlayerAvatar }, timestamp: new Date(Date.now() - 60000) },
      ]);
    } else {
        setChatMessages([]);
    }
  }, [activeRoomId, language, user, translate]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Home screen music
      if (!homeScreenAudioRef.current) {
        const audioSrc = '/music/home-screen-music.mp3';
        console.log(`[GamePage] Attempting to load home screen audio from: ${audioSrc}`);
        homeScreenAudioRef.current = new Audio(audioSrc);
        homeScreenAudioRef.current.loop = true;
        homeScreenAudioRef.current.onloadeddata = () => {
          console.log(`[GamePage] Successfully loaded data for: ${audioSrc}`);
        };
        homeScreenAudioRef.current.onerror = () => {
          const mediaError = homeScreenAudioRef.current?.error;
          console.error(
            `[GamePage] Error loading home screen audio: ${audioSrc}. ` +
            `Check file path in public/music/ folder. ` +
            `Details: Code ${mediaError?.code}, Message: ${mediaError?.message}`
          );
        };
      }
      // Background game music
      if (!backgroundAudioRef.current) {
        const audioSrc = '/music/the-ticking-of-the-mantel-clock.mp3';
        console.log(`[GamePage] Attempting to load background audio: ${audioSrc}`);
        backgroundAudioRef.current = new Audio(audioSrc);
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.onloadeddata = () => {
          console.log(`[GamePage] Successfully loaded data for: ${audioSrc}`);
        };
        backgroundAudioRef.current.onerror = () => {
          const mediaError = backgroundAudioRef.current?.error;
          console.error(
            `[GamePage] Error loading background audio: ${audioSrc}. `+
            `Check file path in public/music/ folder. ` +
            `Details: Code ${mediaError?.code}, Message: ${mediaError?.message}`
          );
        };
      }
      // Stop sound
      if (!stopSoundRef.current) {
        const audioSrc = '/music/dry-cuckoo-sound.mp3';
        console.log(`[GamePage] Attempting to load audio: ${audioSrc}`);
        stopSoundRef.current = new Audio(audioSrc);
        stopSoundRef.current.onloadeddata = () => {
          console.log(`[GamePage] Successfully loaded data for: ${audioSrc}`);
        };
        stopSoundRef.current.onerror = () => {
           const mediaError = stopSoundRef.current?.error;
           console.error(
            `[GamePage] Error loading audio: ${audioSrc}. `+
            `Check file path in public/music/ folder. ` +
            `Details: Code ${mediaError?.code}, Message: ${mediaError?.message}`
          );
        };
      }
    }
    // Cleanup function to pause audio when component unmounts
    return () => {
      homeScreenAudioRef.current?.pause();
      backgroundAudioRef.current?.pause();
      stopSoundRef.current?.pause();
    };
  }, []); // Empty dependency array ensures this runs once on mount and unmount

  useEffect(() => {
    if (homeScreenAudioRef.current) {
      if (gameState === "IDLE" && !activeRoomId) {
        backgroundAudioRef.current?.pause();
        // Do NOT play automatically to prevent "play() failed because the user didn't interact" error
        // If user wants home screen music, a play button would be needed.
        // For now, we just ensure it's ready and other music is paused.
        // homeScreenAudioRef.current.currentTime = 0;
        // homeScreenAudioRef.current.play().catch(error => console.error("[GamePage] Error playing home screen audio:", error));
      } else {
        homeScreenAudioRef.current.pause();
      }
    }
  }, [gameState, activeRoomId]);

  useEffect(() => {
    if (backgroundAudioRef.current) {
      if (gameStateRef.current === "PLAYING" && currentLetterRef.current && !activeRoomId) {
        homeScreenAudioRef.current?.pause();
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(error => console.error("[GamePage] Error playing background audio:", error));
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
    };
  }, []);

  const startGame = useCallback(() => {
    if (gameStateRef.current === "IDLE" && !activeRoomId) {
        setTotalPlayerScore(0);
        setTotalAiScore(0);
    }
    resetRound();
    setCurrentLetter(null);
    setGameState("SPINNING");
  }, [resetRound, activeRoomId]);

  const handleSpinComplete = useCallback((letter: string) => {
    setCurrentLetter(letter);
    setGameState("PLAYING");
  }, []);

  const handleInputChange = useCallback((category: string, value: string) => {
    setPlayerResponses(prev => ({
      ...prev,
      [category]: value,
    }));
  }, []);
};
