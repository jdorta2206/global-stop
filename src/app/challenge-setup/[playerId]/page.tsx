"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Info, Users, Gamepad2, Settings, Send } from 'lucide-react';
import { useLanguage, type LanguageOption } from '@/contexts/language-context';
import { UI_TEXTS } from '@/constants/ui-texts'; // Import from new location

export default function ChallengeSetupPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, translate } = useLanguage();

  const playerId = params.playerId as string;
  const playerName = searchParams.get('name') || playerId;

  // Localized texts for this page
  const pageTexts = {
    title: UI_TEXTS.challengeSetupPageTitle,
    description: UI_TEXTS.challengeSetupDescription,
    settingsComingSoon: UI_TEXTS.challengeSettingsComingSoon,
    sendChallengeComingSoon: UI_TEXTS.sendChallengeComingSoon,
    backButton: UI_TEXTS.backToHomeButton,
  };

  const translatePageText = (key: keyof typeof pageTexts) => {
    let text = pageTexts[key]?.[language] || pageTexts[key]?.['en'] || '';
    if (key === 'description') {
      text = text.replace('{playerName}', playerName).replace('{playerId}', playerId);
    }
    return text;
  };

  const translateCommon = (textKey: keyof typeof UI_TEXTS) => {
    return UI_TEXTS[textKey]?.[language] || UI_TEXTS[textKey]?.['en'] || '';
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
                {translatePageText('title')}
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {translatePageText('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="p-4 border border-dashed border-border rounded-lg bg-card text-center">
              <Info className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-md text-card-foreground">
                {translatePageText('settingsComingSoon')}
              </p>
            </div>
            {/* Etiqueta de apertura <Button> para el boton de Send Challenge */}
            <Button
              size="lg"
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              disabled
            >
              <Send className="mr-3 h-6 w-6" />
              {translatePageText('sendChallengeComingSoon')}
            </Button>

            <div className="mt-8 text-center">
              <Button onClick={() => router.push('/')} variant="outline" size="lg">
                <Home className="mr-2 h-5 w-5" /> {translateCommon('backToHomeButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
