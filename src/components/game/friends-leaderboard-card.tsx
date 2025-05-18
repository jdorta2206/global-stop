
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable, type EnrichedPlayerScore } from './leaderboard-table'; // Use EnrichedPlayerScore
import { Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

interface FriendsLeaderboardCardProps {
  leaderboardData: EnrichedPlayerScore[]; // Use EnrichedPlayerScore
  className?: string;
  language: Language;
  currentUserId?: string | null;
  onChallenge?: (player: EnrichedPlayerScore) => void;
}

const TEXTS = {
  title: { es: "Puntuaciones de Amigos", en: "Friends Scores", fr: "Scores des Amis", pt: "Pontuações de Amigos" },
  description: { 
    es: "Compite con tus amigos y mira quién lidera.", 
    en: "Compete with your friends and see who's leading.", 
    fr: "Rivalisez avec vos amis et voyez qui mène.", 
    pt: "Compita com seus amigos e veja quem está liderando." 
  },
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  comingSoon: { 
    es: "¡Añade amigos desde el lobby o la tabla global!", 
    en: "Add friends from the lobby or global leaderboard!", 
    fr: "Ajoutez des amis depuis le salon ou le classement mondial !", 
    pt: "Adicione amigos do lobby ou do placar global!" 
  },
};


export function FriendsLeaderboardCard({ 
  leaderboardData, 
  className, 
  language,
  currentUserId,
  onChallenge
}: FriendsLeaderboardCardProps) {
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
            {/* El botón de añadir amigo globalmente está en la tabla global o en el lobby */}
        </div>
        <CardDescription className="mt-2">
          {translate('description')}
          <br />
          <span className="text-xs text-muted-foreground/80 font-semibold">{translate('comingSoon')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable 
          scores={leaderboardData} 
          language={language}
          currentUserId={currentUserId}
          onChallenge={onChallenge}
          isFriendsLeaderboard={true}
        />
      </CardContent>
    </Card>
  );
}
