
"use client";

import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Users, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context'; // Import useLanguage

const ROOM_TEXTS = {
  title: { es: "Sala de Juego:", en: "Game Room:" },
  welcome: { es: "¡Bienvenido/a a la sala!", en: "Welcome to the room!" },
  description: { es: "Actualmente, esta es una página de marcador de posición. La funcionalidad completa para juegos multijugador en esta sala se implementará en futuras actualizaciones.", en: "This is currently a placeholder page. Full functionality for multiplayer games in this room will be implemented in future updates." },
  playerListTitle: { es: "Jugadores en la Sala (Próximamente)", en: "Players in Room (Coming Soon)" },
  playerListDescription: { es: "Aquí verás la lista de amigos que se han unido.", en: "Here you will see the list of friends who have joined." },
  gameInfoTitle: { es: "Información del Juego (Próximamente)", en: "Game Info (Coming Soon)" },
  gameInfoDescription: { es: "Detalles sobre la partida, como la letra actual, categorías, etc.", en: "Details about the match, like current letter, categories, etc." },
  backToHome: { es: "Volver al Inicio", en: "Back to Home" },
};

export default function RoomPage() {
  const params = useParams();
  const { language, translate } = useLanguage(); // Use language context
  const roomId = params.roomId as string;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
              {translate(ROOM_TEXTS.title)} <span className="text-accent">{roomId}</span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {translate(ROOM_TEXTS.welcome)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-4 border border-border rounded-lg bg-card">
              <p className="text-md text-card-foreground">
                {translate(ROOM_TEXTS.description)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Users className="mr-2 h-5 w-5" /> {translate(ROOM_TEXTS.playerListTitle)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate(ROOM_TEXTS.playerListDescription)}
              </p>
              {/* Placeholder for player list */}
              <div className="p-4 bg-muted/50 rounded-md min-h-[50px]">
                 {/* Example: <p>Jugador 1</p> <p>Jugador 2</p> */}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center">
                <Info className="mr-2 h-5 w-5" /> {translate(ROOM_TEXTS.gameInfoTitle)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {translate(ROOM_TEXTS.gameInfoDescription)}
              </p>
               {/* Placeholder for game info */}
              <div className="p-4 bg-muted/50 rounded-md min-h-[50px]">
                {/* Example: <p>Letra: G</p> <p>Categorías: Nombre, Animal...</p> */}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" /> {translate(ROOM_TEXTS.backToHome)}
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
