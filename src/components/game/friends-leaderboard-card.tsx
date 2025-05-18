
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable } from './leaderboard-table';
import type { PlayerScore } from '@/app/page';
import { Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

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
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  comingSoon: { 
    es: "Próximamente: ¡Conéctate con amigos y compite en tiempo real!", 
    en: "Coming Soon: Connect with friends and compete in real-time!", 
    fr: "Bientôt disponible : Connectez-vous avec des amis et concourez en temps réel !", 
    pt: "Em Breve: Conecte-se com amigos e compita em tempo real!" 
  },
};


export function FriendsLeaderboardCard({ leaderboardData, className, language }: FriendsLeaderboardCardProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Users className="h-7 w-7 text-primary" />
                <CardTitle className="text-2xl font-semibold text-primary">{translate('title')}</CardTitle>
            </div>
            <Button variant="outline" size="sm" disabled className="whitespace-nowrap">
                <UserPlus className="mr-2 h-4 w-4" />
                {translate('addFriendButton')}
            </Button>
        </div>
        <CardDescription className="mt-2">
          {translate('description')}
          <br />
          <span className="text-xs text-muted-foreground/80 font-semibold">{translate('comingSoon')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable scores={leaderboardData} language={language} />
      </CardContent>
    </Card>
  );
}

