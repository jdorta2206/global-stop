
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
  avatar?: string;
  isCurrentUser?: boolean;
  isOnline?: boolean;
}

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
  createRoomDialogTitle: { es: "¡Sala Creada!", en: "Room Created!", fr: "Salle Créée !", pt: "Sala Criada!" },
  createRoomDialogDescription: {
    es: "Comparte este ID con tus amigos. Al hacer clic en 'Ir a la Sala', serás llevado a la página de esta sala.",
    en: "Share this ID with your friends. Clicking 'Go to Room' will take you to a page for this room.",
    fr: "Partagez cet ID avec vos amis. En cliquant sur 'Aller à la Salle', vous serez dirigé vers une page pour cette salle.",
    pt: "Compartilhe este ID com seus amigos. Clicar em 'Ir para a Sala' o levará para uma página desta sala."
  },
  roomIdLabel: { es: "ID de Sala:", en: "Room ID:", fr: "ID de la Salle :", pt: "ID da Sala:" },
  copyIdButton: { es: "Copiar ID", en: "Copy ID", fr: "Copier l'ID", pt: "Copiar ID" },
  goToRoomButton: { es: "Ir a la Sala", en: "Go to Room", fr: "Aller à la Salle", pt: "Ir para a Sala" },
  closeButton: { es: "Cerrar", en: "Close", fr: "Fermer", pt: "Fechar" },
  joinRoomDialogTitle: { es: "Unirse a una Sala", en: "Join a Room", fr: "Rejoindre une Salle", pt: "Entrar em uma Sala" },
  joinRoomDialogDescription: {
    es: "Ingresa el ID de la sala. Al unirte, serás llevado a una página para esta sala.",
    en: "Enter the Room ID. Upon joining, you'll be taken to a page for this room.",
    fr: "Entrez l'ID de la salle. En rejoignant, vous serez dirigé vers une page pour cette salle.",
    pt: "Digite o ID da sala. Ao entrar, você será levado para uma página desta sala."
  },
  joinRoomIdInputLabel: { es: "ID de la Sala", en: "Room ID", fr: "ID de la Salle", pt: "ID da Sala" },
  joinRoomIdInputPlaceholder: { es: "Ej: ABC123XYZ", en: "Ex: ABC123XYZ", fr: "Ex : ABC123XYZ", pt: "Ex: ABC123XYZ" },
  cancelButton: { es: "Cancelar", en: "Cancel", fr: "Annuler", pt: "Cancelar" },
  joinButton: { es: "Unirse", en: "Join", fr: "Rejoindre", pt: "Entrar" },
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
  errorCopyingLinkToastTitle: { es: "Error al Copiar Enlace", en: "Error Copying Link", fr: "Erreur de Copie du Lien", pt: "Erro ao Copiar Link" },
  errorCopyingLinkToastDescription: {
    es: "No se pudo copiar el enlace. Por favor, cópialo manualmente.",
    en: "Could not copy the link. Please copy it manually.",
    fr: "Impossible de copier le lien. Veuillez le copier manuellement.",
    pt: "Não foi possível copiar o link. Por favor, copie manualmente."
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
  timeEndingSoon: { es: "¡Solo 10 segundos!", en: "Only 10 seconds left!", fr: "Plus que 10 secondes !", pt: "Apenas 10 segundos!" },
  timeAlmostUp: { es: "¡5 segundos! ¡RÁPIDO!", en: "5 seconds! QUICK!", fr: "5 secondes ! VITE !", pt: "5 segundos! RÁPIDO!" },
  timeFinalCountdown: { es: "¡3... 2... 1...!", en: "3... 2... 1...!", fr: "3... 2... 1... !", pt: "3... 2... 1...!" },
  openChatLabel: { es: "Abrir chat", en: "Open chat", fr: "Ouvrir le chat", pt: "Abrir chat" },
  playerNameDefault: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
  playedText: { es: "jugó", en: "played", fr: "a joué", pt: "jogou" },
  iJustPlayed: { es: "Acabo de jugar a", en: "I just played", fr: "Je viens de jouer à", pt: "Acabei de jogar" },
  myTotalScore: { es: "Mi puntuación total", en: "My total score", fr: "Mon score total", pt: "Minha pontuação total" },
  aiTotalScore: { es: "Puntuación total de la IA", en: "AI's total score", fr: "Score total de l'IA", pt: "Pontuação total da IA" },
  canYouBeatMe: { es: "¿Crees que puedes superarme? ¡Inténtalo en Global Stop!", en: "Think you can beat me? Try Global Stop!", fr: "Pensez-vous pouvoir me battre ? Essayez Global Stop !", pt: "Acha que pode me vencer? Experimente o Global Stop!" },
  lobbyTitle: { es: "Sala de Espera Multijugador", en: "Multiplayer Lobby", fr: "Salon Multijoueur", pt: "Lobby Multijogador" },
  inRoomMessage: { es: "Estás en la Sala:", en: "You are in Room:", fr: "Vous êtes dans la Salle :", pt: "Você está na Sala:" },
  startGameWithFriendsButton: { es: "Iniciar Partida (Amigos) - Próximamente", en: "Start Game (Friends) - Coming Soon", fr: "Démarrer la Partie (Amis) - Bientôt disponible", pt: "Iniciar Jogo (Amigos) - Em Breve" },
  startGameWithFriendsDescription: {
    es: "La funcionalidad para iniciar una partida multijugador con amigos está en desarrollo.",
    en: "The functionality to start a multiplayer game with friends is under development.",
    fr: "La fonctionnalité pour démarrer une partie multijoueur avec des amis est en développement.",
    pt: "A funcionalidade para iniciar um jogo multiplayer com amigos está em desenvolvimento."
  },
  inviteFriendsButton: { es: "Invitar Amigos", en: "Invite Friends", fr: "Inviter des Amis", pt: "Convidar Amigos" },
  leaveRoomButton: { es: "Salir de la Sala", en: "Leave Room", fr: "Quitter la Salle", pt: "Sair da Sala" },
  shareRoomLinkMessageWhatsApp: { es: "¡Únete a mi sala en Global Stop! ID:", en: "Join my room in Global Stop! ID:", fr: "Rejoins ma salle sur Global Stop ! ID :", pt: "Entre na minha sala no Global Stop! ID:" },
  joinHere: { es: "Únete aquí:", en: "Join here:", fr: "Rejoindre ici:", pt: "Entre aqui:" },
  copyRoomLinkButton: { es: "Copiar Enlace de Sala", en: "Copy Room Link", fr: "Copier le Lien de la Salle", pt: "Copiar Link da Sala" },
  roomLinkCopiedToastTitle: { es: "¡Enlace de Sala Copiado!", en: "Room Link Copied!", fr: "Lien de Salle Copié !", pt: "Link da Sala Copiado!" },
  roomLinkCopiedToastDescription: { es: "El enlace a la sala ha sido copiado a tu portapapeles.", en: "The room link has been copied to your clipboard.", fr: "Le lien de la salle a été copié dans votre presse-papiers.", pt: "O link da sala foi copiado para sua área de transferência." },
  playerListTitle: { es: "Jugadores en la Sala", en: "Players in Room", fr: "Joueurs dans la Salle", pt: "Jogadores na Sala" },
  playerListDescription: { 
    es: "Aquí verás la lista de amigos que se han unido. (Funcionalidad completa próximamente)", 
    en: "Here you will see the list of friends who have joined. (Full functionality coming soon)",
    fr: "Ici, vous verrez la liste des amis qui ont rejoint. (Fonctionnalité complète bientôt disponible)",
    pt: "Aqui você verá la lista de amigos que entraram. (Funcionalidade completa em breve)"
  },
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  friendAddedToastTitle: { es: "¡Amigo Añadido!", en: "Friend Added!", fr: "Ami Ajouté !", pt: "Amigo Adicionado!"},
  friendAddedToastDescription: { es: "{name} ha sido añadido a tu lista local de amigos.", en: "{name} has been added to your local friends list.", fr: "{name} a été ajouté à votre liste d'amis locale.", pt: "{name} foi adicionado à sua lista local de amigos."},
  friendAlreadyExistsToastTitle: { es: "Amigo ya Existe", en: "Friend Already Exists", fr: "Ami Existe Déjà", pt: "Amigo Já Existe"},
  friendAlreadyExistsToastDescription: { es: "{name} ya está en tu lista de amigos.", en: "{name} is already on your friends list.", fr: "{name} est déjà dans votre liste d'amis.", pt: "{name} já está na sua lista de amigos."},
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" },
  waitingForPlayers: { es: "Esperando a otros jugadores...", en: "Waiting for other players...", fr: "En attente d'autres joueurs...", pt: "Aguardando outros jogadores..." },
  loggedInAs: { es: "Conectado como: {name}", en: "Logged in as: {name}", fr: "Connecté en tant que : {name}", pt: "Conectado como: {name}" },
  challengePlayerToastTitle: { es: "Desafío Próximamente", en: "Challenge Coming Soon", fr: "Défi Bientôt Disponible", pt: "Desafio Em Breve" },
  challengePlayerToastDescription: { es: "La funcionalidad para desafiar a '{name}' se añadirá en futuras actualizaciones.", en: "The feature to challenge '{name}' will be added in future updates.", fr: "La fonctionnalité pour défier '{name}' sera ajoutée dans les futures mises à jour.", pt: "A funcionalidade para desafiar '{name}' será adicionada em futuras atualizações." },
  friendAddedFromGlobalToastTitle: { es: "Amigo Añadido desde Global", en: "Friend Added from Global", fr: "Ami Ajouté depuis Global", pt: "Amigo Adicionado do Global" },
  friendAddedFromGlobalToastDescription: { es: "'{name}' ha sido añadido a tu lista local de amigos desde la tabla global.", en: "'{name}' has been added to your local friends list from the global leaderboard.", fr: "'{name}' a été ajouté à votre liste d'amis locale depuis le classement mondial.", pt: "'{name}' foi adicionado à sua lista local de amigos do placar global." },
  addFriendManualTitle: { es: "Añadir Amigo por Nombre/Email", en: "Add Friend by Name/Email", fr: "Ajouter un Ami par Nom/Email", pt: "Adicionar Amigo por Nome/Email" },
  addFriendManualLabel: { es: "Nombre o Email del Amigo:", en: "Friend's Name or Email:", fr: "Nom ou Email de l'Ami :", pt: "Nome ou Email do Amigo:"},
  addFriendManualPlaceholder: { es: "Introduce nombre o email", en: "Enter name or email", fr: "Entrez nom ou email", pt: "Insira nome ou email"},
  addFriendManualButton: { es: "Añadir", en: "Add", fr: "Ajouter", pt: "Adicionar"},
  friendManuallyAddedToastTitle: { es: "¡Amigo Añadido Manualmente!", en: "Friend Added Manually!", fr: "Ami Ajouté Manuellement !", pt: "Amigo Adicionado Manualmente!"},
  friendManuallyAddedToastDescription: { es: "{name} ha sido añadido a tu lista local de amigos.", en: "{name} has been added to your local friends list.", fr: "{name} a été ajouté à votre liste d'amis locale.", pt: "{name} foi adicionado à sua lista local de amigos."},
  challengeSetupPageTitle: { es: "Configurar Desafío", en: "Setup Challenge", fr: "Configurer le Défi", pt: "Configurar Desafio"},
  challengeSetupDescription: { es: "Preparando desafío con {playerName} (ID: {playerId}).", en: "Setting up challenge with {playerName} (ID: {playerId}).", fr: "Préparation du défi avec {playerName} (ID : {playerId}).", pt: "Preparando desafio com {playerName} (ID: {playerId})."},
  challengeSettingsComingSoon: { es: "Configuración del juego (próximamente)", en: "Game settings (coming soon)", fr: "Paramètres du jeu (bientôt disponible)", pt: "Configurações do jogo (em breve)"},
  sendChallengeComingSoon: { es: "Enviar desafío (próximamente)", en: "Send challenge (coming soon)", fr: "Envoyer le défi (bientôt disponible)", pt: "Enviar desafio (em breve)"},
  backToHomeButton: { es: "Volver al Inicio", en: "Back to Home", fr: "Retour à l'Accueil", pt: "Voltar ao Início"},
};

