// src/constants/ui-texts.ts
import type { Language } from '@/contexts/language-context';

export const UI_TEXTS = {
  // Textos generales
  common: {
    loading: {
      es: "Cargando...",
      en: "Loading...",
      fr: "Chargement...",
      pt: "Carregando..."
    },
    error: {
      es: "Error",
      en: "Error",
      fr: "Erreur",
      pt: "Erro"
    },
    close: {
      es: "Cerrar",
      en: "Close",
      fr: "Fermer",
      pt: "Fechar"
    },
    cancel: {
      es: "Cancelar",
      en: "Cancel",
      fr: "Annuler",
      pt: "Cancelar"
    }
  },

  // Pantalla de inicio
  welcome: {
    title: {
      es: "¡Bienvenido a Stop!",
      en: "Welcome to Stop!",
      fr: "Bienvenue à Stop!",
      pt: "Bem-vindo ao Stop!"
    },
    playOptions: {
      es: "Elige cómo quieres jugar:",
      en: "Choose how you want to play:",
      fr: "Choisissez comment vous voulez jouer :",
      pt: "Escolha como você quer jogar:"
    }
  },

  // Salas y multijugador
  rooms: {
    create: {
      title: {
        es: "¡Sala Creada!",
        en: "Room Created!",
        fr: "Salle Créée !",
        pt: "Sala Criada!"
      },
      description: {
        es: "Comparte este ID con tus amigos. Al hacer clic en 'Ir a la Sala', serás llevado a la página de esta sala.",
        en: "Share this ID with your friends. Clicking 'Go to Room' will take you to a page for this room.",
        fr: "Partagez cet ID avec vos amis. En cliquant sur 'Aller à la Salle', vous serez dirigé vers une page pour cette salle.",
        pt: "Compartilhe este ID com seus amigos. Clicar em 'Ir para a Sala' o levará para uma página desta sala."
      }
    },
    join: {
      title: {
        es: "Unirse a una Sala",
        en: "Join a Room",
        fr: "Rejoindre une Salle",
        pt: "Entrar em uma Sala"
      },
      description: {
        es: "Ingresa el ID de la sala. Al unirte, serás llevado a una página para esta sala.",
        en: "Enter the Room ID. Upon joining, you'll be taken to a page for this room.",
        fr: "Entrez l'ID de la salle. En rejoignant, vous serez dirigé vers une page pour cette salle.",
        pt: "Digite o ID da sala. Ao entrar, você será levado para uma página desta sala."
      }
    },
    labels: {
      roomId: {
        es: "ID de Sala:",
        en: "Room ID:",
        fr: "ID de la Salle :",
        pt: "ID da Sala:"
      },
      roomIdPlaceholder: {
        es: "Ej: ABC123XYZ",
        en: "Ex: ABC123XYZ",
        fr: "Ex : ABC123XYZ",
        pt: "Ex: ABC123XYZ"
      }
    },
    buttons: {
      copyId: {
        es: "Copiar ID",
        en: "Copy ID",
        fr: "Copier l'ID",
        pt: "Copiar ID"
      },
      goToRoom: {
        es: "Ir a la Sala",
        en: "Go to Room",
        fr: "Aller à la Salle",
        pt: "Ir para a Sala"
      },
      join: {
        es: "Unirse",
        en: "Join",
        fr: "Rejoindre",
        pt: "Entrar"
      }
    }
  },

  // Notificaciones (toasts)
  notifications: {
    idCopied: {
      title: {
        es: "¡ID de Sala Copiado!",
        en: "Room ID Copied!",
        fr: "ID de Salle Copié !",
        pt: "ID da Sala Copiado!"
      },
      description: {
        es: "El ID ha sido copiado. ¡Compártelo con tus amigos!",
        en: "The ID has been copied. Share it with your friends!",
        fr: "L'ID a été copié. Partagez-le avec vos amis !",
        pt: "O ID foi copiado. Compartilhe com seus amigos!"
      }
    },
    errorCopying: {
      title: {
        es: "Error al Copiar",
        en: "Error Copying",
        fr: "Erreur de Copie",
        pt: "Erro ao Copiar"
      },
      description: {
        es: "No se pudo copiar. Por favor, cópialo manualmente.",
        en: "Could not copy. Please copy it manually.",
        fr: "Impossible de copier. Veuillez le copier manuellement.",
        pt: "Não foi possível copiar. Por favor, copie manualmente."
      }
    }
  },

  // Juego
  game: {
    results: {
      title: {
        es: "Resultados de la Ronda",
        en: "Round Results",
        fr: "Résultats de la Manche",
        pt: "Resultados da Rodada"
      },
      winner: {
        player: {
          es: "¡Jugador Gana la Ronda!",
          en: "Player Wins the Round!",
          fr: "Le Joueur Gagne la Manche !",
          pt: "Jogador Vence a Rodada!"
        },
        ai: {
          es: "¡IA Gana la Ronda!",
          en: "AI Wins the Round!",
          fr: "L'IA Gagne la Manche !",
          pt: "IA Vence a Rodada!"
        },
        tie: {
          es: "¡Empate en la Ronda!",
          en: "Round Tie!",
          fr: "Égalité dans la Manche !",
          pt: "Empate na Rodada!"
        },
        none: {
          es: "Nadie puntuó en esta ronda.",
          en: "Nobody scored this round.",
          fr: "Personne n'a marqué dans cette manche.",
          pt: "Ninguém pontuou nesta rodada."
        }
      },
      scores: {
        player: {
          es: "Tu Puntuación (Ronda):",
          en: "Your Score (Round):",
          fr: "Votre Score (Manche) :",
          pt: "Sua Pontuação (Rodada):"
        },
        ai: {
          es: "Puntuación IA (Ronda):",
          en: "AI Score (Round):",
          fr: "Score IA (Manche) :",
          pt: "Pontuação IA (Rodada):"
        },
        total: {
          es: "Puntuación Total Acumulada",
          en: "Total Accumulated Score",
          fr: "Score Total Accumulé",
          pt: "Pontuação Total Acumulada"
        }
      }
    },
    buttons: {
      nextRound: {
        es: "Jugar Siguiente Ronda",
        en: "Play Next Round",
        fr: "Jouer la Prochaine Manche",
        pt: "Jogar Próxima Rodada"
      },
      shareScore: {
        es: "Compartir Puntuación",
        en: "Share Score",
        fr: "Partager le Score",
        pt: "Compartilhar Pontuação"
      },
      stop: {
        es: "¡ALTO!",
        en: "STOP!",
        fr: "STOP !",
        pt: "PARE!"
      }
    },
    time: {
      left: {
        es: "Tiempo Restante:",
        en: "Time Left:",
        fr: "Temps Restant :",
        pt: "Tempo Restante:"
      },
      endingSoon: {
        es: "¡Solo 10 segundos!",
        en: "Only 10 seconds left!",
        fr: "Plus que 10 secondes !",
        pt: "Apenas 10 segundos!"
      },
      almostUp: {
        es: "¡5 segundos! ¡RÁPIDO!",
        en: "5 seconds! QUICK!",
        fr: "5 secondes ! VITE !",
        pt: "5 segundos! RÁPIDO!"
      },
      finalCountdown: {
        es: "¡3... 2... 1...!",
        en: "3... 2... 1...!",
        fr: "3... 2... 1... !",
        pt: "3... 2... 1...!"
      }
    }
  },

  // Chat
  chat: {
    loginRequired: {
      title: {
        es: "Inicia sesión",
        en: "Login Required",
        fr: "Connexion Requise",
        pt: "Login Necessário"
      },
      message: {
        es: "Debes iniciar sesión para chatear y participar plenamente.",
        en: "You must be logged in to chat and participate fully.",
        fr: "Vous devez être connecté pour discuter et participer pleinement.",
        pt: "Você precisa estar logado para conversar e participar plenamente."
      }
    },
    openLabel: {
      es: "Abrir chat",
      en: "Open chat",
      fr: "Ouvrir le chat",
      pt: "Abrir chat"
    }
  },

  // Amigos
  friends: {
    add: {
      title: {
        es: "Añadir Amigo",
        en: "Add Friend",
        fr: "Ajouter un Ami",
        pt: "Adicionar Amigo"
      },
      success: {
        title: {
          es: "¡Amigo Añadido!",
          en: "Friend Added!",
          fr: "Ami Ajouté !",
          pt: "Amigo Adicionado!"
        },
        description: {
          es: "{name} ha sido añadido a tu lista local de amigos.",
          en: "{name} has been added to your local friends list.",
          fr: "{name} a été ajouté à votre liste d'amis locale.",
          pt: "{name} foi adicionado à sua lista local de amigos."
        }
      },
      error: {
        exists: {
          title: {
            es: "Amigo ya Existe",
            en: "Friend Already Exists",
            fr: "Ami Existe Déjà",
            pt: "Amigo Já Existe"
          },
          description: {
            es: "{name} ya está en tu lista de amigos.",
            en: "{name} is already on your friends list.",
            fr: "{name} est déjà dans votre liste d'amis.",
            pt: "{name} já está na sua lista de amigos."
          }
        },
        self: {
          title: {
            es: "No puedes agregarte",
            en: "Cannot add self",
            fr: "Ne peut pas s'ajouter",
            pt: "Não pode adicionar a si mesmo"
          },
          description: {
            es: "No puedes ser tu propio amigo.",
            en: "You cannot be your own friend.",
            fr: "Vous ne pouvez pas être votre propre ami.",
            pt: "Você não pode ser seu próprio amigo."
          }
        },
        empty: {
          title: {
            es: "Nombre/Email Vacío",
            en: "Empty Name/Email",
            fr: "Nom/Email Vide",
            pt: "Nome/Email Vazio"
          },
          description: {
            es: "Por favor, introduce un nombre o email.",
            en: "Please enter a name or email.",
            fr: "Veuillez entrer un nom ou un email.",
            pt: "Por favor, insira um nome ou email."
          }
        }
      }
    }
  },

  // Lobby
  lobby: {
    title: {
      es: "Sala de Espera Multijugador",
      en: "Multiplayer Lobby",
      fr: "Salon Multijoueur",
      pt: "Lobby Multijogador"
    },
    inRoom: {
      es: "Estás en la Sala:",
      en: "You are in Room:",
      fr: "Vous êtes dans la Salle :",
      pt: "Você está na Sala:"
    },
    waiting: {
      es: "Esperando a otros jugadores... Comparte el ID de la sala.",
      en: "Waiting for other players... Share the room ID.",
      fr: "En attente d'autres joueurs... Partagez l'ID de la salle.",
      pt: "Aguardando outros jogadores... Compartilhe o ID da sala."
    }
  },

  // Host
  host: {
    label: {
      es: "Anfitrión",
      en: "Host",
      fr: "Hôte",
      pt: "Anfitrião"
    },
    messages: {
      willBe: {
        es: "Serás el anfitrión al iniciar la partida.",
        en: "You will be the host when starting the game.",
        fr: "Vous serez l'hôte au démarrage de la partie.",
        pt: "Você será o anfitrião ao iniciar o jogo."
      },
      is: {
        es: "Eres el anfitrión. ¡Puedes iniciar la partida!",
        en: "You are the host. You can start the game!",
        fr: "Vous êtes l'hôte. Vous pouvez démarrer la partie !",
        pt: "Você é o anfitrião. Pode iniciar o jogo!"
      },
      onlyHost: {
        start: {
          es: "Solo el anfitrión puede iniciar la partida.",
          en: "Only the host can start the game.",
          fr: "Seul l'hôte peut démarrer la partie.",
          pt: "Apenas o anfitrião pode iniciar o jogo."
        },
        evaluate: {
          es: "Solo el anfitrión puede evaluar la ronda.",
          en: "Only the host can evaluate the round.",
          fr: "Seul l'hôte peut évaluer la manche.",
          pt: "Apenas o anfitrião pode avaliar a rodada."
        }
      }
    }
  },

  // Validación de palabras
  validation: {
    valid: {
      es: "Válido",
      en: "Valid",
      fr: "Valide",
      pt: "Válido"
    },
    errors: {
      format: {
        es: "Formato Incorrecto",
        en: "Incorrect Format",
        fr: "Format Incorrect",
        pt: "Formato Incorreto"
      },
      invalid: {
        es: "Palabra Inválida",
        en: "Invalid Word",
        fr: "Mot Invalide",
        pt: "Palavra Inválida"
      },
      description: {
        es: "No se pudo validar la palabra '{word}' para la categoría {category}.",
        en: "Could not validate the word '{word}' for category {category}.",
        fr: "Impossible de valider le mot '{word}' pour la catégorie {category}.",
        pt: "Não foi possível validar a palavra '{word}' para a categoria {category}."
      }
    }
  }
};

// Tipo para TypeScript
export type UITexts = typeof UI_TEXTS;
