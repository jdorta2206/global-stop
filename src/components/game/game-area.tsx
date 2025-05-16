"use client";

import type { RoundResults } from '@/app/page'; // Import the type
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface GameAreaProps {
  letter: string | null;
  categories: string[];
  playerResponses: Record<string, string>; // Still needed for input binding before results
  onInputChange: (category: string, value: string) => void;
  isEvaluating: boolean;
  showResults: boolean;
  roundResults: RoundResults | null; // Added to display scores
}

export function GameArea({ letter, categories, playerResponses, onInputChange, isEvaluating, showResults, roundResults }: GameAreaProps) {
  if (!letter) return null;

  return (
    <Card className="w-full shadow-lg bg-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">
          <span className="text-muted-foreground">Letra: </span> 
          <span className="text-accent tracking-wider">{letter}</span>
        </CardTitle>
        {!showResults && !isEvaluating && <CardDescription className="mt-1 text-md">Completa las categorías a continuación. ¡Buena suerte!</CardDescription>}
         {isEvaluating && <CardDescription className="mt-1 text-md">La IA está pensando... Tus respuestas están bloqueadas.</CardDescription>}
         {showResults && <CardDescription className="mt-1 text-md">¡Ronda terminada! Aquí están los resultados y puntuaciones por categoría.</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {categories.map((category, index) => (
          <div key={category}>
            <div className="space-y-2">
              <Label htmlFor={category} className="text-xl font-semibold text-primary">{category}</Label>
              <Input
                id={category}
                value={playerResponses[category] || ''}
                onChange={(e) => onInputChange(category, e.target.value)}
                placeholder={`Ej: ${category} con ${letter}...`}
                disabled={isEvaluating || showResults}
                className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                aria-label={`Entrada para la categoría ${category}`}
              />
              {showResults && roundResults && roundResults[category] && (
                <div className="mt-3 p-4 bg-secondary rounded-md shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-md flex-grow">
                      <span className="font-semibold text-primary">Tú: </span>
                      {roundResults[category].playerResponse || <span className="italic text-muted-foreground">Sin respuesta</span>}
                    </p>
                    <Badge 
                      variant={roundResults[category].playerScore > 0 ? (roundResults[category].playerScore === 50 ? "secondary" : "default") : "outline"} 
                      className="text-sm ml-2 shrink-0"
                    >
                      {roundResults[category].playerScore} pts
                    </Badge>
                  </div>
                  <Separator className="my-1 bg-border" />
                  <div className="flex justify-between items-center">
                    <p className="text-md flex-grow">
                      <span className="font-semibold text-accent-foreground">IA: </span>
                      {roundResults[category].aiResponse || <span className="italic text-muted-foreground">Sin respuesta por IA</span>}
                    </p>
                     <Badge 
                       variant={roundResults[category].aiScore > 0 ? (roundResults[category].aiScore === 50 ? "secondary" : "default") : "outline"} 
                       className="text-sm ml-2 shrink-0"
                     >
                      {roundResults[category].aiScore} pts
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            {index < categories.length -1 && <Separator className="my-6"/>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
