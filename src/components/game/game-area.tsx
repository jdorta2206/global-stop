"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GameAreaProps {
  letter: string | null;
  categories: string[];
  playerResponses: Record<string, string>;
  aiResponses: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  isEvaluating: boolean;
  showResults: boolean;
}

export function GameArea({ letter, categories, playerResponses, aiResponses, onInputChange, isEvaluating, showResults }: GameAreaProps) {
  if (!letter) return null;

  return (
    <Card className="w-full shadow-lg bg-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">
          <span className="text-muted-foreground">Letter: </span> 
          <span className="text-accent tracking-wider">{letter}</span>
        </CardTitle>
        {!showResults && !isEvaluating && <CardDescription className="mt-1 text-md">Fill in the categories below. Good luck!</CardDescription>}
         {isEvaluating && <CardDescription className="mt-1 text-md">AI is thinking... Your answers are locked.</CardDescription>}
         {showResults && <CardDescription className="mt-1 text-md">Round over! Here are the results.</CardDescription>}
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
                placeholder={`A ${category.toLowerCase()} with "${letter}"`}
                disabled={isEvaluating || showResults}
                className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                aria-label={`Input for category ${category}`}
              />
              {showResults && (
                <div className="mt-3 p-4 bg-secondary rounded-md shadow-sm space-y-1">
                  <p className="text-md">
                    <span className="font-semibold text-primary">You: </span>
                    {playerResponses[category] || <span className="italic text-muted-foreground">No answer</span>}
                  </p>
                  <Separator className="my-1 bg-border" />
                  <p className="text-md">
                    <span className="font-semibold text-accent-foreground">AI: </span>
                    {aiResponses[category] || <span className="italic text-muted-foreground">No answer</span>}
                  </p>
                </div>
              )}
            </div>
            {index < categories.length -1 && !showResults && <Separator className="my-6"/>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
