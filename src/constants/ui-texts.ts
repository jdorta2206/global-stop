
import type { Language } from '@/contexts/language-context';

export const UI_TEXTS: Record<string, Record<Language, string>> = {
  welcomeTitle: { es: "¡Bienvenido a Stop!", en: "Welcome to Stop!", fr: "Bienvenue à Stop!", pt: "Bem-vindo ao Stop!" },
  playVsAI: { es: "Elige cómo quieres jugar:", en: "Choose how you want to play:", fr: "Choisissez comment vous voulez jouer :", pt: "Escolha como você quer jogar:" },
  shareGameMessageWhatsApp: { es: "¡Oye! ¡Juega Stop conmigo! Es muy divertido:",
    en: "Hey! Play Stop with me! It's great fun:",
    fr: "Salut ! Joue à Stop avec moi ! C'est très amusant :",
    pt: "Ei! Jogue Stop comigo! É muito divertido:"
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
    es: "Debes iniciar sesión para chatear y participar plenamente.",
    en: "You must be logged in to chat and participate fully.",
    fr: "Vous devez être connecté pour discuter et participer pleinement.",
    pt: "Você precisa estar logado para conversar e participar plenamente."
  },
  chatLoginTitle: { es: "Inicia sesión", en: "Login Required", fr: "Connexion Requise", pt: "Login Necessário" },
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
  canYouBeatMe: { es: "¿Crees que puedes superarme? ¡Inténtalo en Stop!", en: "Think you can beat me? Try Stop!", fr: "Pensez-vous pouvoir me battre ? Essayez Stop !", pt: "Acha que pode me vencer? Experimente o Stop!" },
  lobbyTitle: { es: "Sala de Espera Multijugador", en: "Multiplayer Lobby", fr: "Salon Multijoueur", pt: "Lobby Multijogador" },
  inRoomMessage: { es: "Estás en la Sala:", en: "You are in Room:", fr: "Vous êtes dans la Salle :", pt: "Você está na Sala:" }, // Mantener esta línea como está
  goToGameRoomButton: { es: "Ir a la Sala de Juego", en: "Go to Game Room", fr: "Aller à la Salle de Jeu", pt: "Ir para a Sala de Jogo" },
  goToGameRoomDescription: {
    es: "La partida se desarrollará en la página de la sala. ¡Allí podrás ver a otros jugadores!",
    en: "The game will take place on the room page. You can see other players there!",
    fr: "La partie se déroulera sur la page de la salle. Vous pourrez y voir d'autres joueurs !",
    pt: "O jogo acontecerá na página da sala. Você poderá ver outros jogadores lá!"
  },
  inviteFriendsButton: { es: "Invitar Amigos", en: "Invite Friends", fr: "Inviter des Amis", pt: "Convidar Amigos" },
  leaveRoomButton: { es: "Salir de la Sala", en: "Leave Room", fr: "Quitter la Salle", pt: "Sair da Sala" },
  shareRoomLinkMessageWhatsApp: { es: "¡Únete a mi sala en Global Stop! ID:", en: "Join my room in Global Stop! ID:", fr: "Rejoins ma salle sur Global Stop ! ID :", pt: "Entre na minha sala no Global Stop! ID:" },
  joinHere: { es: "¡Únete a mi sala en Stop! ID: {roomId}. ¡Aquí tienes el enlace:", en: "Join my room in Stop! ID: {roomId}. Here's the link:", fr: "Rejoins ma salle sur Stop ! ID : {roomId}. Voici le lien :", pt: "Entre na minha sala no Stop! ID: {roomId}. Aqui está o link:" }, // Adjusted text for clarity and brevity
  copyRoomLinkButton: { es: "Copiar Enlace de la Sala", en: "Copy Room Link", fr: "Copier le Lien de la Salle", pt: "Copiar Link da Sala" },
  roomLinkCopiedToastTitle: { es: "¡Enlace Copiado!", en: "Link Copied!", fr: "Lien Copié !", pt: "Link Copiado!" }, // Simplified toast title
  roomLinkCopiedToastDescription: { es: "El enlace a la sala ha sido copiado a tu portapapeles.", en: "The room link has been copied to your clipboard.", fr: "Le lien de la salle a été copié dans votre presse-papiers.", pt: "O link da sala foi copiado para sua área de transferência." },
  playerListTitle: { es: "Jugadores en la Sala", en: "Players in Room", fr: "Joueurs dans la Salle", pt: "Jogadores na Sala" },
  playerListDescriptionLobby: {
    es: "Los jugadores conectados a Stop aparecerán aquí. El estado en línea se actualiza en tiempo real desde Firebase.",
    en: "Connected players will appear here. Online status updates in real-time from Firebase.",
    fr: "Les joueurs connectés apparaîtront ici. Le statut en ligne est mis à jour en temps réel depuis Firebase.",
    pt: "Jogadores conectados aparecerão aqui. O status online atualiza em tempo real do Firebase."
  },
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  friendAddedToastTitle: { es: "¡Amigo Añadido!", en: "Friend Added!", fr: "Ami Ajouté !", pt: "Amigo Adicionado!"},
  friendAddedToastDescription: { es: "{name} ha sido añadido a tu lista local de amigos.", en: "{name} has been added to your local friends list.", fr: "{name} a été ajouté à votre liste d'amis locale.", pt: "{name} foi adicionado à sua lista local de amigos."},
  friendAlreadyExistsToastTitle: { es: "Amigo ya Existe", en: "Friend Already Exists", fr: "Ami Existe Déjà", pt: "Amigo Já Existe"},
  friendAlreadyExistsToastDescription: { es: "{name} ya está en tu lista de amigos.", en: "{name} is already on your friends list.", fr: "{name} est déjà dans votre liste d'amis.", pt: "{name} já está na sua lista de amigos."},
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" },
  waitingForPlayers: { es: "Esperando a otros jugadores... Comparte el ID de la sala.", en: "Waiting for other players... Share the room ID.", fr: "En attente d'autres joueurs... Partagez l'ID de la salle.", pt: "Aguardando outros jogadores... Compartilhe o ID da sala." },
  loggedInAs: { es: "Conectado como: {name}", en: "Logged in as: {name}", fr: "Connecté en tant que : {name}", pt: "Conectado como: {name}" },
  challengePlayerToastTitle: { es: "Desafío Próximamente", en: "Challenge Coming Soon", fr: "Défi Bientôt Disponible", pt: "Desafio Em Breve" },
  challengePlayerToastDescription: { es: "La funcionalidad para desafiar a '{name}' se añadirá en futuras actualizaciones.", en: "The feature to challenge '{name}' will be added in future updates.", fr: "La fonctionnalité pour défier '{name}' sera ajoutée dans les futures mises à jour.", pt: "A funcionalidade para desafiar '{name}' será adicionada em futuras atualizações." },
  friendAddedFromGlobalToastTitle: { es: "Amigo Añadido desde Global", en: "Friend Added from Global", fr: "Ami Ajouté depuis Global", pt: "Amigo Adicionado do Global" },
  friendAddedFromGlobalToastDescription: { es: "'{name}' ha sido añadido a tu lista local de amigos desde la tabla de puntuaciones.", en: "'{name}' has been added to your local friends list from the leaderboard.", fr: "'{name}' a été ajouté à votre liste d'amis locale depuis le classement.", pt: "'{name}' foi adicionado à sua lista local de amigos do placar." },
  addFriendManualTitle: { es: "Añadir Amigo por Nombre/Email", en: "Add Friend by Name/Email", fr: "Ajouter un Ami por Nom/Email", pt: "Adicionar Amigo por Nome/Email" },
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
  cannotAddSelfTitle: {es: "No puedes agregarte", en: "Cannot add self", fr:"Ne peut pas s'ajouter", pt: "Não pode adicionar a si mesmo"},
  cannotAddSelfDescription: {es: "No puedes ser tu propio amigo.", en: "You cannot be your own friend.", fr: "Vous ne pouvez pas être votre propre ami.", pt: "Você não pode ser seu próprio amigo."},
  emptyIdentifierTitle: {es: "Nombre/Email Vacío", en: "Empty Name/Email", fr: "Nom/Email Vide", pt: "Nome/Email Vazio"},
  emptyIdentifierDescription: {es: "Por favor, introduce un nombre o email.", en: "Please enter a name or email.", fr: "Veuillez entrer un nom ou un email.", pt: "Por favor, insira um nome ou email."},
  logoAlt: { es: "Logo del juego Stop", en: "Stop Game Logo", fr: "Logo du jeu Stop", pt: "Logo do Jogo Stop" }, // Changed from Global Stop Game Logo
  onlineStatus: { es: "Jugando Stop", en: "Playing Stop", fr: "Jouant à Stop", pt: "Jogando Stop" }, // Changed to be more descriptive of status
  offlineStatus: { es: "Desconectado", en: "Offline", fr: "Hors ligne", pt: "Offline" },
  errorToastTitle: { es: "Error", en: "Error", fr: "Erreur", pt: "Erro" },
  errorToastDescription: { es: "Ha ocurrido un error inesperado.", en: "An unexpected error occurred.", fr: "Une erreur inattendue s'est produite.", pt: "Ocorreu um erro inesperado." },
  errorAITitle: { es: "Error de IA", en: "AI Error", fr: "Erreur IA", pt: "Erro de IA" },
  errorValidationTitle: { es: "Error de Validación", en: "Validation Error", fr: "Erreur de Validation", pt: "Erro de Validação" },
  errorValidationDescription: { es: "No se pudo validar la palabra '{word}' para la categoría {category}.", en: "Could not validate the word '{word}' for category {category}.", fr: "Impossible de valider le mot '{word}' pour la catégorie {category}.", pt: "Não foi possível validar a palavra '{word}' para a categoria {category}." },
  stopButtonLabel: { es: "¡ALTO!", en: "STOP!", fr: "STOP !", pt: "PARE!" },
  youWillBeHost: { es: "Serás el anfitrión al iniciar la partida.", en: "You will be the host when starting the game.", fr: "Vous serez l'hôte au démarrage de la partie.", pt: "Você será o anfitrião ao iniciar o jogo." },
  youAreHost: { es: "Eres el anfitrión. ¡Puedes iniciar la partida!", en: "You are the host. You can start the game!", fr: "Vous êtes l'hôte. Vous pouvez démarrer la partie !", pt: "Você é o anfitrião. Pode iniciar o jogo!" },
  startGameWithFriendsButton: { es: "Iniciar Partida (Amigos) - Próximamente", en: "Start Game (Friends) - Coming Soon", fr: "Démarrer la Partie (Amis) - Bientôt Disponible", pt: "Iniciar Jogo (Amigos) - Em Breve" },
  startGameWithFriendsDescription: { es: "La funcionalidad para iniciar una partida multijugador real con otros jugadores en esta sala se añadirá en futuras actualizaciones.", en: "The functionality to start a real multiplayer game with other players in this room will be added in future updates.", fr: "La fonctionnalité pour démarrer une vraie partie multijoueur avec d'autres joueurs dans cette salle sera ajoutée dans les futures mises à jour.", pt: "A funcionalidade para iniciar um jogo multijogador real com outros jogadores nesta sala será adicionada em futuras atualizações." },
  actionNotAllowedTitle: { es: "Acción no Permitida", en: "Action Not Allowed", fr: "Action non Autorisée", pt: "Ação não Permitida" },
  onlyHostCanStart: { es: "Solo el anfitrión puede iniciar la partida.", en: "Only the host can start the game.", fr: "Seul l'hôte peut démarrer la partie.", pt: "Apenas o anfitrião pode iniciar o jogo." },
  onlyHostCanEvaluate: { es: "Solo el anfitrión puede evaluar la ronda.", en: "Only the host can evaluate the round.", fr: "Seul l'hôte peut évaluer la manche.", pt: "Apenas o anfitrião pode avaliar a rodada." },
  resultsAvailable: { es: "Los resultados están disponibles para todos.", en: "Results are available for everyone.", fr: "Les résultats sont disponibles pour tous.", pt: "Os resultados estão disponíveis para todos." },
  errorSubmittingAnswers: { es: "No se pudieron enviar tus respuestas.", en: "Could not submit your answers.", fr: "Impossible d'envoyer vos réponses.", pt: "Não foi possível enviar suas respostas." },
  errorSendingMessage: { es: "No se pudo enviar tu mensaje.", en: "Could not send your message.", fr: "Impossible d'envoyer votre message.", pt: "Não foi possível enviar sua mensagem." },
  wordValid: { es: "Válido", en: "Valid", fr: "Valide", pt: "Válido" },
  wordFormatError: { es: "Formato Incorrecto", en: "Incorrect Format", fr: "Format Incorrect", pt: "Formato Incorreto" },
  wordInvalidError: { es: "Palabra Inválida", en: "Invalid Word", fr: "Mot Invalide", pt: "Palavra Inválida" },
  hostLabel: { es: "Anfitrión", en: "Host", fr: "Hôte", pt: "Anfitrião" },
  waitingSubmissions: { es: "Esperando envíos", en: "Waiting for submissions", fr: "En attente des soumissions", pt: "Aguardando envios" },
  checkDbRules: { es: "Comprueba las reglas de tu base de datos Firebase.", en: "Check your Firebase database rules.", fr: "Vérifiez les règles de votre base de données Firebase.", pt: "Verifique as regras do seu banco de dados Firebase." },
  playVsAI: { es: "Jugar contra IA", en: "Play against AI", fr: "Jouer contre l'IA", pt: "Jogar contra IA" }, // Re-added this key with the correct name
};

// Re-added missing keys
UI_TEXTS.createRoom = { es: "Crear Sala (Amigos)", en: "Create Room (Friends)", fr: "Créer une Salle (Amis)", pt: "Criar Sala (Amigos)" };
UI_TEXTS.joinRoom = { es: "Unirse a Sala", en: "Join Room", fr: "Rejoindre une Salle", pt: "Entrar na Sala" };
UI_TEXTS.shareGame = { es: "Compartir Stop", en: "Share Stop", fr: "Partager Stop", pt: "Compartilhar Stop" };