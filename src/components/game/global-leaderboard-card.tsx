
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable, type EnrichedPlayerScore } from './leaderboard-table';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';

interface GlobalLeaderboardCardProps {
  leaderboardData: EnrichedPlayerScore[];
  className?: string;
  language: Language;
  currentUserId?: string | null;
  onAddFriend?: (player: EnrichedPlayerScore) => void;
  onChallenge?: (player: EnrichedPlayerScore) => void;
}

const TEXTS = {
  title: { es: "Puntuaciones Globales (Ejemplo)", en: "Global Scores (Example)", fr: "Scores Mondiaux (Exemple)", pt: "Pontuações Globais (Exemplo)" },
  description: { 
    es: "Así se vería una tabla de clasificación global. ¡Imagina tu nombre aquí!", 
    en: "This is how a global leaderboard would look. Imagine your name here!", 
    fr: "Voici à quoi ressemblerait un classement mondial. Imaginez votre nom ici !", 
    pt: "É assim que seria um placar global. Imagine seu nome aqui!" 
  },
  comingSoon: { 
    es: "(Funcionalidad completa con base de datos es una futura mejora)", 
    en: "(Full functionality with database is a future improvement)", 
    fr: "(La fonctionnalité complète avec base de données est une amélioration future)", 
    pt: "(Funcionalidade completa com banco de dados é uma melhoria futura)" 
  },
};

export function GlobalLeaderboardCard({ 
  leaderboardData, 
  className, 
  language,
  currentUserId,
  onAddFriend,
  onChallenge 
}: GlobalLeaderboardCardProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-7 w-7 text-accent" />
          <CardTitle className="text-2xl font-semibold text-accent">{translate('title')}</CardTitle>
        </div>
        <CardDescription>
          {translate('description')}
          <br />
          <span className="text-xs text-muted-foreground/80">{translate('comingSoon')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable 
          scores={leaderboardData} 
          language={language}
          currentUserId={currentUserId}
          onAddFriend={onAddFriend}
          onChallenge={onChallenge}
        />
      </CardContent>
    </Card>
  );
}
