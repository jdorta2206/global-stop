"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Language } from '@/contexts/language-context';

// Solución temporal para framer-motion
const motion = {
  div: ({ children, className, initial, animate, exit }: any) => (
    <div className={className} style={{
      transform: `scale(${animate?.scale || 1}) rotate(${animate?.rotate || 0}deg)`,
      opacity: animate?.opacity || 1,
      transition: 'all 0.3s ease'
    }}>
      {children}
    </div>
  ),
  p: ({ children, className }: any) => <p className={className}>{children}</p>
};

const AnimatePresence = ({ children }: any) => <>{children}</>;

// Solución temporal para use-sound
const useSound = (soundPath: string) => {
  return [
    () => {
      console.log('Playing sound:', soundPath);
      // Implementación real usaría Audio API
    },
    { stop: () => console.log('Sound stopped') }
  ];
};

interface RouletteWheelProps {
  isSpinning: boolean;
  onSpinComplete: (letter: string) => void;
  alphabet: string[];
  language: Language;
}

const ROULETTE_TEXTS = {
  title: { 
    es: "¡Girando por una Letra!", 
    en: "Spinning for a Letter!", 
    fr: "Tournoiement pour une Lettre !", 
    pt: "Rodando por uma Letra!" 
  },
  description: { 
    es: "Prepárate...", 
    en: "Get ready...", 
    fr: "Préparez-vous...", 
    pt: "Prepare-se..." 
  },
  spinningStatus: { 
    es: "Girando...", 
    en: "Spinning...", 
    fr: "Tournoiement...", 
    pt: "Rodando..." 
  },
  ariaLabel: {
    es: "Ruleta de letras girando",
    en: "Spinning letter wheel",
    fr: "Roulette à lettres tournante",
    pt: "Roda de letras girando"
  }
};

export function RouletteWheel({ isSpinning, onSpinComplete, alphabet, language }: RouletteWheelProps) {
  const [displayLetter, setDisplayLetter] = useState<string>(alphabet[0] || 'A');
  const [isAnimating, setIsAnimating] = useState(false);
  const spinCountRef = useRef(0);
  const [playSpinSound, { stop: stopSpinSound }] = useSound('/music/the-ticking-of-the-mantel-clock.mp3');
  const [playStopSound] = useSound('/music/dry-cuckoo-sound.mp3');

  const translate = (textKey: keyof typeof ROULETTE_TEXTS) => {
    return ROULETTE_TEXTS[textKey][language] || ROULETTE_TEXTS[textKey]['en'];
  };

  useEffect(() => {
    if (isSpinning) {
      setIsAnimating(true);
      playSpinSound();
      const maxSpins = 25 + Math.floor(Math.random() * 15);
      spinCountRef.current = 0;

      const intervalId = setInterval(() => {
        setDisplayLetter(alphabet[Math.floor(Math.random() * alphabet.length)]);
        spinCountRef.current++;
        
        if (spinCountRef.current >= maxSpins) {
          clearInterval(intervalId);
          stopSpinSound();
          playStopSound();
          const finalLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
          setDisplayLetter(finalLetter);
          setTimeout(() => {
            setIsAnimating(false);
            onSpinComplete(finalLetter);
          }, 500);
        }
      }, 80);

      return () => {
        clearInterval(intervalId);
        stopSpinSound();
      };
    }
  }, [isSpinning, onSpinComplete, alphabet, playSpinSound, stopSpinSound, playStopSound]);

  return (
    <Card className="w-full max-w-md mx-auto text-center shadow-xl bg-card rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-primary">
          {translate('title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {translate('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        <div 
          className="relative my-4 p-8 bg-gradient-to-br from-secondary to-secondary/90 rounded-full w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mx-auto shadow-inner"
          aria-label={translate('ariaLabel')}
          aria-busy={isSpinning}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={displayLetter + (isAnimating ? 'spinning' : 'stopped')}
              initial={{ scale: 0.8, opacity: 0, rotate: isAnimating ? -180 : 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-6xl md:text-8xl font-extrabold text-primary-foreground tabular-nums">
                {displayLetter}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        {isSpinning && (
          <motion.p className="text-primary">
            {translate('spinningStatus')}
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}