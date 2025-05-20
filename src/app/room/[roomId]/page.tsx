
"use client";

import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Info, Share2, LogOut, Copy, Link as LinkIcon, UserPlus, Gamepad2, Circle, PlayCircle, RotateCcw, Loader2, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import type { Language } from '@/contexts/language-context';
import { useLanguage } from '@/contexts/language-context';
import { useRoom } from '@/contexts/room-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue, update, serverTimestamp, onDisconnect, set, off, push, child, get } from "firebase/database";
import { app as firebaseApp } from '@/lib/firebase/config';
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
import { UI_TEXTS } from '@/constants/ui-texts'; // Common texts
// import { ROOM_TEXTS } from '@/constants/room-texts'; // Consider creating this if texts become too many

const ROUND_DURATION_SECONDS_ROOM = 90; // Example duration

interface PlayerInRoom {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  joinedAt?: number;
  hasSubmitted?: boolean; // True if this player has submitted answers for the currentRoundId
  submittedAnswersForRound?: string | null; // roundId for which answers were submitted
}

interface GameData {
  status: "LOBBY" | "SPINNING" | "PLAYING" | "EVALUATING_SHARED" | "SHARED_RESULTS";
  currentLetter: string | null;
  currentCategories: string[] | null;
  roundStartTime: number | null;
  hostId: string | null; // UID of the player who started the game in the room
  currentRoundId: string | null; // Unique ID for the current round
}

interface PlayerSubmission { // Data written by each player to Firebase
  answers: Record<string, string>;
  submittedAt: any; // Firebase serverTimestamp
}

interface ValidatedWordInfo { // Result of AI validation for a single word
  playerWord: string;
  isValid: boolean;
  errorReason: 'format' | 'invalid_word' | 'api_error' | null;
}

interface PlayerRoundCategoryResult extends ValidatedWordInfo { // For one category of one player
  score: number;
}

export interface PlayerRoundOutcome { // Overall result for one player in a round
  totalScore: number;
  categories: Record<string, PlayerRoundCategoryResult>; // categoryName -> result
  playerName: string;
  playerAvatar?: string | null;
}

interface RoundEvaluationData { // Data written by host after evaluating all submissions
  aiResponses: Record<string, string>; // categoryName -> AI's word
  playerOutcomes: Record<string, PlayerRoundOutcome>; // playerId -> PlayerRoundOutcome
}

