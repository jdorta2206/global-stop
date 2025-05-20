"use client";

import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Info, Share2, LogOut, Copy, Link as LinkIcon, UserPlus, Gamepad2, Circle, PlayCircle, RotateCcw, Loader2, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/language-context';
import { useRoom } from '@/contexts/room-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue, update, serverTimestamp, onDisconnect, set, off, push, child, get } from "firebase/database";
import { app } from '@/lib/firebase/config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { RouletteWheel } from '@/components/game/roulette-wheel';
import { GameArea } from '@/components/game/game-area';
import { StopButton } from '@/components/game/stop-button';
import { generateAiOpponentResponse, type AiOpponentResponseInput } from '@/ai/flows/generate-ai-opponent-response';
import { validatePlayerWord, type ValidatePlayerWordInput, type ValidatePlayerWordOutput } from '@/ai/flows/validate-player-word-flow';
import { Progress } from '@/components/ui/progress';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { Separator } from '@/components/ui/separator';

const ROUND_DURATION_SECONDS_ROOM = 90; // Longer for room play

interface PlayerInRoom {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  joinedAt?: number;
  hasSubmitted?: boolean; // New: tracks if player submitted answers for current round
}

interface GameData {
  status: "LOBBY" | "SPINNING" | "PLAYING" | "EVALUATING_SHARED" | "SHARED_RESULTS";
  currentLetter: string | null;
  currentCategories: string[] | null;
  roundStartTime: number | null;
  hostId: string | null;
  currentRoundId: string | null;
}

interface PlayerSubmission {
  answers: Record<string, string>;
  submittedAt: any; // serverTimestamp
}

interface ValidatedWordInfo {
  playerWord: string;
  isValid: boolean;
  errorReason: 'format' | 'invalid_word' | 'api_error' | null;
}

interface PlayerRoundCategoryResult extends ValidatedWordInfo {
  score: number;
}

interface PlayerRoundOutcome {
  totalScore: number;
  categories: Record<string, PlayerRoundCategoryResult>;
  playerName: string;
  playerAvatar?: string | null;
}

interface RoundEvaluationData {
  aiResponses: Record<string, string>;
  playerOutcomes: Record<string, PlayerRoundOutcome>; // key is playerId
}


