
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable } from './leaderboard-table';
import type { PlayerScore } from '@/app/page';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';

interface FriendsLeaderboardCardProps {
  leaderboardData: PlayerScore[];
  className?: string;
  language: Language;
}

const TEXTS = {
  title: { es: "Puntuaciones de Amigos (Ejemplo)", en: "Friends Scores (Example)", fr: "Scores des Amis (Exemple)", pt: "Pontuações de Amigos (Exemplo)" },
  description: { 
    es: "Compite con tus amigos y mira quién lidera.", 
    en: "Compete with your friends and see who's leading.", 
    fr: "Rivalisez avec vos amis et voyez qui mène.", 
    pt: "Compita com seus amigos e veja quem está liderando." 
  },
  comingSoon: { 
    es: "(Funcionalidad de añadir amigos y puntuaciones reales de amigos es una futura mejora)", 
    en: "(Functionality to add friends and real friends' scores is a future improvement)", 
    fr: "(La fonctionnalité d'ajout d'amis et les scores réels des amis sont une amélioration future)", 
    pt: "(Funcionalidade de adicionar amigos e pontuações reais de amigos é uma melhoria futura)" 
  },
};


export function FriendsLeaderboardCard({ leaderboardData, className, language }: FriendsLeaderboardCardProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
         <div className="flex items-center space-x-3">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold text-primary">{translate('title')}</CardTitle>
        </div>
        <CardDescription>
          {translate('description')}
          <br />
          <span className="text-xs text-muted-foreground/80">{translate('comingSoon')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable scores={leaderboardData} language={language} />
      </CardContent>
    </Card>
  );
}
