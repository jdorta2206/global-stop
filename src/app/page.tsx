
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, PlayCircle, RotateCcw, Share2, Copy, Trophy, Users, BarChart3, PlusCircle, LogIn, Clock, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';
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

const UI_TEXTS = {
  welcomeTitle: { es: "¡Bienvenido a Global Stop!", en: "Welcome to Global Stop!", fr: "Bienvenue à Global Stop!", pt: "Bem-vindo ao Global Stop!" },
  welcomeDescription: { es: "Elige cómo quieres jugar:", en: "Choose how you want to play:", fr: "Choisissez comment vous voulez jouer :", pt: "Escolha como você quer jogar:" },
  playVsAI: { es: "Jugar vs IA", en: "Play vs AI", fr: "Jouer contre l'IA", pt: "Jogar vs IA" },
  createRoom: { es: "Crear Sala (Amigos)", en: "Create Room (Friends)", fr: "Créer une Salle (Amis)", pt: "Criar Sala (Amigos)" },
  joinRoom: { es: "Unirse a Sala", en: "Join Room", fr: "Rejoindre une Salle", pt: "Entrar na Sala" },
  shareGame: { es: "Compartir Juego", en: "Share Game", fr: "Partager le Jeu", pt: "Compartilhar Jogo" },
  shareGameMessageWhatsApp: { 
    es: "¡Oye! ¡Juega Global Stop conmigo! Es muy divertido:", 
    en: "Hey! Play Global Stop with me! It's great fun:", 
    fr: "Salut ! Joue à Global Stop avec moi ! C'est très amusant :", 
    pt: "Ei! Jogue Global Stop comigo! É muito divertido:" 
  },
  multiplayerNote: {
    es: "La opción \"Crear Sala\" y \"Unirse a Sala\" son para la futura funcionalidad multijugador. Por ahora, solo se muestra la interfaz que te llevará a una página de sala (placeholder).",
    en: "The \"Create Room\" and \"Join Room\" options are for future multiplayer functionality. For now, only the interface is shown, which will take you to a placeholder room page.",
    fr: "Les options \"Créer une Salle\" et \"Rejoindre une Salle\" sont pour la future fonctionnalité multijoueur. Pour l'instant, seule l'interface est affichée, qui vous mènera à une page de salle (placeholder).",
    pt: "As opções \"Criar Sala\" e \"Entrar na Sala\" são para futura funcionalidade multijogador. Por enquanto, apenas a interface é mostrada, que o levará a uma página de sala (placeholder)."
  },
  createRoomDialogTitle: { es: "¡Sala Creada (Simulación)!", en: "Room Created (Simulation)!", fr: "Salle Créée (Simulation)!", pt: "Sala Criada (Simulação)!" },
  createRoomDialogDescription: {
    es: "Comparte este ID con tus amigos. Al hacer clic en 'Ir a la Sala', serás llevado a una página para esta sala (funcionalidad multijugador en desarrollo).",
    en: "Share this ID with your friends. Clicking 'Go to Room' will take you to a page for this room (multiplayer functionality in development).",
    fr: "Partagez cet ID avec vos amis. En cliquant sur 'Aller à la Salle', vous serez dirigé vers une page pour cette salle (fonctionnalité multijoueur en développement).",
    pt: "Compartilhe este ID com seus amigos. Clicar em 'Ir para a Sala' o levará para uma página desta sala (funcionalidade multijogador em desenvolvimento)."
  },
  roomIdLabel: { es: "ID de Sala:", en: "Room ID:", fr: "ID de la Salle :", pt: "ID da Sala:" },
  copyIdButton: { es: "Copiar ID", en: "Copy ID", fr: "Copier l'ID", pt: "Copiar ID" },
  goToRoomButton: { es: "Ir a la Sala", en: "Go to Room", fr: "Aller à la Salle", pt: "Ir para a Sala" },
  closeButton: { es: "Cerrar", en: "Close", fr: "Fermer", pt: "Fechar" },
  joinRoomDialogTitle: { es: "Unirse a una Sala", en: "Join a Room", fr: "Rejoindre une Salle", pt: "Entrar em uma Sala" },
  joinRoomDialogDescription: {
    es: "Ingresa el ID de la sala. Al unirte, serás llevado a una página para esta sala (funcionalidad multijugador en desarrollo).",
    en: "Enter the Room ID. Upon joining, you'll be taken to a page for this room (multiplayer functionality in development).",
    fr: "Entrez l'ID de la salle. En rejoignant, vous serez dirigé vers une page pour cette salle (fonctionnalité multijoueur en développement).",
    pt: "Digite o ID da sala. Ao entrar, você será levado para uma página desta sala (funcionalidade multijogador em desenvolvimento)."
  },
  joinRoomIdInputLabel: { es: "ID de la Sala", en: "Room ID", fr: "ID de la Salle", pt: "ID da Sala" },
  joinRoomIdInputPlaceholder: { es: "Ej: ABC123XYZ", en: "Ex: ABC123XYZ", fr: "Ex : ABC123XYZ", pt: "Ex: ABC123XYZ" },
  cancelButton: { es: "Cancelar", en: "Cancel", fr: "Annuler", pt: "Cancelar" },
  joinButton: { es: "Unirse", en: "Join", fr: "Rejoindre", pt: "Entrar" },
  // Toast messages for copying link are no longer used by the primary share button, but kept for potential other uses
  linkCopiedToastTitle: { es: "¡Enlace Copiado!", en: "Link Copied!", fr: "Lien Copié !", pt: "Link Copiado!" },
  linkCopiedToastDescription: { 
    es: "El enlace del juego ha sido copiado a tu portapapeles. ¡Compártelo con tus amigos!", 
    en: "The game link has been copied to your clipboard. Share it with your friends!",
    fr: "Le lien du jeu a été copié dans votre presse-papiers. Partagez-le avec vos amis !",
    pt: "O link do jogo foi copiado para a sua área de transferência. Compartilhe com seus amigos!"
  },
  errorCopyingLinkToastTitle: { es: "Error al Copiar", en: "Error Copying Link", fr: "Erreur de Copie", pt: "Erro ao Copiar" },
  errorCopyingLinkToastDescription: { 
    es: "No se pudo copiar el enlace. Por favor, inténtalo manualmente.", 
    en: "Could not copy the link. Please try manually.",
    fr: "Impossible de copier le lien. Veuillez essayer manuellement.",
    pt: "Não foi possível copiar o link. Por favor, tente manualmente."
  },
  idCopiedToastTitle: { es: "¡ID de Sala Copiado!", en: "Room ID Copied!", fr: "ID de Salle Copié !", pt: "ID da Sala Copiado!" },
  idCopiedToastDescription: {
    es: "El ID ha sido copiado. ¡Compártelo con tus amigos!",
    en: "The ID has been copied. Share it with your friends!",
    fr: "L'ID a été copié. Partagez-le avec vos amis !",
    pt: "O ID foi copiado. Compartilhe com seus amigos!"
  },
  errorCopyingIdToastTitle: { es: "Error al Copiar ID", en: "Error Copying ID", fr: "Erreur de Copie d'ID", pt: "Erro ao Copiar ID" },
  errorCopyingIdToastDescription: {
    es: "No se pudo copiar el ID. Por favor, cópialo manualmente.",
    en: "Could not copy the ID. Please copy it manually.",
    fr: "Impossible de copier l'ID. Veuillez le copier manuellement.",
    pt: "Não foi possível copiar o ID. Por favor, copie manualmente."
  },
  emptyRoomIdToastTitle: { es: "ID de Sala Vacío", en: "Empty Room ID", fr: "ID de Salle Vide", pt: "ID da Sala Vazio" },
  emptyRoomIdToastDescription: {
    es: "Por favor, ingresa un ID de sala para unirte.",
    en: "Please enter a room ID to join.",
    fr: "Veuillez entrer un ID de salle pour rejoindre.",
    pt: "Por favor, insira um ID de sala para entrar."
  },
  resultsTitle: { es: "Resultados de la Ronda", en: "Round Results", fr: "Résultats de la Manche", pt: "Resultados da Rodada" },
  roundWinnerPlayer: { es: "¡Jugador Gana la Ronda!", en: "Player Wins the Round!", fr: "Le Joueur Gagne la Manche !", pt: "Jogador Vence a Rodada!" },
  roundWinnerAI: { es: "¡IA Gana la Ronda!", en: "AI Wins the Round!", fr: "L'IA Gagne la Manche !", pt: "IA Vence a Rodada!" },
  roundNoScore: { es: "Nadie puntuó en esta ronda.", en: "Nobody scored this round.", fr: "Personne n'a marqué dans cette manche.", pt: "Ninguém pontuou nesta rodada." },
  roundTie: { es: "¡Empate en la Ronda!", en: "Round Tie!", fr: "Égalité dans la Manche !", pt: "Empate na Rodada!" },
  yourRoundScore: { es: "Tu Puntuación (Ronda):", en: "Your Score (Round):", fr: "Votre Score (Manche) :", pt: "Sua Pontuação (Rodada):" },
  aiRoundScore: { es: "Puntuación IA (Ronda):", en: "AI Score (Round):", fr: "Score IA (Manche) :", pt: "Pontuação IA (Rodada):" },
  totalScoreLabel: { es: "Puntuación Total Acumulada", en: "Total Accumulated Score", fr: "Score Total Accumulé", pt: "Pontuação Total Acumulada" },
  youLabel: { es: "Tú:", en: "You:", fr: "Vous :", pt: "Você:" },
  aiLabel: { es: "IA:", en: "AI:", fr: "IA :", pt: "IA:" },
  nextRoundButton: { es: "Jugar Siguiente Ronda", en: "Play Next Round", fr: "Jouer la Prochaine Manche", pt: "Jogar Próxima Rodada" },
  shareScoreButton: { es: "Compartir Puntuación", en: "Share Score", fr: "Partager le Score", pt: "Compartilhar Pontuação" },
  loadingAIMessage: {
    es: "IA está Pensando, Validando y Calculando Puntos...",
    en: "AI is Thinking, Validating and Calculating Scores...",
    fr: "L'IA réfléchit, valide et calcule les scores...",
    pt: "IA está Pensando, Validando e Calculando Pontos..."
  },
  loadingAIDescription: {
    es: "Por favor, espera mientras la IA prepara sus respuestas, validamos las tuyas y calculamos las puntuaciones.",
    en: "Please wait while the AI prepares its responses, we validate yours, and calculate the scores.",
    fr: "Veuillez patienter pendant que l'IA prépare ses réponses, que nous validons les vôtres et calculons les scores.",
    pt: "Por favor, aguarde enquanto a IA prepara suas respostas, validamos as suas e calculamos as pontuações."
  },
  chatLoginMessage: {
    es: "Debes iniciar sesión para chatear.",
    en: "You must be logged in to chat.",
    fr: "Vous devez être connecté pour discuter.",
    pt: "Você precisa estar logado para conversar."
  },
  chatLoginTitle: { es: "Inicia sesión para chatear", en: "Login to Chat", fr: "Connectez-vous pour discuter", pt: "Faça login para conversar" },
  timeLeftLabel: { es: "Tiempo Restante:", en: "Time Left:", fr: "Temps Restant :", pt: "Tempo Restante:"},
  timeEndingWarning: { es: "¡El tiempo se acaba!", en: "Time is running out!", fr: "Le temps presse !", pt: "O tempo está acabando!"},
  openChatLabel: { es: "Abrir chat", en: "Open chat", fr: "Ouvrir le chat", pt: "Abrir chat" },
  playerNameDefault: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
  playedText: { es: "jugó", en: "played", fr: "a joué", pt: "jogou" },
  iJustPlayed: { es: "Acabo de jugar a", en: "I just played", fr: "Je viens de jouer à", pt: "Acabei de jogar" },
  myTotalScore: { es: "Mi puntuación total", en: "My total score", fr: "Mon score total", pt: "Minha pontuação total" },
  aiTotalScore: { es: "Puntuación total de la IA", en: "AI's total score", fr: "Score total de l'IA", pt: "Pontuação total da IA" },
  canYouBeatMe: { es: "¿Crees que puedes superarme? ¡Inténtalo en Global Stop!", en: "Think you can beat me? Try Global Stop!", fr: "Pensez-vous pouvoir me battre ? Essayez Global Stop !", pt: "Acha que pode me vencer? Experimente o Global Stop!" }
};

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const router = useRouter();

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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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

  const exampleGlobalLeaderboard: PlayerScore[] = [
    { name: "Star Player", score: 12500 },
    { name: "StopKing", score: 11800 },
    { name: "FastLetters", score: 10500 },
    { name: "ProPlayer123", score: 9800 },
    { name: "Ana S.", score: 9200 },
  ];

  const exampleFriendsLeaderboard: PlayerScore[] = [
    { name: "Friend John", score: 7500 },
    { name: "Neighbor Sofia", score: 6800 },
    { name: "Colleague Alex", score: 6500 },
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
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
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
    const currentLang = language;

    console.log(`[GamePage] handleStopInternal triggered. Current Letter: ${letterForValidation}, Game State: ${gameStateRef.current}, Lang: ${currentLang}`);

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
    const aiPromises = currentCategories.map(async (category) => {
      try {
        const aiInput: AiOpponentResponseInput = { letter: letterForValidation, category, language: currentLang };
        const aiResult = await generateAiOpponentResponse(aiInput);
        tempAiResponses[category] = aiResult.response;
        console.log(`[GamePage] AI response for ${category} (letter ${letterForValidation}, lang ${currentLang}): "${aiResult.response}"`);
      } catch (error) {
        console.error(`[GamePage] Error getting AI response for ${category}:`, error);
        tempAiResponses[category] = "";
      }
    });

    await Promise.all(aiPromises);
    setAiResponses(tempAiResponses);
    console.log("[GamePage] AI responses generated:", tempAiResponses);

    console.log("[GamePage] Initiating player word validation...");
    const playerValidationPromises = currentCategories.map(async (category) => {
      const playerResponse = (currentResponses[category] || "").trim();

      console.log(`[GamePage] Validating for Category: ${category}, Player Word: "${playerResponse}", Required Letter: "${letterForValidation!}", Lang: ${currentLang}`);

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
          language: currentLang,
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
    currentCategories.forEach(category => {
      console.log(`\n[GamePage] Processing Category: "${category}"`);
      const playerResponseRaw = currentResponses[category] || "";
      const playerResponseTrimmed = playerResponseRaw.trim();

      const aiResponseRaw = tempAiResponses[category] || "";
      const aiResponseTrimmed = aiResponseRaw.trim();

      console.log(`  [GamePage] Player Response (Raw): "${playerResponseRaw}", Trimmed: "${playerResponseTrimmed}"`);
      console.log(`  [GamePage] AI Response (Raw): "${aiResponseRaw}", Trimmed: "${aiResponseTrimmed}"`);

      const validationStatus = playerWordValidity[category];
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
    setGameState, setIsLoadingAi, setAiResponses,
    setPlayerRoundScore, setAiRoundScore, setTotalPlayerScore, setTotalAiScore,
    setRoundResults, setRoundWinner, toast, language, currentCategories, translate
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
    const gameUrl = window.location.href;
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
    router.push(`/room/${joinRoomId.trim().toUpperCase()}`);
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

  const handleSendChatMessage = (text: string) => {
    if (!user) {
      toast({
        title: translate(UI_TEXTS.chatLoginTitle),
        description: translate(UI_TEXTS.chatLoginMessage),
        variant: "destructive",
      });
      return;
    }
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: {
        name: user.displayName || translate(UI_TEXTS.playerNameDefault),
        uid: user.uid,
        avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || translate(UI_TEXTS.playerNameDefault)).charAt(0)}`,
      },
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
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
          {gameState === "IDLE" && (
            <>
              <Card className="shadow-2xl rounded-xl overflow-hidden animate-fadeIn">
                <CardHeader className="text-center p-8">
                  <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">{translate(UI_TEXTS.welcomeTitle)}</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mt-3">
                    {translate(UI_TEXTS.welcomeDescription)}
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
                 <CardFooter className="text-xs text-muted-foreground text-center block px-6 pb-6">
                   {translate(UI_TEXTS.multiplayerNote)}
                </CardFooter>
              </Card>
              <PersonalHighScoreCard highScore={personalHighScore} language={language} />
              <GlobalLeaderboardCard leaderboardData={exampleGlobalLeaderboard} language={language} />
              <FriendsLeaderboardCard leaderboardData={exampleFriendsLeaderboard} language={language} />
            </>
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


          {gameState === "SPINNING" && (
            <div className="animate-fadeIn">
              <RouletteWheel
                isSpinning={true}
                onSpinComplete={handleSpinComplete}
                alphabet={currentAlphabet}
                language={language}
              />
            </div>
          )}

          {gameState === "PLAYING" && currentLetter && (
            <div className="my-4 w-full max-w-md text-center p-4 bg-card rounded-lg shadow animate-fadeIn">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                <p className="text-2xl font-semibold text-primary">{translate(UI_TEXTS.timeLeftLabel)} {timeLeft}s</p>
              </div>
              <Progress value={(timeLeft / ROUND_DURATION_SECONDS) * 100} className="w-full h-3 mb-2" />
              {timeLeft <= 10 && timeLeft > 0 && (
                  <p className="text-destructive font-medium mt-1 animate-pulse">{translate(UI_TEXTS.timeEndingWarning)}</p>
              )}
            </div>
          )}

          {(gameState === "PLAYING" || gameState === "EVALUATING" || gameState === "RESULTS") && currentLetter && (
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
              />
            </div>
          )}

          {gameState === "PLAYING" && (
            <div className="flex justify-center animate-fadeInUp mt-6">
              <StopButton onClick={handleStop} disabled={isLoadingAi || timeLeft <= 0} language={language} />
            </div>
          )}

          {gameState === "EVALUATING" && (
            <Card className="shadow-xl rounded-lg animate-fadeIn p-8 mt-6 w-full">
              <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-primary">{translate(UI_TEXTS.loadingAIMessage)}</p>
                <p className="text-muted-foreground">{translate(UI_TEXTS.loadingAIDescription)}</p>
              </CardContent>
            </Card>
          )}

          {gameState === "RESULTS" && roundResults && (
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
              <GlobalLeaderboardCard leaderboardData={exampleGlobalLeaderboard} className="animate-fadeInUp" language={language}/>
              <FriendsLeaderboardCard leaderboardData={exampleFriendsLeaderboard} className="animate-fadeInUp" language={language}/>
            </>
          )}
        </div>
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          currentUserUid={user?.uid}
          currentUserName={user?.displayName}
          currentUserAvatar={user?.photoURL}
          language={language}
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
