
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable } from './leaderboard-table';
import type { PlayerScore } from '@/app/page';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalLeaderboardCardProps {
  leaderboardData: PlayerScore[];
  className?: string;
}

export function GlobalLeaderboardCard({ leaderboardData, className }: GlobalLeaderboardCardProps) {
  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-7 w-7 text-accent" />
          <CardTitle className="text-2xl font-semibold text-accent">Puntuaciones Globales (Ejemplo)</CardTitle>
        </div>
        <CardDescription>
          Así se vería una tabla de clasificación global. ¡Imagina tu nombre aquí!
          <br />
          <span className="text-xs text-muted-foreground/80">(Funcionalidad completa con base de datos es una futura mejora)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable scores={leaderboardData} />
      </CardContent>
    </Card>
  );
}
