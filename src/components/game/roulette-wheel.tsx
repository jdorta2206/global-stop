
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Language } from '@/contexts/language-context'; // Import Language type

interface RouletteWheelProps {
  isSpinning: boolean;
  onSpinComplete: (letter: string) => void;
  alphabet: string[];
  language: Language; // Add language prop
}

const ROULETTE_TEXTS = {
  title: { es: "¡Girando por una Letra!", en: "Spinning for a Letter!", fr: "Tournoiement pour une Lettre !", pt: "Rodando por uma Letra!" },
  description: { es: "Prepárate...", en: "Get ready...", fr: "Préparez-vous...", pt: "Prepare-se..." },
  spinningStatus: { es: "Girando...", en: "Spinning...", fr: "Tournoiement...", pt: "Rodando..." },
};

export function RouletteWheel({ isSpinning, onSpinComplete, alphabet, language }: RouletteWheelProps) {
  const [displayLetter, setDisplayLetter] = useState<string>(alphabet[0] || 'A');

  const translate = (textKey: keyof typeof ROULETTE_TEXTS) => {
    return ROULETTE_TEXTS[textKey][language] || ROULETTE_TEXTS[textKey]['en'];
  }

  useEffect(() => {
    if (isSpinning) {
      let spinCount = 0;
      const maxSpins = 25 + Math.floor(Math.random() * 15);
      const intervalId = setInterval(() => {
        setDisplayLetter(alphabet[Math.floor(Math.random() * alphabet.length)]);
        spinCount++;
        if (spinCount >= maxSpins) {
          clearInterval(intervalId);
          const finalLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
          setDisplayLetter(finalLetter); 
          onSpinComplete(finalLetter);
        }
      }, 80); 
      return () => clearInterval(intervalId);
    }
  }, [isSpinning, onSpinComplete, alphabet]);

  return (
    <Card className="w-full max-w-md mx-auto text-center shadow-xl bg-card rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-primary">{translate('title')}</CardTitle>
        <CardDescription className="text-muted-foreground">{translate('description')}</CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        <div 
          className="my-4 p-8 bg-secondary rounded-full w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mx-auto shadow-inner transition-all duration-300 ease-out"
          style={{ transform: isSpinning ? 'scale(1.05)' : 'scale(1)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-6xl md:text-8xl font-extrabold text-primary-foreground tabular-nums tracking-tighter">
            {displayLetter}
          </span>
        </div>
         {isSpinning && <p className="text-primary animate-pulse">{translate('spinningStatus')}</p>}
      </CardContent>
    </Card>
  );
}
