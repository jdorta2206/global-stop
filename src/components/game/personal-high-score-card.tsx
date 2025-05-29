
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';

interface PersonalHighScoreCardProps {
  highScore: number;
  className?: string;
  language: Language;
}

const TEXTS = {
  title: { es: "Tu Puntuación Más Alta", en: "Your Personal High Score", fr: "Votre Meilleur Score Personnel", pt: "Sua Pontuação Mais Alta" },
  subtitle: { es: "¡Sigue jugando para superarla!", en: "Keep playing to beat it!", fr: "Continuez à jouer pour le battre !", pt: "Continue jogando para superá-la!" },
};

export function PersonalHighScoreCard({ highScore, className, language }: PersonalHighScoreCardProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };
  
  const localeForNumber = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US';


  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">
          {translate('title')}
        </CardTitle>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          {highScore.toLocaleString(localeForNumber)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {translate('subtitle')}
        </p>
      </CardContent>
    </Card>
  );
}
