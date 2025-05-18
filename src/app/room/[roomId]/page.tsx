
"use client";

import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Users, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

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
};

export default function RoomPage() {
  const params = useParams();
  const { language, translate: translateContext } = useLanguage();
  const roomId = params.roomId as string;

  const translate = (textKey: keyof typeof ROOM_TEXTS) => {
    return translateContext(ROOM_TEXTS[textKey]);
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

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Users className="mr-2 h-5 w-5" /> {translate('playerListTitle')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate('playerListDescription')}
              </p>
              <div className="p-4 bg-muted/50 rounded-md min-h-[50px]">
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
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" /> {translate('backToHome')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