// TODO: Consider moving ROOM_TEXTS to a separate constants file like ui-texts.ts
const ROOM_TEXTS = {
  title: { es: "Sala de Juego:", en: "Game Room:", fr: "Salle de Jeu :", pt: "Sala de Jogo:" },
  welcome: { es: "¡Bienvenido/a a la sala!", en: "Welcome to the room!", fr: "Bienvenue dans la salle !", pt: "Bem-vindo(a) à sala!" },
  playerListTitle: { es: "Jugadores en la Sala", en: "Players in Room", fr: "Joueurs dans la Salle", pt: "Jogadores na Sala" },
  playerListDescription: {
    es: "Aquí verás la lista de jugadores conectados a esta sala. El estado en línea se actualiza en tiempo real.",
    en: "Here you will see the list of players connected to this room. Online status updates in real-time.",
    fr: "Ici, vous verrez la liste des joueurs connectés à cette salle. Le statut en ligne est mis à jour en temps réel.",
    pt: "Aqui você verá la lista de jogadores conectados a esta sala. O status online atualiza em tempo real."
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
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" }, // Already in UI_TEXTS, but useful here too
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" }, // Already in UI_TEXTS
  startGameButton: { es: "Iniciar Partida", en: "Start Game", fr: "Démarrer la Partie", pt: "Iniciar Jogo"},
  startGameDescription: {
    es: "Solo el anfitrión puede iniciar la partida. ¡Prepara tus respuestas! El juego multijugador en tiempo real está en desarrollo.",
    en: "Only the host can start the game. Get your answers ready! Real-time multiplayer gameplay is under development.",
    fr: "Seul l'hôte peut démarrer la partie. Préparez vos réponses ! Le jeu multijoueur en temps réel est en développement.",
    pt: "Apenas o anfitrião pode iniciar o jogo. Prepare suas respostas! O jogo multijogador em tempo real está em desenvolvimento."
  },
  noPlayersInRoom: { es: "No hay jugadores en esta sala todavía.", en: "No players in this room yet.", fr: "Aucun joueur dans cette salle pour le moment.", pt: "Nenhum jogador nesta sala ainda." },
  onlineStatus: { es: "En línea", en: "Online", fr: "En ligne", pt: "Online" },
  offlineStatus: { es: "Desconectado", en: "Offline", fr: "Hors ligne", pt: "Offline" },
  errorJoiningRoom: { es: "Error al unirse a la sala", en: "Error joining room", fr: "Erreur en rejoignant la salle", pt: "Erro ao entrar na sala" },
  errorLoadingPlayers: { es: "Error al cargar jugadores", en: "Error loading players", fr: "Erreur de chargement des joueurs", pt: "Erro ao carregar jogadores" },
  copiedToClipboard: { es: "copiado.", en: "copied.", fr: "copié.", pt: "copiado." },
  couldNotCopy: { es: "No se pudo copiar.", en: "Could not copy.", fr: "Impossible de copier.", pt: "Não foi possível copiar." },
  loadingRoom: { es: "Cargando sala...", en: "Loading room...", fr: "Chargement de la salle...", pt: "Carregando sala..." },
  gameStatusLobby: { es: "Lobby: Esperando al anfitrión para iniciar.", en: "Lobby: Waiting for host to start.", fr: "Lobby : En attente de l'hôte pour démarrer.", pt: "Lobby: Esperando o anfitrião iniciar." },
  gameStatusSpinning: { es: "¡Girando la ruleta!", en: "Spinning the wheel!", fr: "La roue tourne !", pt: "Girando a roleta!" },
  gameStatusPlaying: { es: "¡A Jugar! Letra:", en: "Game On! Letter:", fr: "C'est parti ! Lettre :", pt: "Jogo Começou! Letra:" },
  gameStatusEvaluating: { es: "Anfitrión evaluando...", en: "Host evaluating...", fr: "L'hôte évalue...", pt: "Anfitrião avaliando..." }, // New
  gameStatusSharedResults: { es: "Resultados de la Ronda (Compartidos)", en: "Round Results (Shared)", fr: "Résultats de la Manche (Partagés)", pt: "Resultados da Rodada (Compartilhados)" }, // New
  submitAnswersButton: { es: "¡ALTO! (Enviar Respuestas)", en: "STOP! (Submit Answers)", fr: "STOP ! (Envoyer Réponses)", pt: "PARE! (Enviar Respostas)" }, // New
  waitingForHostEvaluation: { es: "Respuestas enviadas. Esperando al anfitrión para evaluar y ver resultados...", en: "Answers submitted. Waiting for host to evaluate and show results...", fr: "Réponses envoyées. En attente de l'évaluation par l'hôte et des résultats...", pt: "Respostas enviadas. Esperando o anfitrião avaliar e mostrar resultados..." }, // New
  evaluateRoundButton: { es: "Evaluar Ronda (Anfitrión)", en: "Evaluate Round (Host)", fr: "Évaluer la Manche (Hôte)", pt: "Avaliar Rodada (Anfitrião)" }, // New
  nextRoundButtonHost: { es: "Siguiente Ronda (Anfitrión)", en: "Next Round (Host)", fr: "Prochaine Manche (Hôte)", pt: "Próxima Rodada (Anfitrião)" }, // New
  waitingForNextRound: { es: "Esperando al anfitrión para la siguiente ronda...", en: "Waiting for host for next round...", fr: "En attente de l'hôte pour la prochaine manche...", pt: "Esperando o anfitrião para a próxima rodada..." }, // New
  timeLeftLabel: { es: "Tiempo:", en: "Time:", fr: "Temps :", pt: "Tempo:" },
  pointsSuffix: { es: "pts", en: "pts", fr: "pts", pt: "pts" },
  chatTitle: { es: "Chat de la Sala", en: "Room Chat", fr: "Chat de la Salle", pt: "Chat da Sala"},
  chatDescription: { es: "Comunícate con otros jugadores.", en: "Chat with other players.", fr: "Discutez avec les autres joueurs.", pt: "Converse com outros jogadores."},
  chatLoginMessage: { es: "Debes iniciar sesión para chatear.", en: "You must be logged in to chat.", fr: "Vous devez être connecté pour discuter.", pt: "Você precisa estar logado para conversar." },
  notSubmitted: { es: "(Aún no ha enviado)", en: "(Not submitted yet)", fr: "(Pas encore soumis)", pt: "(Ainda não enviou)" },
  submitted: { es: "(Enviado)", en: "(Submitted)", fr: "(Soumis)", pt: "(Enviado)" },
  categoriesLabel: { es: "Categorías:", en: "Categories:", fr: "Catégories :", pt: "Categorias:"},
  player: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
  score: { es: "Puntos", en: "Score", fr: "Score", pt: "Pontos" },
  aiPlayerName: { es: "Oponente IA", en: "AI Opponent", fr: "Adversaire IA", pt: "Oponente IA"},
  errorValidatingWord: {es: "Error al validar", en: "Validation error", fr: "Erreur de validation", pt: "Erro de validação"},
  resultsTitleShared: {es: "Resultados Compartidos de la Ronda", en: "Shared Round Results", fr: "Résultats Partagés de la Manche", pt: "Resultados Compartidos da Rodada"},
  noSubmissionsToEvaluate: {es: "No hay respuestas para evaluar.", en: "No submissions to evaluate.", fr: "Aucune soumission à évaluer.", pt: "Nenhuma submissão para avaliar."},
  evaluationInProgress: {es: "Evaluando respuestas, por favor espera...", en: "Evaluating answers, please wait...", fr: "Évaluation des réponses, veuillez patienter...", pt: "Avaliando respostas, por favor aguarde..."},
  errorEvaluating: {es: "Error al evaluar la ronda", en: "Error evaluating round", fr: "Erreur lors de l'évaluation de la manche", pt: "Erro ao avaliar a rodada"},
  roundEvaluated: {es: "Ronda evaluada", en: "Round evaluated", fr: "Manche évaluée", pt: "Rodada avaliada"},
  playerHasNotSubmitted: { es: "(No envió respuestas)", en: "(Did not submit answers)", fr: "(N'a pas soumis de réponses)", pt: "(Não enviou respostas)"},

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

const db = getDatabase(firebaseApp);

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
  const [isEvaluatingByHost, setIsEvaluatingByHost] = useState(false); // For host loading state
  const [roundEvaluation, setRoundEvaluation] = useState<RoundEvaluationData | null>(null);

  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS_ROOM);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const localPlayerSubmittedRef = useRef(localPlayerSubmitted);
  const playerResponsesRef = useRef(playerResponses);

  useEffect(() => {
    localPlayerSubmittedRef.current = localPlayerSubmitted;
  }, [localPlayerSubmitted]);

  useEffect(() => {
    playerResponsesRef.current = playerResponses;
  }, [playerResponses]);


  const translate = (textKey: keyof typeof ROOM_TEXTS, replacements?: Record<string, string>) => {
    let text = translateContext(ROOM_TEXTS[textKey]) || ROOM_TEXTS[textKey]?.['en'] || String(textKey);
    if (replacements) {
      Object.keys(replacements).forEach(key => {
        text = text.replace(`{${key}}`, replacements[key]);
      });
    }
    return text;
  };
  const commonTranslate = (textKey: keyof typeof UI_TEXTS) => {
    return translateContext(UI_TEXTS[textKey]) || UI_TEXTS[textKey]?.['en'] || String(textKey);
  };

  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
  const defaultCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;

  const handlePlayerJoin = useCallback(() => {
    if (!user || !roomIdFromParams) return;

    const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
    const playerStatusRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/isOnline`);
    const playerLastSeenRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/lastSeen`);
    
    const currentDefaultPlayerName = commonTranslate('playerNameDefault');

    const playerData = {
      name: user.displayName || currentDefaultPlayerName,
      avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || currentDefaultPlayerName).charAt(0)}`,
      joinedAt: serverTimestamp(),
      isOnline: true,
      hasSubmitted: false, // Reset on join/rejoin
      submittedAnswersForRound: null,
    };

    update(playerRef, playerData)
      .then(() => {
        onDisconnect(playerStatusRef).set(false);
        onDisconnect(playerLastSeenRef).set(serverTimestamp());
        set(playerStatusRef, true); // Explicitly set to true after initial write
      })
      .catch((error) => {
        console.error("Error joining/updating player in room:", error);
        toast({ title: translate('errorJoiningRoom'), description: (error as Error).message, variant: "destructive" });
      });
  }, [user, roomIdFromParams, toast, translate, commonTranslate]); // db is stable

  // Effect for main room data, player presence, and game state
  useEffect(() => {
    if (roomIdFromParams && roomIdFromParams !== activeRoomId) {
      setActiveRoomId(roomIdFromParams);
    }

    if (!user || !roomIdFromParams) {
      setConnectedPlayers([]);
      setGameData(null);
      setChatMessages([]);
      return;
    }

    handlePlayerJoin();

    const playersRef = ref(db, `rooms/${roomIdFromParams}/players`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      const currentPlayers: PlayerInRoom[] = [];
      const currentDefaultPlayerName = commonTranslate('playerNameDefault');
      if (data) {
        Object.keys(data).forEach((playerId) => {
          currentPlayers.push({
            id: playerId,
            name: data[playerId].name || currentDefaultPlayerName,
            avatar: data[playerId].avatar || `https://placehold.co/40x40.png?text=${(data[playerId].name || currentDefaultPlayerName).charAt(0)}`,
            isCurrentUser: user?.uid === playerId,
            isOnline: data[playerId].isOnline || false,
            joinedAt: data[playerId].joinedAt || Date.now(),
            hasSubmitted: !!data[playerId].hasSubmitted,
            submittedAnswersForRound: data[playerId].submittedAnswersForRound || null,
          });
        });
      }
      currentPlayers.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
      setConnectedPlayers(currentPlayers);
    }, (error) => {
      console.error("Error fetching players:", error);
      toast({ title: translate('errorLoadingPlayers'), description: error.message, variant: "destructive" });
    });

    const gameDataRefPath = `rooms/${roomIdFromParams}/currentGameData`;
    const gameDataRef = ref(db, gameDataRefPath);
    const unsubscribeGameData = onValue(gameDataRef, (snapshot) => {
      const data = snapshot.val() as GameData | null;
      if (data) {
        setGameData(data);
        if (data.status === "PLAYING" && data.currentRoundId) {
            const playerRecord = connectedPlayers.find(p => p.id === user?.uid);
            // Check if player submitted for the *current* round
            if (playerRecord?.submittedAnswersForRound === data.currentRoundId) {
                setLocalPlayerSubmitted(true);
            } else {
                setLocalPlayerSubmitted(false); // Player hasn't submitted for this new round
                setPlayerResponses({}); // Clear responses for the new round
            }
        } else if (data.status === "LOBBY") {
           setLocalPlayerSubmitted(false); // Reset submission status when returning to lobby
           setPlayerResponses({}); // Clear responses
           setRoundEvaluation(null); // Clear previous round's shared results
        }
      } else {
        // If no game data, initialize it (e.g., first player enters an empty room)
        if (user) { // Only if user is present
          const initialGameData: GameData = {
            status: "LOBBY",
            currentLetter: null,
            currentCategories: defaultCategories, // Use default categories for the current language
            roundStartTime: null,
            hostId: user.uid, // First player becomes host
            currentRoundId: null,
          };
          set(gameDataRef, initialGameData).then(() => setGameData(initialGameData));
        }
      }
    });
    
    const chatMessagesRefPath = `rooms/${roomIdFromParams}/chatMessages`;
    const chatMessagesRef = ref(db, chatMessagesRefPath);
    const unsubscribeChat = onValue(chatMessagesRef, (snapshot) => {
        const data = snapshot.val();
        const loadedMessages: ChatMessage[] = [];
        if (data) {
            Object.keys(data).forEach(key => {
                 loadedMessages.push({ id: key, ...data[key], timestamp: new Date(data[key].timestamp || Date.now()) });
            });
            loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
        setChatMessages(loadedMessages);
    }, (error) => {
        console.error("Error fetching chat messages:", error);
        toast({ title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudieron cargar los mensajes.", variant: "destructive"});
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGameData();
      unsubscribeChat();
      if (user && roomIdFromParams) { // Ensure user and roomId are still valid on unmount
        const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
        update(playerRef, { isOnline: false, lastSeen: serverTimestamp() }).catch(e => console.warn("Error setting offline on unmount:", e));
      }
    };
  }, [roomIdFromParams, user, activeRoomId, setActiveRoomId, handlePlayerJoin, toast, translate, commonTranslate, defaultCategories]); // db is stable

  const currentRoundIdForEffect = gameData?.currentRoundId; // Stable variable for dependency

  useEffect(() => { // Separate useEffect for roundEvaluation listener
    let unsubscribeRoundEval: (() => void) | null = null;
    if (roomIdFromParams && currentRoundIdForEffect) {
      const roundEvaluationRefPath = `rooms/${roomIdFromParams}/roundsData/${currentRoundIdForEffect}/evaluation`;
      const roundEvaluationRef = ref(db, roundEvaluationRefPath);
      unsubscribeRoundEval = onValue(roundEvaluationRef, (snapshot) => {
        setRoundEvaluation(snapshot.val() as RoundEvaluationData | null);
      });
    } else {
      setRoundEvaluation(null); // Clear evaluation data if no current round or room
    }
    return () => {
      if (unsubscribeRoundEval) unsubscribeRoundEval();
    };
  }, [roomIdFromParams, currentRoundIdForEffect, db]); // db is stable


  const currentRoundIdForSubmit = gameData?.currentRoundId;

  const handleSubmitAnswers = useCallback(async () => {
    // Use refs for most current state inside callback
    if (!user || !roomIdFromParams || !currentRoundIdForSubmit || localPlayerSubmittedRef.current) return;

    const submissionPath = `rooms/${roomIdFromParams}/roundsData/${currentRoundIdForSubmit}/submissions/${user.uid}`;
    const submissionData: PlayerSubmission = {
      answers: playerResponsesRef.current, // Use ref here
      submittedAt: serverTimestamp(),
    };

    try {
      await set(ref(db, submissionPath), submissionData);
      // Update player's local status and in Firebase
      await update(ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`), {
          hasSubmitted: true,
          submittedAnswersForRound: currentRoundIdForSubmit // Mark submission for this specific round
      });
      setLocalPlayerSubmitted(true); // Update local state
      toast({ title: translate('submitAnswersButton'), description: translate('waitingForHostEvaluation')});
    } catch (error) {
        console.error("Error submitting answers:", error);
        toast({title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudieron enviar tus respuestas.", variant: "destructive"});
    }
  }, [user, roomIdFromParams, currentRoundIdForSubmit, toast, translate, setLocalPlayerSubmitted]); // db is stable


  useEffect(() => {
    const gameStatus = gameData?.status;
    const roundStartTime = gameData?.roundStartTime;

    if (gameStatus === "PLAYING" && roundStartTime && !localPlayerSubmitted) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const updateTimer = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - roundStartTime) / 1000);
        const remaining = ROUND_DURATION_SECONDS_ROOM - elapsedSeconds;
        setTimeLeft(remaining > 0 ? remaining : 0);

        if (remaining <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (!localPlayerSubmittedRef.current) { // Check ref before submitting
             handleSubmitAnswers();
          }
        }
      };
      updateTimer(); // Initial call to set time immediately
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimeLeft(ROUND_DURATION_SECONDS_ROOM); // Reset timer display
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameData?.status, gameData?.roundStartTime, localPlayerSubmitted, handleSubmitAnswers]);


  const handleLeaveRoom = () => {
    if (user && roomIdFromParams) {
      const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
      update(playerRef, { isOnline: false, lastSeen: serverTimestamp() });
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
    if (!user || !roomIdFromParams || (gameData?.hostId !== user.uid && gameData?.hostId !== null)) { // Allow first player to become host
        toast({ title: "Acción no permitida", description: "Solo el anfitrión puede iniciar la partida.", variant: "destructive" });
        return;
    }

    const newRoundId = push(child(ref(db), 'rounds')).key || `round-${Date.now()}`;
    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    const initialGameUpdate: Partial<GameData> = {
      status: "SPINNING",
      currentRoundId: newRoundId,
      hostId: gameData?.hostId || user.uid, // Assign host if not already set
      currentLetter: null,
      currentCategories: defaultCategories, // Use categories based on current language
      roundStartTime: null,
    };
    update(gameDataRef, initialGameUpdate);

    // Reset submission status for all players for the new round
    connectedPlayers.forEach(p => {
        if (p.id) { // Check if player id exists
            update(ref(db, `rooms/${roomIdFromParams}/players/${p.id}`), { hasSubmitted: false, submittedAnswersForRound: null });
        }
    });
    setLocalPlayerSubmitted(false); // Reset for current user
    setRoundEvaluation(null); // Clear previous shared results
  };

  const handleSpinCompleteInRoom = (letter: string) => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid) return;

    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    const gameUpdate: Partial<GameData> = {
      currentLetter: letter,
      roundStartTime: Date.now(), // Set round start time
      status: "PLAYING",
    };
    update(gameDataRef, gameUpdate);
  };

  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const handleEvaluateRound = useCallback(async () => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid || !gameData.currentRoundId) {
      toast({ title: "No autorizado", description: "Solo el anfitrión puede evaluar la ronda.", variant: "destructive"});
      return;
    }
    setIsEvaluatingByHost(true);
    toast({ title: translate('evaluationInProgress'), variant: "default"});
    await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "EVALUATING_SHARED" });

    const roundId = gameData.currentRoundId;
    const submissionsRef = ref(db, `rooms/${roomIdFromParams}/roundsData/${roundId}/submissions`);
    const submissionsSnapshot = await get(submissionsRef);
    const submissionsData = submissionsSnapshot.val() as Record<string, PlayerSubmission> | null;

    if (!submissionsData || Object.keys(submissionsData).length === 0) {
      toast({ title: translate('noSubmissionsToEvaluate'), variant: "destructive"});
      await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "LOBBY" }); // Revert to LOBBY if no submissions
      setIsEvaluatingByHost(false);
      return;
    }

    const categories = gameData.currentCategories || defaultCategories;
    const letter = gameData.currentLetter!; // Should be set if gameData.status was PLAYING

    // 1. Generate AI responses
    const aiResponses: Record<string, string> = {};
    for (const category of categories) {
      try {
        const aiInput: AiOpponentResponseInput = { letter, category, language };
        const aiResult = await generateAiOpponentResponse(aiInput);
        aiResponses[category] = (aiResult.response || "").trim();
      } catch (e) {
        console.error(`Error getting AI response for ${category}:`, e);
        aiResponses[category] = "";
      }
    }

    // 2. Validate all player words
    const allPlayerValidatedWords: Record<string, Record<string, ValidatedWordInfo>> = {}; // playerId -> categoryName -> ValidatedWordInfo
    const playerIdsWhoSubmitted = Object.keys(submissionsData);

    for (const playerId of playerIdsWhoSubmitted) {
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
            if (!isValid) errorReason = validationResult.isValid === false ? 'invalid_word' : 'api_error'; // Simplified error reason
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

    // Initialize outcomes for all *connected* players to ensure everyone appears in results
    for (const player of connectedPlayers) {
        const playerInfo = connectedPlayers.find(p => p.id === player.id); // Get latest info
        finalPlayerOutcomes[player.id] = {
            totalScore: 0,
            categories: {},
            playerName: playerInfo?.name || commonTranslate('playerNameDefault'),
            playerAvatar: playerInfo?.avatar || null,
        };
    }


    for (const currentPlayerId of playerIdsWhoSubmitted) {
      const currentPlayerInfo = connectedPlayers.find(p => p.id === currentPlayerId);
      // Ensure entry exists, though the loop above should have created it
      if (!finalPlayerOutcomes[currentPlayerId]) {
         finalPlayerOutcomes[currentPlayerId] = {
            totalScore: 0,
            categories: {},
            playerName: currentPlayerInfo?.name || commonTranslate('playerNameDefault'),
            playerAvatar: currentPlayerInfo?.avatar
          };
      }

      for (const category of categories) {
        const currentPlayerValidatedInfo = allPlayerValidatedWords[currentPlayerId]?.[category];

        // If player didn't submit for this category or validation failed to produce info (should not happen if initialized)
        if (!currentPlayerValidatedInfo) {
            finalPlayerOutcomes[currentPlayerId].categories[category] = { // Add a placeholder if missing
                playerWord: "", isValid: false, errorReason: null, score: 0
            };
            continue;
        }

        let pScore = 0;
        if (currentPlayerValidatedInfo.isValid) {
          const aiWordForCat = aiResponses[category] || "";
          const aiWordValid = aiWordForCat !== "" && aiWordForCat.toLowerCase().startsWith(letter.toLowerCase());

          // Check uniqueness against other players' *valid* words
          let uniqueAmongPlayers = true;
          for (const otherPlayerId of playerIdsWhoSubmitted) {
            if (otherPlayerId === currentPlayerId) continue;
            const otherPlayerValidatedInfo = allPlayerValidatedWords[otherPlayerId]?.[category];
            if (otherPlayerValidatedInfo?.isValid && otherPlayerValidatedInfo.playerWord.toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
              uniqueAmongPlayers = false;
              break;
            }
          }

          if (uniqueAmongPlayers) {
            // Word is valid and unique among players
            if (aiWordValid && aiWordForCat.toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
              pScore = 50; // Player's word is valid, unique among players, but same as AI's valid word
            } else {
              pScore = 100; // Player's word is valid, unique among players, and different from AI's (or AI's is invalid)
            }
          } else {
            // Word is valid but NOT unique among players (another player submitted the same valid word)
            pScore = 50;
          }
        } // else, if not currentPlayerValidatedInfo.isValid, pScore remains 0

        finalPlayerOutcomes[currentPlayerId].categories[category] = {
            playerWord: currentPlayerValidatedInfo.playerWord,
            isValid: currentPlayerValidatedInfo.isValid,
            errorReason: currentPlayerValidatedInfo.errorReason,
            score: pScore,
        };
        finalPlayerOutcomes[currentPlayerId].totalScore += pScore;
      }
    }

    // Prepare data for Firebase
    const evaluationData: RoundEvaluationData = {
      aiResponses,
      playerOutcomes: finalPlayerOutcomes,
    };

    try {
      await set(ref(db, `rooms/${roomIdFromParams}/roundsData/${roundId}/evaluation`), evaluationData);
      await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "SHARED_RESULTS" });
      toast({title: translate('roundEvaluated'), description: "Los resultados están disponibles para todos."});
    } catch (error) {
        console.error("Error saving evaluation or updating game status:", error);
        toast({title: translate('errorEvaluating'), description: (error as Error).message, variant: "destructive"});
        await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "LOBBY" }); // Revert to LOBBY on error
    } finally {
        setIsEvaluatingByHost(false);
    }
  }, [user, roomIdFromParams, gameData, connectedPlayers, toast, language, translate, commonTranslate, defaultCategories]); // Added connectedPlayers

  const handleStartNextRound = () => {
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid ) return;
    // Call the main game start logic, which will generate a new round ID and reset states.
    handleStartGame();
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  const handleSendChatMessageInRoom = (text: string, roomIdForMessage?: string | null) => { // roomIdForMessage comes from ChatPanel
    if (!user || !roomIdForMessage) {
      toast({ title: commonTranslate(UI_TEXTS.chatLoginTitle as keyof typeof UI_TEXTS), description: commonTranslate(UI_TEXTS.chatLoginMessage as keyof typeof UI_TEXTS), variant: "destructive" });
      return;
    }
    const messagesListRef = ref(db, `rooms/${roomIdForMessage}/chatMessages`);
    const newMessageRef = push(messagesListRef);
    const currentDefaultPlayerName = commonTranslate('playerNameDefault');
    const messageData: Omit<ChatMessage, 'id' | 'timestamp'> & { timestamp: any } = { // Use Omit for Firebase structure
      text,
      sender: {
        name: user.displayName || currentDefaultPlayerName,
        uid: user.uid, // Ensure UID is included
        avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || currentDefaultPlayerName).charAt(0)}`,
      },
      timestamp: serverTimestamp(),
    };
    set(newMessageRef, messageData).catch(error => {
      console.error("Error sending chat message:", error);
      toast({ title: translate(UI_TEXTS.errorToastTitle as keyof typeof ROOM_TEXTS), description: "No se pudo enviar tu mensaje.", variant: "destructive" });
    });
  };


  if (!roomIdFromParams || !user || !gameData) { // Ensure gameData is loaded
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

  // Determine if the "Evaluate Round" button should be enabled for the host
  let allOnlinePlayersSubmitted = false;
  if (gameData?.status === "PLAYING" && connectedPlayers.length > 0 && gameData.currentRoundId) {
    const onlinePlayers = connectedPlayers.filter(p => p.isOnline);
    if (onlinePlayers.length > 0) {
        allOnlinePlayersSubmitted = onlinePlayers.every(p => p.hasSubmitted && p.submittedAnswersForRound === gameData.currentRoundId);
    } else if (isHost) { // If host is the only one online, they can evaluate their own submission
        allOnlinePlayersSubmitted = true;
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
                className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/50"
                aria-label={translate('chatTitle')}
            >
                <MessageSquare className="h-7 w-7" />
            </Button>

          <Card className="w-full max-w-3xl shadow-xl rounded-xl mb-6">
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
              {gameData?.status === "LOBBY" && (
                <div className="text-center space-y-4">
                  <Button
                    size="lg"
                    className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={handleStartGame}
                    disabled={!isHost && gameData.hostId !== null && gameData.hostId !== user.uid} // Only host can start
                  >
                    <PlayCircle className="mr-3 h-6 w-6" />
                    {translate('startGameButton')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {gameData.hostId === null && user?.uid ? "Serás el anfitrión al iniciar." : (isHost ? "Eres el anfitrión." : translate('startGameDescription'))}
                    <br />
                    La funcionalidad completa multijugador está en desarrollo.
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

              {gameData?.status === "PLAYING" && gameData.currentLetter && currentCategoriesToUse && (
                <div className="space-y-4">
                  <div className="my-4 w-full max-w-md text-center p-3 bg-card rounded-lg shadow mx-auto">
                    <div className="flex items-center justify-center mb-1">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        <p className="text-xl font-semibold text-primary">{translate('timeLeftLabel')} {timeLeft < 0 ? 0 : timeLeft}s</p>
                    </div>
                    <Progress value={timeLeft > 0 ? (timeLeft / ROUND_DURATION_SECONDS_ROOM) * 100 : 0} className="w-full h-2" />
                  </div>
                  {!localPlayerSubmitted ? (
                    <>
                      <GameArea
                        letter={gameData.currentLetter}
                        categories={currentCategoriesToUse}
                        playerResponses={playerResponses}
                        onInputChange={handleInputChange}
                        isEvaluating={false} // Player is inputting, not evaluating others
                        showResults={false}
                        roundResults={null} // No local results shown during room play input
                        language={language}
                        gameMode="room"
                      />
                      <div className="flex justify-center mt-4">
                        <StopButton
                            onClick={handleSubmitAnswers}
                            disabled={!canPlayerSubmit || timeLeft <=0} // Disable if already submitted or time up
                            language={language}
                            label={translate('submitAnswersButton')}
                        />
                      </div>
                    </>
                  ) : (
                    <Card className="p-6 text-center bg-muted/30 rounded-lg shadow">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3"/>
                      <p className="text-lg font-semibold text-card-foreground">{translate('waitingForHostEvaluation')}</p>
                    </Card>
                  )}
                </div>
              )}

              {gameData?.status === "EVALUATING_SHARED" && (
                 <Card className="p-6 text-center bg-muted/30 rounded-lg shadow">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3"/>
                    <p className="text-lg font-semibold text-card-foreground">{translate('gameStatusEvaluating')}</p>
                 </Card>
              )}

              {gameData?.status === "SHARED_RESULTS" && roundEvaluation && (
                <div className="space-y-4 animate-fadeInUp">
                  <h3 className="text-2xl font-bold text-center text-accent">{translate('resultsTitleShared')}</h3>
                  {roundEvaluation.aiResponses && Object.keys(roundEvaluation.aiResponses).length > 0 && (
                    <Card className="p-4 bg-muted/10 rounded-lg shadow-sm">
                        <CardTitle className="text-lg mb-2 text-secondary">{translate('aiPlayerName')}</CardTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                        {Object.entries(roundEvaluation.aiResponses).map(([cat, resp]) => (
                            <div key={`ai-${cat}`} className="truncate"><strong>{cat}:</strong> {resp || "-"}</div>
                        ))}
                        </div>
                    </Card>
                  )}
                  <Separator />
                  {Object.entries(roundEvaluation.playerOutcomes)
                    .sort(([,a],[,b]) => b.totalScore - a.totalScore) // Sort by score
                    .map(([pId, outcome]) => (
                     <Card key={pId} className="p-4 bg-card/80 rounded-lg shadow-md">
                        <CardHeader className="p-2 flex flex-row items-center justify-between space-x-2">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={outcome.playerAvatar || undefined} alt={outcome.playerName} data-ai-hint="avatar person"/>
                                    <AvatarFallback>{outcome.playerName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-xl text-primary-foreground">{outcome.playerName} {pId === user?.uid ? <span className="text-xs text-accent">{translate('youSuffix')}</span> : ''}</CardTitle>
                            </div>
                            <p className="text-3xl font-bold text-primary">{outcome.totalScore} <span className="text-base font-normal">{translate('score')}</span></p>
                        </CardHeader>
                        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {Object.entries(outcome.categories).map(([catName, catResult]) => (
                                <div key={`${pId}-${catName}`} className="p-2 border border-border/50 rounded-md bg-background/50">
                                    <p className="font-semibold text-secondary-foreground">{catName}: <span className="font-normal text-foreground">{catResult.playerWord || <span className="italic text-muted-foreground">{"-"}</span>}</span></p>
                                    <div className="flex justify-between items-center text-xs mt-1">
                                        <span className={cn("inline-flex items-center", catResult.isValid ? "text-green-600" : "text-destructive")}>
                                            {catResult.playerWord && (catResult.isValid ?
                                                <CheckCircle className="h-4 w-4 mr-1"/> :
                                                <XCircle className="h-4 w-4 mr-1"/>
                                            )}
                                            {catResult.playerWord ? (catResult.isValid ? "Válido" : (catResult.errorReason === 'format' ? "Formato Incorrecto" : catResult.errorReason === 'invalid_word' ? "Palabra Inválida" : translate('errorValidatingWord'))) : ""}
                                        </span>
                                        {catResult.playerWord && <span className="font-semibold text-primary">{catResult.score} {translate('pointsSuffix')}</span>}
                                    </div>
                                </div>
                            ))}
                             {!Object.keys(outcome.categories).length && <p className="text-muted-foreground text-center md:col-span-2">{translate('playerHasNotSubmitted')}</p>}
                        </CardContent>
                     </Card>
                  ))}
                  {isHost && (
                    <Button onClick={handleStartNextRound} size="lg" className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <RotateCcw className="mr-2 h-5 w-5"/> {translate('nextRoundButtonHost')}
                    </Button>
                  )}
                  {!isHost && (
                     <p className="text-center text-muted-foreground mt-6">{translate('waitingForNextRound')}</p>
                  )}
                </div>
              )}


              <div className="mt-8 space-y-3">
                <h3 className="text-xl font-semibold text-secondary flex items-center">
                  <Users className="mr-2 h-5 w-5" /> {translate('playerListTitle')}
                </h3>
                <div className="p-3 bg-muted/20 rounded-md min-h-[100px] space-y-2">
                  {connectedPlayers.length > 0 ? (
                    connectedPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-card/50 rounded shadow-sm hover:bg-card/70 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatar || undefined} alt={player.name} data-ai-hint="avatar person"/>
                                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Circle
                                  className={cn(
                                    "h-3 w-3 absolute bottom-0 right-0 border-2 border-background rounded-full",
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
                            {gameData?.hostId === player.id && <span className="text-xs text-yellow-500 ml-1">(Anfitrión)</span>}
                          </span>
                           {gameData?.status === "PLAYING" && gameData.currentRoundId && player.id !== user?.uid && (
                                <span className="text-xs text-muted-foreground ml-2">
                                    {(player.hasSubmitted && player.submittedAnswersForRound === gameData.currentRoundId) ? translate('submitted') : translate('notSubmitted')}
                                </span>
                            )}
                           {gameData?.status === "PLAYING" && gameData.currentRoundId && player.id === user?.uid && localPlayerSubmitted && (
                                <span className="text-xs text-green-500 ml-2">
                                    {translate('submitted')}
                                </span>
                            )}
                        </div>
                        {/* Add Friend button could be added here if needed from Room Page, currently in Lobby */}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-3">{translate('noPlayersInRoom')}</p>
                  )}
                   <p className="text-xs text-muted-foreground text-center pt-2">{translate('playerListDescription')}</p>
                </div>
                 {isHost && gameData?.status === "PLAYING" && gameData.currentRoundId && ( // Host action section
                    <Button
                        onClick={handleEvaluateRound}
                        disabled={isEvaluatingByHost || !allOnlinePlayersSubmitted}
                        className="w-full mt-4 bg-accent hover:bg-accent/90"
                        size="lg"
                    >
                        {isEvaluatingByHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {translate('evaluateRoundButton')}
                        {!allOnlinePlayersSubmitted && " (Esperando envíos)"}
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
          onSendMessage={handleSendChatMessageInRoom} // Use DB sending if in a room
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          currentUserUid={user?.uid} // Pass UID
          currentUserName={user?.displayName || commonTranslate('playerNameDefault')}
          currentUserAvatar={user?.photoURL}
          language={language}
          currentRoomId={roomIdFromParams} // Pass room ID to ChatPanel
        />
        <AppFooter language={language} />
         <style jsx global>{`
            .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
            }
            @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
      </div>
    </TooltipProvider>
  );
}