const ROOM_TEXTS = {
  title: { es: "Sala de Juego:", en: "Game Room:", fr: "Salle de Jeu :", pt: "Sala de Jogo:" },
  welcome: { es: "¡Bienvenido/a a la sala!", en: "Welcome to the room!", fr: "Bienvenue dans la salle !", pt: "Bem-vindo(a) à sala!" },
  playerListTitle: { es: "Jugadores en la Sala", en: "Players in Room", fr: "Joueurs dans la Salle", pt: "Jogadores na Sala" },
  playerListDescription: {
    es: "Aquí verás la lista de jugadores conectados a esta sala.",
    en: "Here you will see the list of players connected to this room.",
    fr: "Ici, vous verrez la liste des joueurs connectés à cette salle.",
    pt: "Aqui você verá la lista de jogadores conectados a esta sala."
  },
  backToHome: { es: "Volver al Inicio", en: "Back to Home", fr: "Retour à l'Accueil", pt: "Voltar ao Início" },
  shareRoomTitle: { es: "Comparte esta Sala", en: "Share this Room", fr: "Partager cette Salle", pt: "Compartilhar esta Sala"},
  shareRoomDescription: {
    es: "Invita a tus amigos a unirse usando este ID o enlace.",
    en: "Invite your friends to join using this ID or link.",
    fr: "Invitez vos amis à rejoindre en utilisant cet ID ou ce lien.",
    pt: "Convide seus amigos para entrar usando este ID ou link."
  },
  copyRoomIdButton: { es: "Copiar ID de Sala", en: "Copy Room ID", fr: "Copier l'ID de Salle", pt: "Copiar ID da Sala"},
  copyRoomLinkButton: { es: "Copiar Enlace", en: "Copy Link", fr: "Copier le Lien", pt: "Copiar Link"},
  shareViaWhatsApp: { es: "Compartir por WhatsApp", en: "Share via WhatsApp", fr: "Partager via WhatsApp", pt: "Compartilhar via WhatsApp"},
  leaveRoomButton: { es: "Salir de la Sala y Volver al Inicio", en: "Leave Room & Go Home", fr: "Quitter la Salle et Retourner à l'Accueil", pt: "Sair da Sala e Voltar ao Início"},
  idCopiedToastTitle: { es: "¡ID de Sala Copiado!", en: "Room ID Copied!", fr: "ID de Salle Copié !", pt: "ID da Sala Copiado!" },
  linkCopiedToastTitle: { es: "¡Enlace Copiado!", en: "Link Copied!", fr: "Lien Copié !", pt: "Link Copiado!" },
  errorCopyingToastTitle: { es: "Error al Copiar", en: "Error Copying", fr: "Erreur de Copie", pt: "Erro ao Copiar" },
  shareMessageWhatsApp: {
    es: "¡Únete a mi sala de Global Stop! ID de Sala:",
    en: "Join my Global Stop room! Room ID:",
    fr: "Rejoins ma salle Global Stop ! ID de la Salle :",
    pt: "Entre na minha sala do Global Stop! ID da Sala:"
  },
  joinHere: { es: "Únete aquí:", en: "Join here:", fr: "Rejoindre ici:", pt: "Entre aqui:"},
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" },
  startGameButton: { es: "Iniciar Partida", en: "Start Game", fr: "Démarrer la Partie", pt: "Iniciar Jogo"},
  startGameDescription: {
    es: "Solo el anfitrión puede iniciar la partida. ¡Prepara tus respuestas!",
    en: "Only the host can start the game. Get your answers ready!",
    fr: "Seul l'hôte peut démarrer la partie. Préparez vos réponses !",
    pt: "Apenas o anfitrião pode iniciar o jogo. Prepare suas respostas!"
  },
  noPlayersInRoom: { es: "No hay jugadores en esta sala todavía.", en: "No players in this room yet.", fr: "Aucun joueur dans cette salle pour le moment.", pt: "Nenhum jogador nesta sala ainda." },
  onlineStatus: { es: "En línea", en: "Online", fr: "En ligne", pt: "Online" },
  offlineStatus: { es: "Desconectado", en: "Offline", fr: "Hors ligne", pt: "Offline" },
  errorJoiningRoom: { es: "Error al unirse a la sala", en: "Error joining room", fr: "Erreur en rejoignant la salle", pt: "Erro ao entrar na sala" },
  errorLoadingPlayers: { es: "Error al cargar jugadores", en: "Error loading players", fr: "Erreur de chargement des joueurs", pt: "Erro ao carregar jogadores" },
  copiedToClipboard: { es: "copiado.", en: "copied.", fr: "copié.", pt: "copiado." },
  couldNotCopy: { es: "No se pudo copiar.", en: "Could not copy.", fr: "Impossible de copier.", pt: "Não foi possível copiar." },
  loadingRoom: { es: "Cargando sala...", en: "Loading room...", fr: "Chargement de la salle...", pt: "Carregando sala..." },
  playerNameDefault: { es: "Jugador Anónimo", en: "Anonymous Player", fr: "Joueur Anonyme", pt: "Jogador Anônimo" },
  gameStatusLobby: { es: "Lobby: Esperando al anfitrión para iniciar.", en: "Lobby: Waiting for host to start.", fr: "Lobby : En attente de l'hôte pour démarrer.", pt: "Lobby: Esperando o anfitrião iniciar." },
  gameStatusSpinning: { es: "¡Girando la ruleta!", en: "Spinning the wheel!", fr: "La roue tourne !", pt: "Girando a roleta!" },
  gameStatusPlaying: { es: "¡A Jugar! Letra:", en: "Game On! Letter:", fr: "C'est parti ! Lettre :", pt: "Jogo Começou! Letra:" },
  gameStatusEvaluating: { es: "Evaluando respuestas...", en: "Evaluating answers...", fr: "Évaluation des réponses...", pt: "Avaliando respostas..." },
  gameStatusSharedResults: { es: "Resultados de la Ronda", en: "Round Results", fr: "Résultats de la Manche", pt: "Resultados da Rodada" },
  submitAnswersButton: { es: "¡ALTO! (Enviar Respuestas)", en: "STOP! (Submit Answers)", fr: "STOP ! (Envoyer Réponses)", pt: "PARE! (Enviar Respostas)" },
  waitingForHostEvaluation: { es: "Respuestas enviadas. Esperando al anfitrión para evaluar...", en: "Answers submitted. Waiting for host to evaluate...", fr: "Réponses envoyées. En attente de l'évaluation par l'hôte...", pt: "Respostas enviadas. Esperando o anfitrião avaliar..." },
  evaluateRoundButton: { es: "Evaluar Ronda (Anfitrión)", en: "Evaluate Round (Host)", fr: "Évaluer la Manche (Hôte)", pt: "Avaliar Rodada (Anfitrião)" },
  nextRoundButtonHost: { es: "Siguiente Ronda (Anfitrión)", en: "Next Round (Host)", fr: "Prochaine Manche (Hôte)", pt: "Próxima Rodada (Anfitrião)" },
  waitingForNextRound: { es: "Esperando al anfitrión para la siguiente ronda...", en: "Waiting for host for next round...", fr: "En attente de l'hôte pour la prochaine manche...", pt: "Esperando o anfitrião para a próxima rodada..." },
  timeLeftLabel: { es: "Tiempo:", en: "Time:", fr: "Temps :", pt: "Tempo:" },
  chatTitle: { es: "Chat de la Sala", en: "Room Chat", fr: "Chat de la Salle", pt: "Chat da Sala"},
  chatDescription: { es: "Comunícate con otros jugadores.", en: "Chat with other players.", fr: "Discutez avec les autres joueurs.", pt: "Converse com outros jogadores."},
  chatLoginMessage: { es: "Debes iniciar sesión para chatear.", en: "You must be logged in to chat.", fr: "Vous devez être connecté pour discuter.", pt: "Você deve estar logado para conversar." },
  notSubmitted: { es: "(Aún no ha enviado)", en: "(Not submitted yet)", fr: "(Pas encore soumis)", pt: "(Ainda não enviou)" },
  submitted: { es: "(Enviado)", en: "(Submitted)", fr: "(Soumis)", pt: "(Enviado)" },
  categoriesLabel: { es: "Categorías:", en: "Categories:", fr: "Catégories :", pt: "Categorias:"},
  player: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
  score: { es: "Puntos", en: "Score", fr: "Score", pt: "Pontos" },
  aiPlayerName: { es: "Oponente IA", en: "AI Opponent", fr: "Adversaire IA", pt: "Oponente IA"},
  errorValidatingWord: {es: "Error al validar", en: "Validation error", fr: "Erreur de validation", pt: "Erro de validação"},
};

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

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { language, translate: translateContext } = useLanguage();
  const { activeRoomId, setActiveRoomId } = useRoom();
  const { user } = useAuth();
  const { toast } = useToast();
  const roomIdFromParams = params.roomId as string;

  const [connectedPlayers, setConnectedPlayers] = useState<PlayerInRoom[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [localPlayerSubmitted, setLocalPlayerSubmitted] = useState(false);
  const [isEvaluatingByHost, setIsEvaluatingByHost] = useState(false);
  const [roundEvaluation, setRoundEvaluation] = useState<RoundEvaluationData | null>(null);

  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS_ROOM);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const db = getDatabase(app);

  const translate = (textKey: keyof typeof ROOM_TEXTS, replacements?: Record<string, string>) => {
    let text = translateContext(ROOM_TEXTS[textKey]) || ROOM_TEXTS[textKey]['en'];
    if (replacements) {
      Object.keys(replacements).forEach(key => {
        text = text.replace(`{${key}}`, replacements[key]);
      });
    }
    return text;
  }

  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
  const defaultCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;

  const handlePlayerJoin = useCallback(async () => {
    if (!user || !roomIdFromParams) return;
    const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
    const playerStatusRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/isOnline`);
    const playerLastSeenRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/lastSeen`);
    const defaultName = translate('playerNameDefault');

    try {
      await update(playerRef, {
        name: user.displayName || defaultName,
        avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || defaultName).charAt(0)}`,
        joinedAt: serverTimestamp(),
        isOnline: true,
        hasSubmitted: false, // Initialize hasSubmitted status
      });
      await onDisconnect(playerStatusRef).set(false);
      await onDisconnect(playerLastSeenRef).set(serverTimestamp());
      await set(playerStatusRef, true); // Explicitly set online status after onDisconnect setup
    } catch (error) {
      console.error("Error joining/updating player in room:", error);
      toast({ title: translate('errorJoiningRoom'), description: (error as Error).message, variant: "destructive" });
    }
  }, [user, roomIdFromParams, db, toast, translate]);

  useEffect(() => {
    if (roomIdFromParams && roomIdFromParams !== activeRoomId) {
      setActiveRoomId(roomIdFromParams);
    }

    if (!user || !roomIdFromParams) {
      setConnectedPlayers([]);
      setGameData(null);
      return;
    }

    handlePlayerJoin();

    const playersRef = ref(db, `rooms/${roomIdFromParams}/players`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      const currentPlayers: PlayerInRoom[] = [];
      const defaultPlayerName = translate('playerNameDefault');
      if (data) {
        Object.keys(data).forEach((playerId) => {
          currentPlayers.push({
            id: playerId,
            name: data[playerId].name || defaultPlayerName,
            avatar: data[playerId].avatar || `https://placehold.co/40x40.png?text=${(data[playerId].name || defaultPlayerName).charAt(0)}`,
            isCurrentUser: user?.uid === playerId,
            isOnline: data[playerId].isOnline || false,
            joinedAt: data[playerId].joinedAt || Date.now(),
            hasSubmitted: !!data[playerId].hasSubmitted,
          });
        });
      }
      currentPlayers.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
      setConnectedPlayers(currentPlayers);
    }, (error) => {
      console.error("Error fetching players:", error);
      toast({ title: translate('errorLoadingPlayers'), description: error.message, variant: "destructive" });
    });

    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    const unsubscribeGameData = onValue(gameDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData(data);
        if (data.status === "PLAYING") {
          setLocalPlayerSubmitted(false); // Reset submission status for new round
           // Reset local responses when a new round starts playing
          if (user && gameData?.currentRoundId) { // Check if gameData and currentRoundId exist
            const playerSubmissionStatusRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/submittedAnswersForRound`);
            get(playerSubmissionStatusRef).then((snap) => {
              if (snap.exists() && snap.val() === gameData.currentRoundId) {
                setLocalPlayerSubmitted(true);
              } else {
                setPlayerResponses({}); // Only clear if not submitted for this round
              }
            });
          } else {
             setPlayerResponses({});
          }
        }
      } else {
        // Initialize gameData if it doesn't exist (e.g., new room)
        if (user) {
          const initialGameData: GameData = {
            status: "LOBBY",
            currentLetter: null,
            currentCategories: null,
            roundStartTime: null,
            hostId: null, // Will be set when first game starts
            currentRoundId: null,
          };
          set(gameDataRef, initialGameData);
          setGameData(initialGameData);
        }
      }
    });

    const roundEvaluationRef = ref(db, `rooms/${roomIdFromParams}/roundsData/${gameData?.currentRoundId}/evaluation`);
    let unsubscribeRoundEvaluation: (() => void) | null = null;
    if (gameData?.currentRoundId) {
        unsubscribeRoundEvaluation = onValue(roundEvaluationRef, (snapshot) => {
            setRoundEvaluation(snapshot.val());
        });
    }


    const chatMessagesRef = ref(db, `rooms/${roomIdFromParams}/chatMessages`);
    const unsubscribeChat = onValue(chatMessagesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedMessages: ChatMessage[] = [];
        if (data) {
            for (const key in data) {
            loadedMessages.push({ id: key, ...data[key], timestamp: new Date(data[key].timestamp || Date.now()) });
            }
            loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
        setChatMessages(loadedMessages);
    });


    return () => {
      unsubscribePlayers();
      unsubscribeGameData();
      if (unsubscribeRoundEvaluation) unsubscribeRoundEvaluation();
      unsubscribeChat();
      if (user && roomIdFromParams) {
        const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
        update(playerRef, { isOnline: false, lastSeen: serverTimestamp() });
      }
    };
  }, [roomIdFromParams, user, db, activeRoomId, setActiveRoomId, handlePlayerJoin, toast, translate, gameData?.currentRoundId]);


  useEffect(() => {
    if (gameData?.status === "PLAYING" && gameData.roundStartTime && !localPlayerSubmitted) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const updateTimer = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - gameData.roundStartTime!) / 1000);
        const remaining = ROUND_DURATION_SECONDS_ROOM - elapsedSeconds;
        setTimeLeft(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (!localPlayerSubmitted) handleSubmitAnswers(); // Auto-submit if time runs out
        }
      };
      updateTimer(); // Initial call
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameData, localPlayerSubmitted]);


  const handleLeaveRoom = () => {
    if (user && roomIdFromParams) {
      const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
      update(playerRef, { isOnline: false, lastSeen: serverTimestamp() });
      // If the host leaves, consider resetting the game or assigning a new host (more complex logic)
      // For now, just mark as offline. Other players will see this.
    }
    setActiveRoomId(null);
    router.push('/');
  };

  const copyToClipboard = async (text: string, type: 'id' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: type === 'id' ? translate('idCopiedToastTitle') : translate('linkCopiedToastTitle'),
        description: `${text} ${translate('copiedToClipboard')}`,
      });
    } catch (err) {
      toast({ title: translate('errorCopyingToastTitle'), description: translate('couldNotCopy'), variant: "destructive" });
    }
  };

  const handleShareViaWhatsApp = () => {
    const roomUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `${translate('shareMessageWhatsApp')} ${roomIdFromParams}. ${translate('joinHere')} ${roomUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleStartGame = () => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid ) {
        if (gameData?.hostId === null && user) { // Allow first player to become host
             // No host yet, current user becomes host
        } else {
            toast({ title: "Acción no permitida", description: "Solo el anfitrión puede iniciar la partida.", variant: "destructive" });
            return;
        }
    }

    const newRoundId = push(child(ref(db), 'rooms')).key || `round-${Date.now()}`;
    const initialGameUpdate: Partial<GameData> = {
      status: "SPINNING",
      currentRoundId: newRoundId,
      hostId: gameData?.hostId || user?.uid, // Set host if not set
      currentLetter: null,
      currentCategories: null,
      roundStartTime: null,
    };
    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    update(gameDataRef, initialGameUpdate);

    // Reset hasSubmitted for all players for the new round
    connectedPlayers.forEach(p => {
        if (p.id) {
            update(ref(db, `rooms/${roomIdFromParams}/players/${p.id}`), { hasSubmitted: false, submittedAnswersForRound: null });
        }
    });
    setLocalPlayerSubmitted(false);
  };

  const handleSpinCompleteInRoom = (letter: string) => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid) return;

    const gameUpdate: Partial<GameData> = {
      currentLetter: letter,
      currentCategories: defaultCategories, // Use current language's categories
      roundStartTime: Date.now(),
      status: "PLAYING",
    };
    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    update(gameDataRef, gameUpdate);
  };

  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmitAnswers = async () => {
    if (!user || !roomIdFromParams || !gameData?.currentRoundId || localPlayerSubmitted) return;

    const submissionPath = `rooms/${roomIdFromParams}/roundsData/${gameData.currentRoundId}/submissions/${user.uid}`;
    const submissionData: PlayerSubmission = {
      answers: playerResponses,
      submittedAt: serverTimestamp(),
    };
    await set(ref(db, submissionPath), submissionData);
    await update(ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`), { 
        hasSubmitted: true,
        submittedAnswersForRound: gameData.currentRoundId 
    });
    setLocalPlayerSubmitted(true);
    toast({ title: "Respuestas Enviadas", description: "Tus respuestas han sido enviadas. Esperando al anfitrión."});
  };

  const handleEvaluateRound = async () => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid || !gameData.currentRoundId) {
      toast({ title: "No autorizado", description: "Solo el anfitrión puede evaluar la ronda.", variant: "destructive"});
      return;
    }
    setIsEvaluatingByHost(true);
    await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "EVALUATING_SHARED" });

    const roundId = gameData.currentRoundId;
    const submissionsSnapshot = await get(ref(db, `rooms/${roomIdFromParams}/roundsData/${roundId}/submissions`));
    const submissionsData = submissionsSnapshot.val() as Record<string, PlayerSubmission> | null;

    if (!submissionsData) {
      toast({ title: "Error", description: "No hay respuestas para evaluar.", variant: "destructive"});
      await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "LOBBY" });
      setIsEvaluatingByHost(false);
      return;
    }

    const categories = gameData.currentCategories || defaultCategories;
    const letter = gameData.currentLetter!;

    // 1. Generate AI Responses
    const aiResponses: Record<string, string> = {};
    for (const category of categories) {
      try {
        const aiInput: AiOpponentResponseInput = { letter, category, language };
        const aiResult = await generateAiOpponentResponse(aiInput);
        aiResponses[category] = aiResult.response.trim();
      } catch (e) {
        console.error(`Error getting AI response for ${category}:`, e);
        aiResponses[category] = "";
      }
    }

    // 2. Validate all player words
    const allPlayerValidatedWords: Record<string, Record<string, ValidatedWordInfo>> = {}; // playerId -> category -> ValidatedWordInfo
    for (const playerId in submissionsData) {
      allPlayerValidatedWords[playerId] = {};
      const playerSubmission = submissionsData[playerId];
      for (const category of categories) {
        const playerWord = (playerSubmission.answers[category] || "").trim();
        let isValid = false;
        let errorReason: ValidatedWordInfo['errorReason'] = null;

        if (playerWord === "") {
          isValid = false;
        } else if (!playerWord.toLowerCase().startsWith(letter.toLowerCase())) {
          isValid = false;
          errorReason = 'format';
        } else {
          try {
            const validationResult: ValidatePlayerWordOutput = await validatePlayerWord({ letter, category, playerWord, language });
            isValid = validationResult.isValid;
            if (!isValid) errorReason = 'invalid_word';
          } catch (e) {
            console.error(`Error validating word ${playerWord} for ${playerId}:`, e);
            isValid = false;
            errorReason = 'api_error';
          }
        }
        allPlayerValidatedWords[playerId][category] = { playerWord, isValid, errorReason };
      }
    }

    // 3. Calculate scores for all players
    const finalPlayerOutcomes: Record<string, PlayerRoundOutcome> = {};
    const playerIds = Object.keys(submissionsData);

    for (const currentPlayerId of playerIds) {
      const currentPlayerInfo = connectedPlayers.find(p => p.id === currentPlayerId);
      finalPlayerOutcomes[currentPlayerId] = {
        totalScore: 0,
        categories: {},
        playerName: currentPlayerInfo?.name || translate('playerNameDefault'),
        playerAvatar: currentPlayerInfo?.avatar || null,
      };

      for (const category of categories) {
        const currentPlayerValidatedInfo = allPlayerValidatedWords[currentPlayerId]?.[category];
        if (!currentPlayerValidatedInfo) continue;

        let pScore = 0;
        if (currentPlayerValidatedInfo.isValid) {
          const aiWordValid = aiResponses[category] && aiResponses[category].toLowerCase().startsWith(letter.toLowerCase());
          
          if (aiWordValid && aiResponses[category].toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
            pScore = 50; // Shared with AI
          } else {
            pScore = 100; // Unique or AI failed/different
          }

          // Check against other players
          let isSharedWithOtherPlayer = false;
          for (const otherPlayerId of playerIds) {
            if (otherPlayerId === currentPlayerId) continue;
            const otherPlayerValidatedInfo = allPlayerValidatedWords[otherPlayerId]?.[category];
            if (otherPlayerValidatedInfo?.isValid && otherPlayerValidatedInfo.playerWord.toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
              isSharedWithOtherPlayer = true;
              break;
            }
          }
          if (isSharedWithOtherPlayer) {
            pScore = 50; // Shared with another player
          }
        }
        finalPlayerOutcomes[currentPlayerId].categories[category] = {
            playerWord: currentPlayerValidatedInfo.playerWord,
            isValid: currentPlayerValidatedInfo.isValid,
            errorReason: currentPlayerValidatedInfo.errorReason,
            score: pScore,
        };
        finalPlayerOutcomes[currentPlayerId].totalScore += pScore;
      }
    }
    
    const evaluationData: RoundEvaluationData = {
      aiResponses,
      playerOutcomes: finalPlayerOutcomes,
    };

    await set(ref(db, `rooms/${roomIdFromParams}/roundsData/${roundId}/evaluation`), evaluationData);
    await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "SHARED_RESULTS" });
    setIsEvaluatingByHost(false);
    toast({title: "Ronda Evaluada", description: "Los resultados están disponibles."});
  };
  
  const handleStartNextRound = () => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid ) return;
    // Essentially the same as handleStartGame, but might have different cleanup for current round if needed
    handleStartGame();
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);
  
  const handleSendChatMessageInRoom = (text: string) => {
    if (!user || !roomIdFromParams) {
      toast({ title: translate('chatLoginMessage'), variant: "destructive" });
      return;
    }
    const messagesListRef = ref(db, `rooms/${roomIdFromParams}/chatMessages`);
    const newMessageRef = push(messagesListRef);
    const messageData: Omit<ChatMessage, 'id' | 'timestamp'> & { timestamp: any } = {
      text,
      sender: {
        name: user.displayName || translate('playerNameDefault'),
        uid: user.uid,
        avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || translate('playerNameDefault')).charAt(0)}`,
      },
      timestamp: serverTimestamp(),
    };
    set(newMessageRef, messageData).catch(error => {
      console.error("Error sending chat message:", error);
      toast({ title: "Error de Chat", description: "No se pudo enviar tu mensaje.", variant: "destructive" });
    });
  };


  if (!roomIdFromParams || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{translate('loadingRoom')}</p>
          <Button onClick={() => router.push('/')} variant="link" className="mt-4">{translate('backToHome')}</Button>
        </main>
        <AppFooter language={language} />
      </div>
    );
  }

  const canPlayerSubmit = gameData?.status === "PLAYING" && !localPlayerSubmitted;
  const isHost = user?.uid === gameData?.hostId;
  const currentCategoriesToUse = gameData?.currentCategories || defaultCategories;


  // Determine if the "Evaluate Round" button should be active for the host
  let allPlayersSubmitted = false;
  if (gameData?.status === "PLAYING" && connectedPlayers.length > 0) {
    const onlinePlayers = connectedPlayers.filter(p => p.isOnline);
    if (onlinePlayers.length > 0) {
        allPlayersSubmitted = onlinePlayers.every(p => p.hasSubmitted);
    }
  }


  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center relative">
            <Button
                onClick={toggleChat}
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/50"
                aria-label={translate('chatTitle')}
            >
                <MessageSquare className="h-7 w-7" />
            </Button>

          <Card className="w-full max-w-3xl shadow-xl rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
                {translate('title')} <span className="text-accent">{roomIdFromParams}</span>
              </CardTitle>
              {gameData?.status === "LOBBY" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusLobby')}</CardDescription>}
              {gameData?.status === "SPINNING" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusSpinning')}</CardDescription>}
              {gameData?.status === "PLAYING" && gameData.currentLetter && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusPlaying')} <span className="font-bold text-accent">{gameData.currentLetter}</span></CardDescription>}
              {gameData?.status === "EVALUATING_SHARED" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusEvaluating')}</CardDescription>}
              {gameData?.status === "SHARED_RESULTS" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusSharedResults')}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Game Area or Lobby Content */}
              {gameData?.status === "LOBBY" && (
                <div className="text-center space-y-4">
                  <Button
                    size="lg"
                    className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={handleStartGame}
                    disabled={!isHost && gameData.hostId !== null} // Disable if not host, unless no host is set yet
                  >
                    <PlayCircle className="mr-3 h-6 w-6" />
                    {translate('startGameButton')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {gameData.hostId === null ? "Sé el primero en iniciar para ser el anfitrión." : translate('startGameDescription')}
                  </p>
                </div>
              )}

              {gameData?.status === "SPINNING" && (
                <RouletteWheel
                  isSpinning={true}
                  onSpinComplete={handleSpinCompleteInRoom}
                  alphabet={currentAlphabet}
                  language={language}
                />
              )}
              
              {gameData?.status === "PLAYING" && gameData.currentLetter && gameData.currentCategories && (
                <div className="space-y-4">
                  <div className="my-4 w-full max-w-md text-center p-3 bg-card rounded-lg shadow mx-auto">
                    <div className="flex items-center justify-center mb-1">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        <p className="text-xl font-semibold text-primary">{translate('timeLeftLabel')} {timeLeft < 0 ? 0 : timeLeft}s</p>
                    </div>
                    <Progress value={(timeLeft / ROUND_DURATION_SECONDS_ROOM) * 100} className="w-full h-2" />
                  </div>
                  {!localPlayerSubmitted ? (
                    <>
                      <GameArea
                        letter={gameData.currentLetter}
                        categories={gameData.currentCategories}
                        playerResponses={playerResponses}
                        onInputChange={handleInputChange}
                        isEvaluating={false}
                        showResults={false}
                        roundResults={null}
                        language={language}
                        gameMode="room"
                      />
                      <div className="flex justify-center mt-4">
                        <StopButton onClick={handleSubmitAnswers} disabled={!canPlayerSubmit} language={language} label={translate('submitAnswersButton')}/>
                      </div>
                    </>
                  ) : (
                    <Card className="p-6 text-center bg-muted/50">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3"/>
                      <p className="text-lg font-semibold">{translate('waitingForHostEvaluation')}</p>
                    </Card>
                  )}
                </div>
              )}

              {gameData?.status === "EVALUATING_SHARED" && (
                 <Card className="p-6 text-center bg-muted/50">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3"/>
                    <p className="text-lg font-semibold">{translate('gameStatusEvaluating')}</p>
                 </Card>
              )}

              {gameData?.status === "SHARED_RESULTS" && roundEvaluation && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-center text-accent">{translate('gameStatusSharedResults')}</h3>
                  {roundEvaluation.aiResponses && (
                    <Card className="p-4 bg-muted/30">
                        <CardTitle className="text-lg mb-2 text-secondary">{translate('aiPlayerName')}</CardTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        {Object.entries(roundEvaluation.aiResponses).map(([cat, resp]) => (
                            <div key={cat}><strong>{cat}:</strong> {resp || "-"}</div>
                        ))}
                        </div>
                    </Card>
                  )}
                  <Separator />
                  {Object.entries(roundEvaluation.playerOutcomes).map(([pId, outcome]) => (
                     <Card key={pId} className="p-4">
                        <CardHeader className="p-2 flex flex-row items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={outcome.playerAvatar || undefined} alt={outcome.playerName} data-ai-hint="avatar person"/>
                                    <AvatarFallback>{outcome.playerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-xl">{outcome.playerName} {pId === user?.uid ? translate('youSuffix') : ''}</CardTitle>
                            </div>
                            <p className="text-2xl font-bold text-primary">{outcome.totalScore} {translate('score')}</p>
                        </CardHeader>
                        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {Object.entries(outcome.categories).map(([catName, catResult]) => (
                                <div key={catName} className="p-2 border rounded-md bg-card/50">
                                    <p><strong>{catName}:</strong> {catResult.playerWord || <span className="italic">"-"</span>}</p>
                                    <div className="flex justify-between items-center text-xs mt-1">
                                        <span>
                                            {catResult.isValid ? 
                                                <CheckCircle className="h-4 w-4 text-green-500 inline mr-1"/> : 
                                                <XCircle className="h-4 w-4 text-destructive inline mr-1"/>
                                            }
                                            {catResult.isValid ? "Válido" : (catResult.errorReason === 'format' ? "Formato Incorrecto" : catResult.errorReason === 'invalid_word' ? "Palabra Inválida" : translate('errorValidatingWord'))}
                                        </span>
                                        <span className="font-semibold">{catResult.score} pts</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                     </Card>
                  ))}
                  {isHost && (
                    <Button onClick={handleStartNextRound} size="lg" className="w-full mt-6">
                        <RotateCcw className="mr-2 h-5 w-5"/> {translate('nextRoundButtonHost')}
                    </Button>
                  )}
                  {!isHost && (
                     <p className="text-center text-muted-foreground mt-6">{translate('waitingForNextRound')}</p>
                  )}
                </div>
              )}


              {/* Player List and Sharing Options - always visible or conditional? Maybe in footer */}
              <div className="mt-8 space-y-3">
                <h3 className="text-xl font-semibold text-secondary flex items-center">
                  <Users className="mr-2 h-5 w-5" /> {translate('playerListTitle')}
                </h3>
                <div className="p-3 bg-muted/20 rounded-md min-h-[100px] space-y-2">
                  {connectedPlayers.length > 0 ? (
                    connectedPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-card/50 rounded shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatar || undefined} alt={player.name} data-ai-hint="avatar person" />
                                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Circle
                                  className={cn(
                                    "h-3 w-3 absolute bottom-0 right-0 border-2 border-card rounded-full",
                                    player.isOnline ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{player.isOnline ? translate('onlineStatus') : translate('offlineStatus')}</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-sm text-card-foreground">
                            {player.name} {player.isCurrentUser && <span className="text-xs text-primary">{translate('youSuffix')}</span>}
                          </span>
                           {gameData?.status === "PLAYING" && player.id !== user?.uid && (
                                <span className="text-xs text-muted-foreground ml-2">
                                    {player.hasSubmitted ? translate('submitted') : translate('notSubmitted')}
                                </span>
                            )}
                        </div>
                        {!player.isCurrentUser && user && (
                           <Button variant="outline" size="sm" className="text-xs" disabled>
                              <UserPlus className="mr-1 h-3 w-3" /> {translate('addFriendButton')}
                            </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-3">{translate('noPlayersInRoom')}</p>
                  )}
                   <p className="text-xs text-muted-foreground text-center pt-2">{translate('playerListDescription')}</p>
                </div>
                 {isHost && gameData?.status === "PLAYING" && (
                    <Button onClick={handleEvaluateRound} disabled={isEvaluatingByHost || !allPlayersSubmitted} className="w-full">
                        {isEvaluatingByHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {translate('evaluateRoundButton')} {!allPlayersSubmitted && " (Esperando envíos)"}
                    </Button>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-6 border-t flex flex-col space-y-3">
                <div className="w-full space-y-2">
                    <h3 className="text-lg font-semibold text-secondary flex items-center">
                        <Share2 className="mr-2 h-5 w-5" /> {translate('shareRoomTitle')}
                    </h3>
                    <p className="text-muted-foreground text-sm">{translate('shareRoomDescription')}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => copyToClipboard(roomIdFromParams, 'id')} className="flex-1">
                            <Copy className="mr-2 h-4 w-4" /> {translate('copyRoomIdButton')}
                        </Button>
                        <Button variant="outline" onClick={() => copyToClipboard(window.location.href, 'link')} className="flex-1">
                            <LinkIcon className="mr-2 h-4 w-4" /> {translate('copyRoomLinkButton')}
                        </Button>
                    </div>
                    <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2.05 22L7.31 20.62C8.72 21.39 10.33 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.49 20.13 8.99 19.68 7.74 18.89L7.32 18.64L4.4 19.56L5.34 16.74L5.07 16.3C4.18 14.95 3.71 13.38 3.71 11.91C3.71 7.33 7.45 3.6 12.04 3.6C16.63 3.6 20.37 7.33 20.37 11.91C20.37 16.5 16.63 20.13 12.04 20.13ZM17.36 14.45C17.11 14.79 16.23 15.26 15.92 15.43C15.61 15.6 15.37 15.62 15.13 15.33C14.89 15.04 14.01 14.31 12.96 13.25C12.11 12.41 11.53 11.64 11.38 11.35C11.24 11.06 11.39 10.89 11.53 10.75C11.65 10.61 11.83 10.39 12 10.21C12.17 10.03 12.24 9.89 12.36 9.65C12.48 9.41 12.41 9.2 12.33 9.03C12.25 8.86 11.76 7.65 11.54 7.18C11.32 6.71 11.09 6.76 10.92 6.75C10.75 6.74 10.54 6.74 10.32 6.74C10.1 6.74 9.81 6.81 9.56 7.15C9.31 7.49 8.61 8.13 8.61 9.35C8.61 10.57 9.59 11.73 9.73 11.91C9.87 12.09 11.76 14.84 14.51 16.1C15.2 16.41 15.73 16.62 16.13 16.78C16.71 17.02 17.07 16.97 17.32 16.73C17.57 16.49 18.12 15.88 18.29 15.54C18.46 15.2 18.46 14.91 18.38 14.79C18.3 14.68 17.61 14.11 17.36 14.45Z"/>
                        </svg>
                        {translate('shareViaWhatsApp')}
                    </Button>
                </div>
                 <Button onClick={handleLeaveRoom} variant="ghost" size="lg" className="w-full text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                  <LogOut className="mr-2 h-5 w-5" /> {translate('leaveRoomButton')}
                </Button>
            </CardFooter>
          </Card>
        </main>
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendChatMessageInRoom} // Use DB sending for room chat
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          currentUserUid={user?.uid}
          currentUserName={user?.displayName || translate('playerNameDefault')}
          currentUserAvatar={user?.photoURL}
          language={language}
          currentRoomId={roomIdFromParams} // Pass room ID
        />
        <AppFooter language={language} />
      </div>
    </TooltipProvider>
  );
}