const MOCK_PLAYERS_IN_LOBBY: Omit<PlayerInLobby, 'isCurrentUser'>[] = [
  { id: 'player2', name: 'Amigo Carlos', avatar: `https://placehold.co/40x40.png?text=C`, isOnline: true },
  { id: 'player3', name: 'Compañera Ana', avatar: `https://placehold.co/40x40.png?text=A`, isOnline: false },
  { id: 'player4', name: 'Vecina Laura', avatar: `https://placehold.co/40x40.png?text=L`, isOnline: true },
];

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, setLanguage: setGlobalLanguage, translate } = useLanguage(); // Renamed setLanguage to avoid conflict
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
        const parsedFriends = JSON.parse(storedFriends) as PlayerScore[];
        if (Array.isArray(parsedFriends)) {
          const ensuredFriends = parsedFriends.map(f => ({
            ...f,
            id: f.id || `friend-${f.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`
          }));
          setFriendsList(ensuredFriends);
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
    const currentPlayers: PlayerInLobby[] = [];
    if (user && activeRoomId) {
      currentPlayers.push({ 
        id: user.uid, 
        name: user.displayName || translate(UI_TEXTS.playerNameDefault), 
        avatar: user.photoURL || undefined, 
        isCurrentUser: true,
        isOnline: true,
      });
      MOCK_PLAYERS_IN_LOBBY.forEach(player => {
        // Ensure mock players aren't added if their ID matches the current user's ID
        if (player.id !== user.uid) {
          currentPlayers.push({ ...player, isCurrentUser: false, isOnline: player.isOnline });
        }
      });
    }
    setPlayersInLobby(currentPlayers);
  }, [user, activeRoomId, language, translate]);


  const exampleGlobalLeaderboard: EnrichedPlayerScore[] = [
    { id: "global-player-1", name: "Star Player", score: 12500, avatar: "https://placehold.co/40x40.png?text=S" },
    { id: "global-player-2", name: "StopKing", score: 11800, avatar: "https://placehold.co/40x40.png?text=K" },
    { id: "global-player-3", name: "FastLetters", score: 10500, avatar: "https://placehold.co/40x40.png?text=F" },
    { id: "global-player-4", name: "ProPlayer123", score: 9800, avatar: "https://placehold.co/40x40.png?text=P" },
    { id: "global-player-5", name: "Ana S.", score: 9200, avatar: "https://placehold.co/40x40.png?text=A" },
  ];

  useEffect(() => {
    setChatMessages([
        { id: '1', text: translate(UI_TEXTS.chatLoginTitle), sender: { name: 'System', uid: 'system', avatar: 'https://placehold.co/40x40.png?text=S' }, timestamp: new Date(Date.now() - 120000) },
        { id: '2', text: translate(UI_TEXTS.welcomeTitle), sender: { name: user?.displayName || translate(UI_TEXTS.playerNameDefault), uid: user?.uid || 'user1', avatar: user?.photoURL || `https://placehold.co/40x40.png?text=${(user?.displayName || translate(UI_TEXTS.playerNameDefault)).charAt(0)}` }, timestamp: new Date(Date.now() - 60000) },
    ]);
  }, [language, user, translate]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!backgroundAudioRef.current) {
        backgroundAudioRef.current = new Audio('/music/tension-music.mp3'); 
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
      if (gameState === "PLAYING" && currentLetter) {
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(error => console.error("Error playing background audio:", error));
      } else {
        backgroundAudioRef.current.pause();
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
    setCountdownWarningText("");
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    if (gameStateRef.current === "IDLE" && !activeRoomId) { // Only reset total scores if it's a new solo game
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
    const currentLang = language; // Use language from context

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
        console.log(`[GamePage] Calling generateAiOpponentResponse for ${category} with input:`, JSON.stringify(aiInput));
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
    console.log("[GamePage] AI responses generated:", JSON.stringify(tempAiResponses));

    console.log("[GamePage] Initiating player word validation...");
    const playerValidationPromises = currentCategories.map(async (category) => {
      const playerResponse = (currentResponses[category] || "").trim();
      console.log(`[GamePage] Validating for Category: ${category}, Player Word: "${playerResponse}", Required Letter: "${letterForValidation!}", Lang: ${currentLang}`);

      if (playerResponse === "") {
        console.log(`[GamePage] Player word for ${category} is empty. Marking as invalid locally.`);
        return { category, isValid: false, errorReason: null };
      }
      if (!playerResponse.toLowerCase().startsWith(letterForValidation!.toLowerCase())) {
        console.warn(`[GamePage] Player word "${playerResponse}" for ${category} does not start with letter "${letterForValidation!}" (frontend check). Marking as invalid locally.`);
        return { category, isValid: false, errorReason: 'format' as 'format' };
      }
      try {
        const validationInput: ValidatePlayerWordInput = {
          letter: letterForValidation!,
          category, // Category is passed for context but AI is instructed to validate word generally
          playerWord: playerResponse,
          language: currentLang,
        };
        console.log(`[GamePage] Calling validatePlayerWord for ${category} with input:`, JSON.stringify(validationInput));
        const validationResult: ValidatePlayerWordOutput = await validatePlayerWord(validationInput);
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

      const playerPassesFormatCheck = playerResponseTrimmed !== "" && playerResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      console.log(`  [GamePage] playerPassesFormatCheck (frontend check: not empty, starts with letter): ${playerPassesFormatCheck}`);

      const isPlayerResponseConsideredValid = playerPassesFormatCheck && isPlayerWordValidatedByAI;
      console.log(`  [GamePage] isPlayerResponseConsideredValid (passes format AND AI validation): ${isPlayerResponseConsideredValid}`);

      const isAiResponseValid = aiResponseTrimmed !== "" && aiResponseTrimmed.toLowerCase().startsWith(letterForValidation!.toLowerCase());
      console.log(`  [GamePage] isAiResponseValid (AI not empty, starts with letter): ${isAiResponseValid}`);
      
      let pScore = 0;
      let aScore = 0;

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
        playerResponseIsValid: isPlayerWordValidatedByAI, // This should be the result from AI validation.
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
    currentCategories, language, // Added language and currentCategories
    setGameState, setIsLoadingAi, setAiResponses,
    setPlayerRoundScore, setAiRoundScore, setTotalPlayerScore, setTotalAiScore,
    setRoundResults, setRoundWinner, toast, translate 
  ]);

  const handleStop = useCallback(() => {
    handleStopInternal();
  }, [handleStopInternal]);

  useEffect(() => {
    if (gameState === "PLAYING" && currentLetter) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimeLeft(ROUND_DURATION_SECONDS);
      setCountdownWarningText("");

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            handleStop(); // Call handleStop which calls handleStopInternal
            return 0;
          }
          
          // Countdown warnings and sounds
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
            // countdownTickAudioRef.current?.play().catch(e => console.error("Error playing tick audio:", e)); // Optional: play tick every second
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
  }, [gameState, currentLetter, handleStop, translate]); // Added handleStop and translate to dependencies


  const startNextRound = useCallback(() => {
    // If in a room, starting next round might have different logic (not implemented)
    // For now, it just restarts a solo AI game experience.
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
  
  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setPlayersInLobby([]); // Clear lobby players
    setGameState("IDLE"); // Reset game state to idle to show main menu
  };

  const handleInviteFriends = () => {
    if (activeRoomId) {
      const roomUrl = `${window.location.origin}/room/${activeRoomId}`;
      const message = `${translate(UI_TEXTS.shareRoomLinkMessageWhatsApp)} ${activeRoomId}. ${translate(UI_TEXTS.joinHere)} ${roomUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCopyRoomLink = () => {
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
        toast({ title: translate({es: "No puedes agregarte", en: "Cannot add self", fr:"Ne peut pas s'ajouter", pt: "Não pode adicionar a si mesmo"}), 
                description: translate({es: "No puedes ser tu propio amigo.", en: "You cannot be your own friend.", fr: "Vous ne pouvez pas être votre propre ami.", pt: "Você não pode ser seu próprio amigo."}), 
                variant: "default" });
        return;
    }

    if (friendsList.find(friend => friend.id === player.id || friend.name === player.name)) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', player.name),
        variant: "default",
      });
      return;
    }
    const newFriend: PlayerScore = {
      // Use a more robust ID if player.id is not guaranteed (e.g., for mock players)
      id: player.id || `mock-${player.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`, 
      name: player.name,
      score: 0, // Default score for new friends
      avatar: player.avatar,
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
    if (player.id === user.uid) { // Check if the player being added is the current user
        toast({ title: translate({es: "No puedes agregarte", en: "Cannot add self", fr:"Ne peut pas s'ajouter", pt: "Não pode adicionar a si mesmo"}), 
                description: translate({es: "No puedes ser tu propio amigo.", en: "You cannot be your own friend.", fr: "Vous ne pouvez pas être votre propre ami.", pt: "Você não pode ser seu próprio amigo."}), 
                variant: "default" });
        return;
    }
    if (friendsList.find(friend => friend.id === player.id || friend.name === player.name)) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', player.name),
        variant: "default",
      });
      return;
    }
    const newFriend: PlayerScore = {
      id: player.id || `global-${player.name.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2,7)}`, 
      name: player.name,
      score: player.score, // Carry over score if adding from a leaderboard with scores
      avatar: player.avatar,
    };
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
      title: translate(UI_TEXTS.friendAddedFromGlobalToastTitle),
      description: translate(UI_TEXTS.friendAddedFromGlobalToastDescription).replace('{name}', player.name),
    });
  };

  const handleChallengePlayer = (player: EnrichedPlayerScore) => {
    // For now, this navigates to a setup page.
    // Future: This could initiate a direct challenge via backend.
    toast({
      title: translate(UI_TEXTS.challengePlayerToastTitle),
      description: translate(UI_TEXTS.challengePlayerToastDescription).replace('{name}', player.name),
      variant: "default", // Changed from destructive to default
    });
    // Navigate to challenge setup page
    if (player.id) { // Ensure player.id exists
        router.push(`/challenge-setup/${player.id}?name=${encodeURIComponent(player.name)}`);
    } else {
        // Fallback if ID is somehow missing, though unlikely for enriched scores
        console.warn("Attempted to challenge player without an ID:", player);
        router.push(`/challenge-setup/unknown?name=${encodeURIComponent(player.name)}`);
    }
  };

  const handleAddFriendManual = (identifier: string) => {
    if (!user) {
      toast({ title: translate(UI_TEXTS.chatLoginTitle), description: translate(UI_TEXTS.chatLoginMessage), variant: "destructive" });
      return;
    }
    if (!identifier.trim()) {
      toast({ title: translate({es: "Nombre/Email Vacío", en: "Empty Name/Email", fr: "Nom/Email Vide", pt: "Nome/Email Vazio"}), 
              description: translate({es: "Por favor, introduce un nombre o email.", en: "Please enter a name or email.", fr: "Veuillez entrer un nom ou un email.", pt: "Por favor, insira um nome ou email."}), 
              variant: "destructive"});
      return;
    }
    const trimmedIdentifier = identifier.trim();
    // Check if friend already exists by name (case-insensitive)
    if (friendsList.find(friend => friend.name.toLowerCase() === trimmedIdentifier.toLowerCase())) {
      toast({
        title: translate(UI_TEXTS.friendAlreadyExistsToastTitle),
        description: translate(UI_TEXTS.friendAlreadyExistsToastDescription).replace('{name}', trimmedIdentifier),
        variant: "default",
      });
      return;
    }
    // Generate a unique ID for manually added friends
    const newFriendId = `manual-${trimmedIdentifier.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    const newFriend: PlayerScore = {
      id: newFriendId,
      name: trimmedIdentifier,
      score: 0, // Default score for manually added friends
      avatar: `https://placehold.co/40x40.png?text=${trimmedIdentifier.charAt(0).toUpperCase()}`, // Generic avatar
    };
    setFriendsList(prevFriends => [...prevFriends, newFriend]);
    toast({
      title: translate(UI_TEXTS.friendManuallyAddedToastTitle),
      description: translate(UI_TEXTS.friendManuallyAddedToastDescription).replace('{name}', trimmedIdentifier),
    });
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
          {gameState === "IDLE" && !activeRoomId && (
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
                        disabled 
                    >
                        <Gamepad2 className="mr-2 h-5 w-5 sm:mr-3 sm:h-6 sm:w-6" />
                        {translate(UI_TEXTS.startGameWithFriendsButton)}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                        {translate(UI_TEXTS.startGameWithFriendsDescription)}
                    </p>
                 </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleInviteFriends}
                      size="lg"
                      variant="outline"
                      className="w-full sm:flex-1 text-md sm:text-lg py-4 sm:py-5 border-accent text-accent-foreground hover:bg-accent/10 shadow-md"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      {translate(UI_TEXTS.inviteFriendsButton)} (WhatsApp)
                    </Button>
                    <Button
                      onClick={handleCopyRoomLink}
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
                                  <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="avatar person"/>
                                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span 
                                  className={cn(
                                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background",
                                    player.isOnline ? "bg-green-500" : "bg-gray-400"
                                  )} 
                                  title={player.isOnline ? translate({es: "En línea", en: "Online", fr:"En ligne", pt:"Online"}) : translate({es: "Desconectado", en:"Offline", fr:"Hors ligne", pt:"Offline"})}
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
                         <p className="text-sm text-muted-foreground text-center py-2">{translate(UI_TEXTS.waitingForPlayers)}</p>
                      )}
                        <p className="text-xs text-muted-foreground text-center pt-2">{translate(UI_TEXTS.playerListDescription)}</p>
                    </div>
                  </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 border-t">
                <Button
                    onClick={handleLeaveRoom}
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
              {countdownWarningText && (
                  <p className="text-destructive font-medium mt-1 animate-pulse">{countdownWarningText}</p>
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
    

    





