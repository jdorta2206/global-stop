"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Info, Users, Gamepad2, Settings, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { UI_TEXTS } from '@/constants/ui-texts';

export default function ChallengeSetupPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const playerId = params.playerId as string;
  const playerName = searchParams.get('name') || playerId;

  // Textos localizados
  const getLocalizedText = (key: keyof typeof UI_TEXTS, replacements?: Record<string, string>) => {
    let text = UI_TEXTS[key]?.[language] || UI_TEXTS[key]?.['en'] || '';
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }
    return text;
  };

  // Función para enviar desafío (versión simplificada sin backend de pago)
  const sendChallenge = async () => {
    try {
      // Implementación con WebSockets o API routes de Next.js
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          playerName,
          language
        }),
      });

      if (response.ok) {
        router.push(`/challenge/${playerId}/waiting`);
      }
    } catch (error) {
      console.error('Error sending challenge:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-3">
              <Gamepad2 className="h-10 w-10 text-primary mr-3" />
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary">
                {getLocalizedText('challengeSetupPageTitle')}
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {getLocalizedText('challengeSetupDescription', {
                playerName,
                playerId
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-4 border border-dashed border-border rounded-lg bg-card text-center">
              <Info className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-md text-card-foreground">
                {getLocalizedText('challengeSettingsComingSoon')}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              onClick={sendChallenge}
            >
              <Send className="mr-3 h-6 w-6" />
              {getLocalizedText('sendChallengeButton')}
            </Button>

            <div className="mt-8 text-center">
              <Button onClick={() => router.push('/')} variant="outline" size="lg">
                <Home className="mr-2 h-5 w-5" /> 
                {getLocalizedText('backToHomeButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
