
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalHighScoreCardProps {
  highScore: number;
  className?: string;
}

export function PersonalHighScoreCard({ highScore, className }: PersonalHighScoreCardProps) {
  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">
          Tu Puntuación Más Alta
        </CardTitle>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          {highScore.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ¡Sigue jugando para superarla!
        </p>
      </CardContent>
    </Card>
  );
}
