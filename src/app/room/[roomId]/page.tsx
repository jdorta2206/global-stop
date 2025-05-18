
"use client";

import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Info, Share2, LogOut, Copy, Link as LinkIcon } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/language-context';
import { useRoom } from '@/contexts/room-context'; // Import useRoom
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const ROOM_TEXTS = {
  title: { es: "Sala de Juego:", en: "Game Room:", fr: "Salle de Jeu :", pt: "Sala de Jogo:" },
  welcome: { es: "¡Bienvenido/a a la sala!", en: "Welcome to the room!", fr: "Bienvenue dans la salle !", pt: "Bem-vindo(a) à sala!" },
  description: { 
    es: "Actualmente, esta es una página de marcador de posición. La funcionalidad completa para juegos multijugador en esta sala se implementará en futuras actualizaciones.", 
    en: "This is currently a placeholder page. Full functionality for multiplayer games in this room will be implemented in future updates.",
    fr: "Ceci est actuellement une page de remplacement. La fonctionnalité complète pour les jeux multijoueurs dans cette salle sera implémentée dans les futures mises à jour.",
    pt: "Esta é atualmente uma página de placeholder. A funcionalidade completa para jogos multiplayer nesta sala será implementada em futuras atualizações."
  },
  playerListTitle: { es: "Jugadores en la Sala (Próximamente)", en: "Players in Room (Coming Soon)", fr: "Joueurs dans la Salle (Bientôt disponible)", pt: "Jogadores na Sala (Em breve)" },
  playerListDescription: { 
    es: "Aquí verás la lista de amigos que se han unido.", 
    en: "Here you will see the list of friends who have joined.",
    fr: "Ici, vous verrez la liste des amis qui ont rejoint.",
    pt: "Aqui você verá a lista de amigos que entraram."
  },
  gameInfoTitle: { es: "Información del Juego (Próximamente)", en: "Game Info (Coming Soon)", fr: "Infos sur le Jeu (Bientôt disponible)", pt: "Informações do Jogo (Em breve)" },
  gameInfoDescription: { 
    es: "Detalles sobre la partida, como la letra actual, categorías, etc.", 
    en: "Details about the match, like current letter, categories, etc.",
    fr: "Détails sur le match, comme la lettre actuelle, les catégories, etc.",
    pt: "Detalhes sobre a partida, como letra atual, categorias, etc."
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
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { language, translate: translateContext } = useLanguage();
  const { setActiveRoomId } = useRoom();
  const { toast } = useToast();
  const roomId = params.roomId as string;

  const translate = (textKey: keyof typeof ROOM_TEXTS) => {
    return translateContext(ROOM_TEXTS[textKey]) || ROOM_TEXTS[textKey]['en'];
  }

  // Ensure this room is set as active if accessed directly via URL
  useEffect(() => {
    if (roomId) {
      setActiveRoomId(roomId);
    }
  }, [roomId, setActiveRoomId]);

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    router.push('/');
  };

  const roomUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = async (text: string, type: 'id' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: type === 'id' ? translate('idCopiedToastTitle') : translate('linkCopiedToastTitle'),
        description: `${text} ${language === 'es' ? 'ha sido copiado.' : 'has been copied.'}`,
      });
    } catch (err) {
      toast({
        title: translate('errorCopyingToastTitle'),
        description: language === 'es' ? 'No se pudo copiar.' : 'Could not copy.',
        variant: "destructive",
      });
    }
  };

  const handleShareViaWhatsApp = () => {
    const message = `${translate('shareMessageWhatsApp')} ${roomId}. ${translate('joinHere')} ${roomUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!roomId) {
    return ( // Or a more sophisticated loading/error state
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
          <p>{language === 'es' ? 'Cargando sala...' : 'Loading room...'}</p>
        </main>
        <AppFooter language={language} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
              {translate('title')} <span className="text-accent">{roomId}</span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {translate('welcome')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-4 border border-border rounded-lg bg-card">
              <p className="text-md text-card-foreground">
                {translate('description')}
              </p>
            </div>

            <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Share2 className="mr-2 h-5 w-5" /> {translate('shareRoomTitle')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate('shareRoomDescription')}
              </p>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-mono break-all">ID: {roomId}</p>
                <p className="text-sm font-mono break-all mt-1">{language === 'es' ? 'Enlace' : 'Link'}: {roomUrl}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button variant="outline" onClick={() => copyToClipboard(roomId, 'id')} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" /> {translate('copyRoomIdButton')}
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(roomUrl, 'link')} className="flex-1">
                  <LinkIcon className="mr-2 h-4 w-4" /> {translate('copyRoomLinkButton')}
                </Button>
              </div>
               <Button onClick={handleShareViaWhatsApp} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white">
                 <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2.05 22L7.31 20.62C8.72 21.39 10.33 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.49 20.13 8.99 19.68 7.74 18.89L7.32 18.64L4.4 19.56L5.34 16.74L5.07 16.3C4.18 14.95 3.71 13.38 3.71 11.91C3.71 7.33 7.45 3.6 12.04 3.6C16.63 3.6 20.37 7.33 20.37 11.91C20.37 16.5 16.63 20.13 12.04 20.13ZM17.36 14.45C17.11 14.79 16.23 15.26 15.92 15.43C15.61 15.6 15.37 15.62 15.13 15.33C14.89 15.04 14.01 14.31 12.96 13.25C12.11 12.41 11.53 11.64 11.38 11.35C11.24 11.06 11.39 10.89 11.53 10.75C11.65 10.61 11.83 10.39 12 10.21C12.17 10.03 12.24 9.89 12.36 9.65C12.48 9.41 12.41 9.2 12.33 9.03C12.25 8.86 11.76 7.65 11.54 7.18C11.32 6.71 11.09 6.76 10.92 6.75C10.75 6.74 10.54 6.74 10.32 6.74C10.1 6.74 9.81 6.81 9.56 7.15C9.31 7.49 8.61 8.13 8.61 9.35C8.61 10.57 9.59 11.73 9.73 11.91C9.87 12.09 11.76 14.84 14.51 16.1C15.2 16.41 15.73 16.62 16.13 16.78C16.71 17.02 17.07 16.97 17.32 16.73C17.57 16.49 18.12 15.88 18.29 15.54C18.46 15.2 18.46 14.91 18.38 14.79C18.3 14.68 17.61 14.11 17.36 14.45Z"/>
                  </svg>
                  {translate('shareViaWhatsApp')}
               </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Users className="mr-2 h-5 w-5" /> {translate('playerListTitle')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate('playerListDescription')}
              </p>
              <div className="p-4 bg-muted/50 rounded-md min-h-[50px]">
                {/* Placeholder for player list */}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Info className="mr-2 h-5 w-5" /> {translate('gameInfoTitle')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate('gameInfoDescription')}
              </p>
              <div className="p-4 bg-muted/50 rounded-md min-h-[50px]">
                {/* Placeholder for game info */}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button onClick={handleLeaveRoom} variant="outline" size="lg" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="mr-2 h-5 w-5" /> {translate('leaveRoomButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
