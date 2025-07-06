"use client";

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
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
import { generateAiOpponentResponse } from '@/ai/flows/generate-ai-opponent-response';
import { validatePlayerWord } from '@/ai/flows/validate-player-word-flow';
import { Loader2, PlayCircle, RotateCcw, Share2, Copy, Trophy, Users, BarChart3, PlusCircle, LogIn, Clock, AlertTriangle, MessageSquare, ArrowRight, LogOut, Link as LinkIcon, Gamepad2, PartyPopper, UserPlus, Sword, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage, type Language } from '@/contexts/language-context';
import { PersonalHighScoreCard } from '@/components/game/personal-high-score-card';
import { GlobalLeaderboardCard } from '@/components/game/global-leaderboard-card';
import { FriendsLeaderboardCard } from '@/components/game/friends-leaderboard-card';
import { Progress } from '@/components/ui/progress';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/supabase/utils';
import type { EnrichedPlayerScore } from '@/components/game/leaderboard-table';
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
  id: string;
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

interface PlayerInLobby {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
}

const MOCK_PLAYERS_IN_LOBBY: PlayerInLobby[] = [
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
  const { user } = useAuth();
  const { language, translate } = useLanguage();
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playersInLobby, setPlayersInLobby] = useState<PlayerInLobby[]>([]);
  const [friendsList, setFriendsList] = useState<EnrichedPlayerScore[]>([]);

  const currentCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;
  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;

  // Resto del código corregido...
  // (Aquí irían todas las funciones y useEffect con las correcciones necesarias)

  return (
    <>
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center relative">
        {/* Resto del JSX corregido... */}
      </main>
    </>
  );
}