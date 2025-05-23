
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
import { UI_TEXTS } from '@/constants/ui-texts'; 
import type { PlayerScore } from '@/app/page';


const ROUND_DURATION_SECONDS_ROOM = 90; 

interface PlayerInRoom {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
 joinedAt?: any; // Firebase Timestamp object or number or Date
  hasSubmitted?: any; // Allow serverTimestamp
  submittedAnswersForRound?: string | null | any; // Allow serverTimestamp
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
  submittedAt: any; 
}

interface ValidatedWordInfo { 
  playerWord: string;
  isValid: boolean;
  errorReason: 'format' | 'invalid_word' | 'api_error' | null;
}

interface PlayerRoundCategoryResult extends ValidatedWordInfo { 
  score: number;
}

export interface PlayerRoundOutcome { 
  totalScore: number;
  categories: Record<string, PlayerRoundCategoryResult>; 
  playerName: string;
  playerAvatar?: string | null;
}

interface RoundEvaluationData { 
  aiResponses: Record<string, string>; 
  playerOutcomes: Record<string, PlayerRoundOutcome>; 
}


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
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" }, 
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" }, 
  startGameButton: { es: "Iniciar Partida", en: "Start Game", fr: "Démarrer la Partie", pt: "Iniciar Jogo"},
  startGameDescription: {
    es: "Solo el anfitrión puede iniciar la partida. ¡Prepara tus respuestas! La funcionalidad para iniciar una partida multijugador real con otros jugadores en esta sala se añadirá en futuras actualizaciones.",
    en: "Only the host can start the game. Get your answers ready! The functionality to start a real multiplayer game with other players in this room will be added in future updates.",
    fr: "Seul l'hôte peut démarrer la partie. Préparez vos réponses ! La fonctionnalité pour démarrer une vraie partie multijoueur avec d'autres joueurs dans cette salle sera ajoutée dans les futures mises à jour.",
    pt: "Apenas o anfitrião pode iniciar o jogo. Prepare suas respostas! A funcionalidade para iniciar um jogo multijogador real com outros jogadores nesta sala será adicionada em futuras atualizações."
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
  gameStatusEvaluating: { es: "Anfitrión evaluando...", en: "Host evaluating...", fr: "L'hôte évalue...", pt: "Anfitrião avaliando..." }, 
  gameStatusSharedResults: { es: "Resultados de la Ronda (Compartidos)", en: "Round Results (Shared)", fr: "Résultats de la Manche (Partagés)", pt: "Resultados da Rodada (Compartilhados)" }, 
  submitAnswersButton: { es: "¡ALTO! (Enviar Respuestas)", en: "STOP! (Submit Answers)", fr: "STOP ! (Envoyer Réponses)", pt: "PARE! (Enviar Respostas)" }, 
  waitingForHostEvaluation: { es: "Respuestas enviadas. Esperando al anfitrión para evaluar y ver resultados...", en: "Answers submitted. Waiting for host to evaluate and show results...", fr: "Réponses envoyées. En attente de l'évaluation par l'hôte et des résultats...", pt: "Respostas enviadas. Esperando o anfitrião avaliar e mostrar resultados..." }, 
  evaluateRoundButton: { es: "Evaluar Ronda (Anfitrión)", en: "Evaluate Round (Host)", fr: "Évaluer la Manche (Hôte)", pt: "Avaliar Rodada (Anfitrião)" }, 
  nextRoundButtonHost: { es: "Siguiente Ronda (Anfitrión)", en: "Next Round (Host)", fr: "Prochaine Manche (Hôte)", pt: "Próxima Rodada (Anfitrião)" }, 
  waitingForNextRound: { es: "Esperando al anfitrión para la siguiente ronda...", en: "Waiting for host for next round...", fr: "En attente de l'hôte pour la prochaine manche...", pt: "Esperando o anfitrião para a próxima rodada..." }, 
  timeLeftLabel: { es: "Tiempo:", en: "Time:", fr: "Temps :", pt: "Tempo:" },
  pointsSuffix: { es: "pts", en: "pts", fr: "pts", pt: "pts" },
  chatTitle: { es: "Chat de la Sala", en: "Room Chat", fr: "Chat de la Salle", pt: "Chat da Sala"},
  chatDescription: { es: "Comunícate con otros jugadores.", en: "Chat with other players.", fr: "Discutez avec les autres joueurs.", pt: "Converse com outros jogadores."},
  chatLoginMessage: { es: "Debes iniciar sesión para chatear y participar plenamente.", en: "You must be logged in to chat and participate fully.", fr: "Vous devez être connecté pour discuter et participer pleinement.", pt: "Você precisa estar logado para conversar e participar plenamente." },
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
  loginToJoin: { es: "Inicia sesión para unirte", en: "Log in to join", fr: "Connectez-vous pour rejoindre", pt: "Faça login para entrar"},
  loginToJoinDescription: { es: "Debes iniciar sesión para participar activamente y aparecer en la lista de jugadores de la sala.", en: "You need to log in to actively participate and appear in the room's player list.", fr: "Vous devez vous connecter pour participer activement et apparaître dans la liste des joueurs de la salle.", pt: "Você precisa fazer login para participar ativamente e aparecer na lista de jogadores da sala."},
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
  const [isEvaluatingByHost, setIsEvaluatingByHost] = useState(false); 
  const [roundEvaluation, setRoundEvaluation] = useState<RoundEvaluationData | null>(null);
  const [friendsList, setFriendsList] = useState<PlayerScore[]>([]);

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

  useEffect(() => {
    const storedFriends = localStorage.getItem('globalStopFriendsList');
    if (storedFriends) {
      try {
        const parsedFriends = JSON.parse(storedFriends) as PlayerScore[];
        if (Array.isArray(parsedFriends)) {
          setFriendsList(parsedFriends.map(f => ({ ...f, id: f.id || `friend-${Date.now()}` })));
        }
      } catch (error) {
        console.error("Error parsing friends list from localStorage in RoomPage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (friendsList.length > 0 || localStorage.getItem('globalStopFriendsList')) {
        localStorage.setItem('globalStopFriendsList', JSON.stringify(friendsList));
    }
  }, [friendsList]);


  const translate = useCallback((textKey: keyof typeof ROOM_TEXTS, replacements?: Record<string, string>) => {
    let text = ROOM_TEXTS[textKey]?.[language] || ROOM_TEXTS[textKey]?.['en'] || String(textKey);
    if (replacements) {
      Object.keys(replacements).forEach(key => {
        text = text.replace(`{${key}}`, replacements[key]);
      });
    }
    return text;
  }, [language]); 

  const commonTranslate = useCallback((textKey: keyof typeof UI_TEXTS, replacements?: Record<string, string>) => {
    let text = UI_TEXTS[textKey]?.[language] || UI_TEXTS[textKey]?.['en'] || String(textKey);
    if (replacements) {
      Object.keys(replacements).forEach(key => {
        text = text.replace(`{${key}}`, replacements[key]);
      });
    }
    return text;
  }, [language]); 

  const currentAlphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
  const defaultCategories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;

  const handlePlayerJoin = useCallback(() => {
    const timestamp = new Date().toISOString();
    if (!user || !roomIdFromParams) {
      console.log(`[${timestamp}] [RoomPage] handlePlayerJoin: Aborted. User: ${!!user}, RoomID: ${roomIdFromParams}`);
      // Toast for unauthenticated user is now handled in the main useEffect
      return;
    }
    console.log(`[${timestamp}] [RoomPage] handlePlayerJoin: Attempting for user ${user.uid} in room ${roomIdFromParams}`);

    const currentDefaultPlayerName = commonTranslate('playerNameDefault');
    const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
    const playerStatusRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/isOnline`);
    const playerLastSeenRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}/lastSeen`);

    const playerData: Omit<PlayerInRoom, 'id' | 'isCurrentUser'> & { joinedAt: any; lastSeen: any; submittedAnswersForRound: string | null; hasSubmitted: boolean; } = {
      name: user.displayName || currentDefaultPlayerName,
      avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || currentDefaultPlayerName).charAt(0)}`,
      isOnline: true as any, // Explicitly cast to any if serverTimestamp returns object
      hasSubmitted: false, 
      submittedAnswersForRound: null as any, // Explicitly cast to any if serverTimestamp returns object
      joinedAt: serverTimestamp() as any, // Explicitly cast to any
      lastSeen: serverTimestamp() as any, // Explicitly cast to any
    };

    console.log(`[${timestamp}] [RoomPage] handlePlayerJoin: Player data to write:`, JSON.stringify(playerData));
    update(playerRef, playerData)
      .then(() => {
        console.log(`[${timestamp}] [RoomPage] handlePlayerJoin: Successfully updated player ${user.uid} presence in room ${roomIdFromParams}. Setting onDisconnect hooks.`);
        onDisconnect(playerStatusRef).set(false);
        onDisconnect(playerLastSeenRef).set(serverTimestamp());
      })
      .catch((error) => {
        console.error(`[${timestamp}] [RoomPage] handlePlayerJoin: ERROR updating player ${user.uid} presence in room ${roomIdFromParams}:`, error);
        toast({ 
          title: translate('errorJoiningRoom'), 
          description: `${commonTranslate('errorToastDescription')} ${(error as Error).message}. ${commonTranslate('checkDbRules')}`, 
          variant: "destructive" 
        });
      });
  }, [user, roomIdFromParams, db, toast, commonTranslate, translate]); 

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [RoomPage] Main useEffect triggered. RoomID: ${roomIdFromParams}, User: ${!!user}, ActiveRoomId (context): ${activeRoomId}`);

    if (roomIdFromParams && roomIdFromParams !== activeRoomId) {
      console.log(`[${timestamp}] [RoomPage] Main useEffect: Setting activeRoomId in context to ${roomIdFromParams}`);
      setActiveRoomId(roomIdFromParams);
    }

    if (!roomIdFromParams) {
      console.warn(`[${timestamp}] [RoomPage] Main useEffect: roomIdFromParams is not available. Aborting further setup.`);
      setConnectedPlayers([]);
      setGameData(null);
      setChatMessages([]);
      return;
    }
    
    if (user) { 
      console.log(`[${timestamp}] [RoomPage] Main useEffect: User is present, calling handlePlayerJoin for room ${roomIdFromParams}.`);
      handlePlayerJoin();
    } else {
      console.log(`[${timestamp}] [RoomPage] Main useEffect: User is not present. Skipping handlePlayerJoin. Room page will be observable if rules allow.`);
       toast({ 
          title: translate('loginToJoin'),
          description: translate('loginToJoinDescription'),
          variant: 'default',
          duration: 7000,
        });
    }

    const playersRef = ref(db, `rooms/${roomIdFromParams}/players`);
    console.log(`[${timestamp}] [RoomPage] Main useEffect: Subscribing to playersRef: ${playersRef.toString()}`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      console.log(`[${new Date().toISOString()}] [RoomPage] Players listener: Received data:`, data);
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
      console.log(`[${new Date().toISOString()}] [RoomPage] Players listener: Processed players:`, currentPlayers);
      setConnectedPlayers(currentPlayers);
    }, (error) => {
      console.error(`[${new Date().toISOString()}] [RoomPage] Players listener: Error fetching players:`, error);
      toast({ title: translate('errorLoadingPlayers'), description: (error as Error).message, variant: "destructive" });
    });

    const gameDataRefPath = `rooms/${roomIdFromParams}/currentGameData`;
    const gameDataRef = ref(db, gameDataRefPath);
    console.log(`[${timestamp}] [RoomPage] Main useEffect: Subscribing to gameDataRef: ${gameDataRefPath}`);
    const unsubscribeGameData = onValue(gameDataRef, (snapshot) => {
      const data = snapshot.val() as GameData | null;
      console.log(`[${new Date().toISOString()}] [RoomPage] GameData listener: Received data:`, data);
      if (data) {
        setGameData(data);
        if (data.status === "PLAYING" && data.currentRoundId && user) {
            // Check against connectedPlayers which is updated from Firebase, not a stale local copy
            const playerRecord = connectedPlayers.find(p => p.id === user.uid);
            if (playerRecord?.submittedAnswersForRound === data.currentRoundId) {
                if (!localPlayerSubmitted) setLocalPlayerSubmitted(true);
            } else {
                if (localPlayerSubmitted) setLocalPlayerSubmitted(false); 
                setPlayerResponses({}); 
            }
        } else if (data.status === "LOBBY") {
           if (localPlayerSubmitted) setLocalPlayerSubmitted(false); 
           setPlayerResponses({}); 
           if (roundEvaluation !== null) setRoundEvaluation(null); 
        }
      } else {
        if (user) { 
          console.log(`[${new Date().toISOString()}] [RoomPage] GameData listener: No game data in Firebase for room ${roomIdFromParams}. Initializing with host ${user.uid}.`);
          const initialGameData: GameData = {
            status: "LOBBY",
            currentLetter: null,
            currentCategories: defaultCategories, 
            roundStartTime: null,
            hostId: user.uid, 
            currentRoundId: null,
          };
          set(gameDataRef, initialGameData).then(() => {
            console.log(`[${new Date().toISOString()}] [RoomPage] GameData listener: Successfully initialized gameData in Firebase.`);
            setGameData(initialGameData);
          }).catch(err => console.error(`[${new Date().toISOString()}] [RoomPage] GameData listener: Error initializing gameData in Firebase:`, err));
        } else {
           console.log(`[${new Date().toISOString()}] [RoomPage] GameData listener: No game data in Firebase for room ${roomIdFromParams} and no user to initialize.`);
        }
      }
    });
    
    const chatMessagesRefPath = `rooms/${roomIdFromParams}/chatMessages`;
    const chatMessagesRef = ref(db, chatMessagesRefPath);
    console.log(`[${timestamp}] [RoomPage] Main useEffect: Subscribing to chatMessagesRef: ${chatMessagesRefPath}`);
    const unsubscribeChat = onValue(chatMessagesRef, (snapshot) => {
        const data = snapshot.val();
        // console.log(`[${new Date().toISOString()}] [RoomPage] Chat listener: Received data:`, data);
        const loadedMessages: ChatMessage[] = [];
        if (data) {
            Object.keys(data).forEach(key => {
                 loadedMessages.push({ id: key, ...data[key], timestamp: new Date(data[key].timestamp || Date.now()) });
            });
            loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
        // console.log(`[${new Date().toISOString()}] [RoomPage] Chat listener: Processed messages:`, loadedMessages.length);
        setChatMessages(loadedMessages);
    }, (error) => {
        console.error(`[${new Date().toISOString()}] [RoomPage] Chat listener: Error fetching chat messages:`, error);
        toast({ title: commonTranslate('errorToastTitle'), description: "No se pudieron cargar los mensajes.", variant: "destructive"});
    });

    return () => {
      console.log(`[${new Date().toISOString()}] [RoomPage] Main useEffect: Cleaning up listeners for room ${roomIdFromParams}`);
      off(playersRef, 'value', unsubscribePlayers);
      off(gameDataRef, 'value', unsubscribeGameData);
      off(chatMessagesRef, 'value', unsubscribeChat);
      if (user && roomIdFromParams) { 
        const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
        console.log(`[${new Date().toISOString()}] [RoomPage] Main useEffect cleanup: Attempting to set user ${user.uid} offline in room ${roomIdFromParams}.`);
        update(playerRef, { isOnline: false, lastSeen: serverTimestamp() })
         .catch(e => console.warn(`[${new Date().toISOString()}] [RoomPage] Main useEffect cleanup: Error setting user ${user.uid} offline in room ${roomIdFromParams}:`, e));
      }
    };
  // Removed connectedPlayers from dependency array to avoid potential loops if its reference changes too often.
  // The listeners inside will handle player list updates.
  }, [roomIdFromParams, user, activeRoomId, setActiveRoomId, handlePlayerJoin, commonTranslate, defaultCategories, db, translate, toast, language, localPlayerSubmitted, roundEvaluation]); 

  const currentRoundIdForEffect = gameData?.currentRoundId; 

  useEffect(() => { 
    let unsubscribeRoundEval: (() => void) | null = null;
    if (roomIdFromParams && currentRoundIdForEffect) {
      const roundEvaluationRefPath = `rooms/${roomIdFromParams}/roundsData/${currentRoundIdForEffect}/evaluation`;
      const roundEvaluationRef = ref(db, roundEvaluationRefPath);
      console.log(`[${new Date().toISOString()}] [RoomPage] RoundEvaluation useEffect: Subscribing to ${roundEvaluationRefPath}`);
      unsubscribeRoundEval = onValue(roundEvaluationRef, (snapshot) => {
        const evalData = snapshot.val() as RoundEvaluationData | null;
        console.log(`[${new Date().toISOString()}] [RoomPage] RoundEvaluation useEffect: Received evaluation data for round ${currentRoundIdForEffect}:`, evalData);
        setRoundEvaluation(evalData);
      }, (error) => {
         console.error(`[${new Date().toISOString()}] [RoomPage] RoundEvaluation useEffect: Error fetching evaluation data for ${currentRoundIdForEffect}:`, error);
      });
    } else {
      if(roundEvaluation !== null) {
        console.log(`[${new Date().toISOString()}] [RoomPage] RoundEvaluation useEffect: No currentRoundIdForEffect, clearing roundEvaluation.`);
        setRoundEvaluation(null); 
      }
    }
    return () => {
      if (unsubscribeRoundEval) {
         console.log(`[${new Date().toISOString()}] [RoomPage] RoundEvaluation useEffect: Unsubscribing from round evaluation for ${currentRoundIdForEffect}`);
         unsubscribeRoundEval();
      }
    };
  }, [roomIdFromParams, currentRoundIdForEffect, db]); // roundEvaluation removed from deps to avoid re-subscribing when it changes.


  const currentRoundIdForSubmit = gameData?.currentRoundId;

  const handleSubmitAnswers = useCallback(async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [RoomPage] handleSubmitAnswers called. User: ${!!user}, RoomID: ${roomIdFromParams}, CurrentRoundID: ${currentRoundIdForSubmit}, LocalPlayerSubmitted: ${localPlayerSubmittedRef.current}`);
    if (!user || !roomIdFromParams || !currentRoundIdForSubmit || localPlayerSubmittedRef.current) {
      console.warn(`[${timestamp}] [RoomPage] handleSubmitAnswers: Aborted. Conditions not met.`);
      return;
    }

    const submissionPath = `rooms/${roomIdFromParams}/roundsData/${currentRoundIdForSubmit}/submissions/${user.uid}`;
    const submissionData: PlayerSubmission = {
      answers: playerResponsesRef.current, 
      submittedAt: serverTimestamp(),
    };
    console.log(`[${timestamp}] [RoomPage] handleSubmitAnswers: Submitting answers to ${submissionPath}:`, JSON.stringify(submissionData));

    try {
      await set(ref(db, submissionPath), submissionData);
      await update(ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`), {
          hasSubmitted: true,
          submittedAnswersForRound: currentRoundIdForSubmit 
      });
      setLocalPlayerSubmitted(true); 
      console.log(`[${timestamp}] [RoomPage] handleSubmitAnswers: Successfully submitted for user ${user.uid}, round ${currentRoundIdForSubmit}.`);
      toast({ title: translate('submitAnswersButton'), description: translate('waitingForHostEvaluation')});
    } catch (error) {
        console.error(`[${timestamp}] [RoomPage] handleSubmitAnswers: ERROR submitting answers for user ${user.uid}, round ${currentRoundIdForSubmit}:`, error);
        toast({title: commonTranslate('errorToastTitle'), description: `${commonTranslate('errorSubmittingAnswers')} ${(error as Error).message}.`, variant: "destructive"});
    }
  }, [user, roomIdFromParams, currentRoundIdForSubmit, db, toast, translate, commonTranslate, setLocalPlayerSubmitted]); // playerResponsesRef and localPlayerSubmittedRef are refs, not needed in deps.


  useEffect(() => {
    const gameStatus = gameData?.status;
    const roundStartTime = gameData?.roundStartTime;
    const timestamp = new Date().toISOString();

    if (gameStatus === "PLAYING" && roundStartTime && !localPlayerSubmitted) {
      console.log(`[${timestamp}] [RoomPage] Timer useEffect: Starting timer. Round Start Time: ${roundStartTime}, Duration: ${ROUND_DURATION_SECONDS_ROOM}s`);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const updateTimer = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - roundStartTime) / 1000);
        const remaining = ROUND_DURATION_SECONDS_ROOM - elapsedSeconds;
        setTimeLeft(remaining > 0 ? remaining : 0);

        if (remaining <= 0) {
          console.log(`[${new Date().toISOString()}] [RoomPage] Timer useEffect: Time's up! Attempting to submit answers.`);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (!localPlayerSubmittedRef.current) { 
             handleSubmitAnswers();
          }
        }
      };
      updateTimer(); 
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerIntervalRef.current) {
        console.log(`[${timestamp}] [RoomPage] Timer useEffect: Clearing timer. Game Status: ${gameStatus}, LocalPlayerSubmitted: ${localPlayerSubmitted}`);
        clearInterval(timerIntervalRef.current);
      }
      if (timeLeft !== ROUND_DURATION_SECONDS_ROOM) { // Reset timeLeft only if it's not already at default
        setTimeLeft(ROUND_DURATION_SECONDS_ROOM); 
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        console.log(`[${new Date().toISOString()}] [RoomPage] Timer useEffect: Cleanup - clearing timer.`);
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameData?.status, gameData?.roundStartTime, localPlayerSubmitted, handleSubmitAnswers, timeLeft]); // timeLeft added to reset if needed


  const handleLeaveRoom = () => {
    const timestamp = new Date().toISOString();
    if (user && roomIdFromParams) {
      const playerRef = ref(db, `rooms/${roomIdFromParams}/players/${user.uid}`);
      console.log(`[${timestamp}] [RoomPage] handleLeaveRoom: Setting user ${user.uid} offline in room ${roomIdFromParams}.`);
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
    const timestamp = new Date().toISOString();
    if (!user || !roomIdFromParams || (gameData?.hostId !== user.uid && gameData?.hostId !== null)) { 
        console.warn(`[${timestamp}] [RoomPage] handleStartGame: Aborted. User ${user?.uid} is not host (hostId: ${gameData?.hostId}) or no room ID.`);
        toast({ title: commonTranslate('actionNotAllowedTitle'), description: commonTranslate('onlyHostCanStart'), variant: "destructive" });
        return;
    }
    console.log(`[${timestamp}] [RoomPage] handleStartGame: Host ${user.uid} starting game in room ${roomIdFromParams}.`);

    const newRoundId = push(child(ref(db), 'rounds')).key || `round-${Date.now()}`;
    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    const initialGameUpdate: Partial<GameData> = {
      status: "SPINNING",
      currentRoundId: newRoundId,
      hostId: gameData?.hostId || user.uid, 
      currentLetter: null,
      currentCategories: defaultCategories, 
      roundStartTime: null,
    };
    update(gameDataRef, initialGameUpdate);

    connectedPlayers.forEach(p => {
        if (p.id) { 
            const playerDbRef = ref(db, `rooms/${roomIdFromParams}/players/${p.id}`);
            update(playerDbRef, { hasSubmitted: false, submittedAnswersForRound: null })
            .then(() => console.log(`[${timestamp}] [RoomPage] handleStartGame: Reset submission status for player ${p.id}`))
            .catch(err => console.error(`[${timestamp}] [RoomPage] handleStartGame: Error resetting submission status for player ${p.id}:`, err));
        }
    });
    setLocalPlayerSubmitted(false); 
    setRoundEvaluation(null); 
    console.log(`[${timestamp}] [RoomPage] handleStartGame: Game status set to SPINNING with new round ID ${newRoundId}.`);
  };

  const handleSpinCompleteInRoom = (letter: string) => {
    const timestamp = new Date().toISOString();
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid) {
        console.warn(`[${timestamp}] [RoomPage] handleSpinCompleteInRoom: Aborted. User ${user?.uid} is not host or no room ID.`);
        return;
    }
    console.log(`[${timestamp}] [RoomPage] handleSpinCompleteInRoom: Host ${user.uid} selected letter ${letter} for room ${roomIdFromParams}.`);

    const gameDataRef = ref(db, `rooms/${roomIdFromParams}/currentGameData`);
    const gameUpdate: Partial<GameData> = {
      currentLetter: letter,
      roundStartTime: Date.now(), 
      status: "PLAYING",
      currentCategories: defaultCategories, 
    };
    update(gameDataRef, gameUpdate)
    .then(() => console.log(`[${timestamp}] [RoomPage] handleSpinCompleteInRoom: Game status set to PLAYING.`))
    .catch(err => console.error(`[${timestamp}] [RoomPage] handleSpinCompleteInRoom: Error updating game status to PLAYING:`, err));
  };

  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const handleEvaluateRound = useCallback(async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound called by host ${user?.uid} for room ${roomIdFromParams}, round ${gameData?.currentRoundId}.`);

    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid || !gameData?.currentRoundId) {
      console.warn(`[${timestamp}] [RoomPage] handleEvaluateRound: Aborted. Not host or no current round.`);
      toast({ title: commonTranslate('actionNotAllowedTitle'), description: commonTranslate('onlyHostCanEvaluate'), variant: "destructive"});
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
      console.warn(`[${timestamp}] [RoomPage] handleEvaluateRound: No submissions found for round ${roundId}.`);
      toast({ title: translate('noSubmissionsToEvaluate'), variant: "destructive"});
      await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "LOBBY" }); 
      setIsEvaluatingByHost(false);
      return;
    }
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Submissions data for round ${roundId}:`, submissionsData);

    const categories = gameData.currentCategories || defaultCategories;
    const letter = gameData.currentLetter!; 
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Evaluating for letter "${letter}" and categories:`, categories);


    const aiResponses: Record<string, string> = {};
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Generating AI responses...`);
    for (const category of categories) {
      try {
        const aiInput: AiOpponentResponseInput = { letter, category, language };
        const aiResult = await generateAiOpponentResponse(aiInput);
        aiResponses[category] = (aiResult.response || "").trim();
        console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: AI response for ${category}: "${aiResponses[category]}"`);
      } catch (e) {
        console.error(`[${timestamp}] [RoomPage] handleEvaluateRound: Error getting AI response for ${category}:`, e);
        aiResponses[category] = "";
      }
    }

    const allPlayerValidatedWords: Record<string, Record<string, ValidatedWordInfo>> = {}; 
    const playerIdsWhoSubmitted = Object.keys(submissionsData);
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Validating words for players:`, playerIdsWhoSubmitted);

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
            console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Validating word "${playerWord}" for player ${playerId}, category ${category}`);
            const validationResult: ValidatePlayerWordOutput = await validatePlayerWord({ letter, category, playerWord, language });
            isValid = validationResult.isValid;
            if (!isValid) errorReason = 'invalid_word';
            console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Validation for "${playerWord}": ${isValid}`);
          } catch (e) {
            console.error(`[${timestamp}] [RoomPage] handleEvaluateRound: Error validating word "${playerWord}" for player ${playerId}:`, e);
            isValid = false;
            errorReason = 'api_error';
          }
        }
        allPlayerValidatedWords[playerId][category] = { playerWord, isValid, errorReason };
      }
    }
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: All player validated words:`, allPlayerValidatedWords);

    const finalPlayerOutcomes: Record<string, PlayerRoundOutcome> = {};
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Calculating scores. Connected players:`, connectedPlayers.map(p => p.id));
    for (const player of connectedPlayers) { 
        const playerInfo = connectedPlayers.find(p => p.id === player.id); 
        finalPlayerOutcomes[player.id] = {
            totalScore: 0,
            categories: {},
            playerName: playerInfo?.name || commonTranslate('playerNameDefault'),
            playerAvatar: playerInfo?.avatar || `https://placehold.co/40x40.png?text=${(playerInfo?.name || commonTranslate('playerNameDefault')).charAt(0)}`,
        };

        if (submissionsData[player.id]) { 
            for (const category of categories) {
                const currentPlayerValidatedInfo = allPlayerValidatedWords[player.id]?.[category];
                if (!currentPlayerValidatedInfo) {
                    finalPlayerOutcomes[player.id].categories[category] = { 
                        playerWord: "", isValid: false, errorReason: null, score: 0
                    };
                    continue;
                }

                let pScore = 0;
                if (currentPlayerValidatedInfo.isValid) {
                    const aiWordForCat = aiResponses[category] || "";
                    const aiWordValid = aiWordForCat !== "" && aiWordForCat.toLowerCase().startsWith(letter.toLowerCase());

                    let uniqueAmongPlayers = true;
                    for (const otherPlayerId of playerIdsWhoSubmitted) {
                        if (otherPlayerId === player.id) continue;
                        const otherPlayerValidatedInfo = allPlayerValidatedWords[otherPlayerId]?.[category];
                        if (otherPlayerValidatedInfo?.isValid && otherPlayerValidatedInfo.playerWord.toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
                            uniqueAmongPlayers = false;
                            break;
                        }
                    }

                    if (uniqueAmongPlayers) {
                        if (aiWordValid && aiWordForCat.toLowerCase() === currentPlayerValidatedInfo.playerWord.toLowerCase()) {
                            pScore = 50; 
                        } else {
                            pScore = 100; 
                        }
                    } else { 
                        pScore = 50;
                    }
                } 

                finalPlayerOutcomes[player.id].categories[category] = {
                    playerWord: currentPlayerValidatedInfo.playerWord,
                    isValid: currentPlayerValidatedInfo.isValid,
                    errorReason: currentPlayerValidatedInfo.errorReason,
                    score: pScore,
                };
                finalPlayerOutcomes[player.id].totalScore += pScore;
            }
        } else { 
             for (const category of categories) {
                 finalPlayerOutcomes[player.id].categories[category] = {
                    playerWord: "", isValid: false, errorReason: null, score: 0
                };
             }
        }
    }
    console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Final player outcomes:`, finalPlayerOutcomes);


    const evaluationData: RoundEvaluationData = {
      aiResponses,
      playerOutcomes: finalPlayerOutcomes,
    };

    try {
      await set(ref(db, `rooms/${roomIdFromParams}/roundsData/${roundId}/evaluation`), evaluationData);
      await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "SHARED_RESULTS" });
      console.log(`[${timestamp}] [RoomPage] handleEvaluateRound: Evaluation saved and game status set to SHARED_RESULTS for round ${roundId}.`);
      toast({title: translate('roundEvaluated'), description: commonTranslate('resultsAvailable')});
    } catch (error) {
        console.error(`[${timestamp}] [RoomPage] handleEvaluateRound: ERROR saving evaluation or updating game status for round ${roundId}:`, error);
        toast({title: translate('errorEvaluating'), description: (error as Error).message, variant: "destructive"});
        await update(ref(db, `rooms/${roomIdFromParams}/currentGameData`), { status: "LOBBY" }); 
    } finally {
        setIsEvaluatingByHost(false);
    }
  }, [user, roomIdFromParams, gameData, connectedPlayers, toast, language, translate, commonTranslate, defaultCategories, db, setIsEvaluatingByHost]); 

  const handleStartNextRound = () => {
    const timestamp = new Date().toISOString();
    if (!user || !roomIdFromParams || gameData?.hostId !== user.uid ) {
       console.warn(`[${timestamp}] [RoomPage] handleStartNextRound: Aborted. Not host.`);
       return;
    }
    console.log(`[${timestamp}] [RoomPage] handleStartNextRound: Host ${user.uid} starting next round.`);
    handleStartGame(); 
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  const handleSendChatMessageInRoom = useCallback((text: string, roomIdForMessage?: string | null) => { 
    const timestamp = new Date().toISOString();
    if (!user || !roomIdForMessage) {
      console.warn(`[${timestamp}] [RoomPage] handleSendChatMessageInRoom: Aborted. No user or no room ID for message. User: ${!!user}, RoomID: ${roomIdForMessage}`);
      toast({ title: commonTranslate('chatLoginTitle'), description: commonTranslate('chatLoginMessage'), variant: "destructive" });
      return;
    }
    console.log(`[${timestamp}] [RoomPage] handleSendChatMessageInRoom: User ${user.uid} sending message to room ${roomIdForMessage}: "${text}"`);

    const messagesListRef = ref(db, `rooms/${roomIdForMessage}/chatMessages`);
    const newMessageRef = push(messagesListRef);
    const currentDefaultPlayerName = commonTranslate('playerNameDefault');
    const messageData: Omit<ChatMessage, 'id' | 'timestamp'> & { timestamp: any } = { 
      text,
      sender: {
        name: user.displayName || currentDefaultPlayerName,
        uid: user.uid, 
        avatar: user.photoURL || `https://placehold.co/40x40.png?text=${(user.displayName || currentDefaultPlayerName).charAt(0)}`,
      },
      timestamp: serverTimestamp(),
    };
    set(newMessageRef, messageData)
    .then(() => console.log(`[${timestamp}] [RoomPage] handleSendChatMessageInRoom: Message sent successfully.`))
    .catch(error => {
      console.error(`[${timestamp}] [RoomPage] handleSendChatMessageInRoom: ERROR sending message:`, error);
      toast({ title: commonTranslate('errorToastTitle'), description: `${commonTranslate('errorSendingMessage')} ${(error as Error).message}.`, variant: "destructive" });
    });
  }, [user, commonTranslate, toast, db]);

  const handleAddFriendFromRoom = useCallback((player: PlayerInRoom) => {
    const timestamp = new Date().toISOString();
    if (!user) {
      console.warn(`[${timestamp}] [RoomPage] handleAddFriendFromRoom: Aborted. User not logged in.`);
      toast({ title: commonTranslate('chatLoginTitle'), description: commonTranslate('chatLoginMessage'), variant: "destructive" });
      return;
    }
    if (player.id === user.uid) {
      console.log(`[${timestamp}] [RoomPage] handleAddFriendFromRoom: User trying to add self.`);
      toast({ title: commonTranslate('cannotAddSelfTitle'), description: commonTranslate('cannotAddSelfDescription'), variant: "default" });
      return;
    }

    const friendExists = friendsList.some(friend => friend.id === player.id || friend.name === player.name);
    if (friendExists) {
      console.log(`[${timestamp}] [RoomPage] handleAddFriendFromRoom: Friend ${player.name} already exists.`);
 toast({ 
 title: commonTranslate('friendAlreadyExistsToastTitle'),
 description: commonTranslate('friendAlreadyExistsToastDescription'), // Keep replacement here
 variant: "default",
      });
      return;
    }
    const newFriend: PlayerScore = {
 id: player.id || `friend-${Date.now()}`, // Ensure id exists
      name: player.name,
      score: 0, 
      avatar: player.avatar || `https://placehold.co/40x40.png?text=${player.name.charAt(0)}`,
    };
    console.log(`[${timestamp}] [RoomPage] handleAddFriendFromRoom: Adding new friend:`, newFriend);
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
 title: commonTranslate('friendAddedToastTitle'),
 description: commonTranslate('friendAddedToastDescription'), // Keep replacement here
 });
  }, [user, friendsList, setFriendsList, toast, commonTranslate]);


  if (!roomIdFromParams || (!user && !gameData)) { 
    console.log(`[${new Date().toISOString()}] [RoomPage] Render: Showing loading state. RoomID: ${roomIdFromParams}, User: ${!!user}, GameData: ${!!gameData}`);
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
  if (!gameData && user) { 
     console.log(`[${new Date().toISOString()}] [RoomPage] Render: User logged in, but gameData is still null. Showing loading.`);
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{translate('loadingRoom')}</p>
        </main>
        <AppFooter language={language} />
      </div>
    );
  }
   if (!user && gameData) { 
     console.log(`[${new Date().toISOString()}] [RoomPage] Render: GameData loaded, but user is not. Prompting login.`);
      return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
            <Card className="w-full max-w-md text-center p-6">
                <CardTitle className="text-2xl text-primary mb-3">{translate('loginToJoin')}</CardTitle>
                <CardDescription>{translate('loginToJoinDescription')}</CardDescription>
                <Button onClick={() => router.push('/')} className="mt-6" size="lg">
                    <Home className="mr-2 h-5 w-5"/> {translate('backToHome')}
                </Button>
            </Card>
        </main>
        <AppFooter language={language} />
      </div>
    );
  }
  if (!gameData) { 
     console.log(`[${new Date().toISOString()}] [RoomPage] Render: GameData is null (and user might be null). This case should ideally not be hit if other loading/login prompts work.`);
     return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Cargando datos de la sala...</p>
        </main>
        <AppFooter language={language} />
      </div>
    );
  }


  const canPlayerSubmit = gameData.status === "PLAYING" && !localPlayerSubmitted;
  const isHost = user?.uid === gameData.hostId;
  const currentCategoriesToUse = gameData.currentCategories || defaultCategories;

  let allOnlinePlayersHaveSubmitted = false;
  if (gameData.status === "PLAYING" && connectedPlayers.length > 0 && gameData.currentRoundId) {
    const onlinePlayers = connectedPlayers.filter(p => p.isOnline && p.id !== user?.uid); // Exclude current user if host
    if (isHost && onlinePlayers.length === 0) { // Host is alone or only one online
      allOnlinePlayersHaveSubmitted = true;
    } else if (onlinePlayers.length > 0) {
        allOnlinePlayersHaveSubmitted = onlinePlayers.every(p => p.hasSubmitted && p.submittedAnswersForRound === gameData.currentRoundId);
    }
  }


  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center relative">
            {user && <Button 
                onClick={toggleChat}
                variant="outline"
                size="icon"
                className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/50"
                aria-label={translate('chatTitle')}
            >
                <MessageSquare className="h-7 w-7" />
            </Button>}

          <Card className="w-full max-w-3xl shadow-xl rounded-xl mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
                {translate('title')} <span className="text-accent">{roomIdFromParams}</span>
              </CardTitle>
              {gameData.status === "LOBBY" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusLobby')}</CardDescription>}
              {gameData.status === "SPINNING" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusSpinning')}</CardDescription>}
              {gameData.status === "PLAYING" && gameData.currentLetter && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusPlaying')} <span className="font-bold text-accent">{gameData.currentLetter}</span></CardDescription>}
              {gameData.status === "EVALUATING_SHARED" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusEvaluating')}</CardDescription>}
              {gameData.status === "SHARED_RESULTS" && <CardDescription className="text-lg text-muted-foreground mt-2">{translate('gameStatusSharedResults')}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {gameData.status === "LOBBY" && (
                <div className="text-center space-y-4">
                  <Button
                    size="lg"
                    className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={handleStartGame}
                    disabled={(!isHost && gameData.hostId !== null && gameData.hostId !== user?.uid && !!gameData.hostId) || !user} 
                  >
                    <PlayCircle className="mr-3 h-6 w-6" />
                    {translate('startGameButton')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {gameData.hostId === null && user?.uid ? commonTranslate('youWillBeHost') : (isHost ? commonTranslate('youAreHost') : translate('startGameDescription'))}
                  </p>
                </div>
              )}

              {gameData.status === "SPINNING" && isHost && (
                <RouletteWheel
                  isSpinning={true}
                  onSpinComplete={handleSpinCompleteInRoom}
                  alphabet={currentAlphabet}
                  language={language}
                />
              )}
               {gameData.status === "SPINNING" && !isHost && (
                 <Card className="p-6 text-center bg-muted/30 rounded-lg shadow">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3"/>
                    <p className="text-lg font-semibold text-card-foreground">{translate('gameStatusSpinning')}</p>
                 </Card>
              )}


              {gameData.status === "PLAYING" && gameData.currentLetter && currentCategoriesToUse && user && (
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
                        isEvaluating={false} 
                        showResults={false}
                        roundResults={null} 
                        language={language}
                        gameMode="room"
                      />
                      <div className="flex justify-center mt-4">
                        <StopButton
                            onClick={handleSubmitAnswers}
                            disabled={!canPlayerSubmit || timeLeft <=0} 
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
               {gameData.status === "PLAYING" && !user && ( 
                  <Card className="p-6 text-center bg-muted/30 rounded-lg shadow">
                    <Info className="h-12 w-12 text-destructive mx-auto mb-3"/>
                    <p className="text-lg font-semibold text-card-foreground">{translate('loginToJoinDescription')}</p>
                  </Card>
               )}


              {gameData.status === "EVALUATING_SHARED" && (
                 <Card className="p-6 text-center bg-muted/30 rounded-lg shadow">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3"/>
                    <p className="text-lg font-semibold text-card-foreground">{translate('gameStatusEvaluating')}</p>
                 </Card>
              )}

              {gameData.status === "SHARED_RESULTS" && roundEvaluation && (
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
                    .sort(([,a],[,b]) => b.totalScore - a.totalScore) 
                    .map(([pId, outcome]) => {
                        const playerDetails = connectedPlayers.find(p => p.id === pId); 
                        return (
                         <Card key={pId} className="p-4 bg-card/80 rounded-lg shadow-md">
                            <CardHeader className="p-2 flex flex-row items-center justify-between space-x-2">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={outcome.playerAvatar || playerDetails?.avatar || undefined} alt={outcome.playerName} data-ai-hint="avatar person"/>
                                        <AvatarFallback>{outcome.playerName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-xl text-primary-foreground">{outcome.playerName} {pId === user?.uid ? <span className="text-xs text-accent">{translate('youSuffix')}</span> : ''}</CardTitle>
                                </div>
                                <p className="text-3xl font-bold text-primary">{outcome.totalScore} <span className="text-base font-normal">{translate('pointsSuffix')}</span></p>
                            </CardHeader>
                            <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {(currentCategoriesToUse).map(catName => { // Use currentCategoriesToUse for safety
                                    const catResult = outcome.categories[catName];
                                    if (!catResult) return <div key={`${pId}-${catName}`} className="p-2 border border-border/50 rounded-md bg-background/50"><p className="font-semibold text-secondary-foreground">{catName}: <span className="italic text-muted-foreground">{"-"}</span></p></div>;
                                    return (
                                    <div key={`${pId}-${catName}`} className="p-2 border border-border/50 rounded-md bg-background/50">
                                        <p className="font-semibold text-secondary-foreground">{catName}: <span className="font-normal text-foreground">{catResult.playerWord || <span className="italic text-muted-foreground">{"-"}</span>}</span></p>
                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <span className={cn("inline-flex items-center", catResult.isValid ? "text-green-600" : "text-destructive")}>
                                                {catResult.playerWord && (catResult.isValid ?
                                                    <CheckCircle className="h-4 w-4 mr-1"/> :
                                                    <XCircle className="h-4 w-4 mr-1"/>
                                                )}
                                                {catResult.playerWord ? (catResult.isValid ? commonTranslate('wordValid') : (catResult.errorReason === 'format' ? commonTranslate('wordFormatError') : catResult.errorReason === 'invalid_word' ? commonTranslate('wordInvalidError') : translate('errorValidatingWord'))) : ""}
                                            </span>
                                            {catResult.playerWord && <span className="font-semibold text-primary">{catResult.score} {translate('pointsSuffix')}</span>}
                                        </div>
                                    </div>
                                    );
                                })}
                                 {(!outcome.categories || Object.keys(outcome.categories).length === 0) && <p className="text-muted-foreground text-center md:col-span-2">{translate('playerHasNotSubmitted')}</p>}
                            </CardContent>
                         </Card>
                        );
                    })}
                  {isHost && user && ( 
                    <Button onClick={handleStartNextRound} size="lg" className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <RotateCcw className="mr-2 h-5 w-5"/> {translate('nextRoundButtonHost')}
                    </Button>
                  )}
                  {!isHost && user && ( 
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
                            {gameData.hostId === player.id && <span className="text-xs text-yellow-500 ml-1">({commonTranslate('hostLabel')})</span>}
                          </span>
                           {gameData.status === "PLAYING" && gameData.currentRoundId && player.id !== user?.uid && (
                                <span className="text-xs text-muted-foreground ml-2">
                                    {(player.hasSubmitted && player.submittedAnswersForRound === gameData.currentRoundId) ? translate('submitted') : translate('notSubmitted')}
                                </span>
                            )}
                           {gameData.status === "PLAYING" && gameData.currentRoundId && player.id === user?.uid && localPlayerSubmitted && (
                                <span className="text-xs text-green-500 ml-2">
                                    {translate('submitted')}
                                </span>
                            )}
                        </div>
                        {user && !player.isCurrentUser && (
                           <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAddFriendFromRoom(player)}>
                                <UserPlus className="mr-1 h-3 w-3" /> {translate('addFriendButton')}
                           </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-3">{user ? translate('noPlayersInRoom') : translate('loginToJoinDescription')}</p>
                  )}
                   <p className="text-xs text-muted-foreground text-center pt-2">{translate('playerListDescription')}</p>
                </div>
                 {isHost && user && gameData.status === "PLAYING" && gameData.currentRoundId && ( 
                    <Button
                        onClick={handleEvaluateRound}
                        disabled={isEvaluatingByHost || !allOnlinePlayersHaveSubmitted}
                        className="w-full mt-4 bg-accent hover:bg-accent/90"
                        size="lg"
                    >
                        {isEvaluatingByHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {translate('evaluateRoundButton')}
                        {!allOnlinePlayersHaveSubmitted && ` (${commonTranslate('waitingSubmissions')})`}
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
        {user && <ChatPanel 
          messages={chatMessages}
          onSendMessage={handleSendChatMessageInRoom} 
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          currentUserUid={user.uid} 
          currentUserName={user.displayName || commonTranslate('playerNameDefault')}
          currentUserAvatar={user.photoURL}
          language={language}
          currentRoomId={roomIdFromParams} 
        />}
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
