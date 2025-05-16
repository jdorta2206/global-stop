
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable } from './leaderboard-table';
import type { PlayerScore } from '@/app/page';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FriendsLeaderboardCardProps {
  leaderboardData: PlayerScore[];
  className?: string;
}

export function FriendsLeaderboardCard({ leaderboardData, className }: FriendsLeaderboardCardProps) {
  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
         <div className="flex items-center space-x-3">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold text-primary">Puntuaciones de Amigos (Ejemplo)</CardTitle>
        </div>
        <CardDescription>
          Compite con tus amigos y mira quién lidera.
          <br />
          <span className="text-xs text-muted-foreground/80">(Funcionalidad de añadir amigos y puntuaciones reales de amigos es una futura mejora)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable scores={leaderboardData} />
      </CardContent>
    </Card>
  );
}
