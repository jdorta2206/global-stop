"use client";

import * as React from 'react';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

const internalStopButtonTexts: Record<Language, { ariaDefaultLabel: string }> = {
  es: { ariaDefaultLabel: "Detener la ronda" },
  en: { ariaDefaultLabel: "Stop the round" },
  fr: { ariaDefaultLabel: "Arrêter la manche" },
  pt: { ariaDefaultLabel: "Parar a rodada" },
};

interface StopButtonProps {
  onClick: () => void | Promise<void>;  // Soporta async para Supabase
  disabled?: boolean;
  language: Language;
  label?: string; 
}

export const StopButton: React.FC<StopButtonProps> = ({ 
  onClick, 
  disabled, 
  language, 
  label 
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (typeof onClick === 'function') {
      setIsLoading(true);
      try {
        await onClick();  // Funciona con operaciones de Supabase
      } finally {
        setIsLoading(false);
      }
    }
  };

  const translateText = (key: keyof typeof internalStopButtonTexts[Language]) => {
    const langTexts = internalStopButtonTexts[language] || internalStopButtonTexts['en'];
    return langTexts?.[key] || String(key);
  };

  const accessibleLabel = label || translateText('ariaDefaultLabel');

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant="default"
      size="lg"
      className="
        w-28 h-28 md:w-32 md:h-32
        p-0
        bg-red-600 hover:bg-red-700
        text-white
        font-bold text-2xl md:text-3xl
        shadow-xl
        transform transition-all duration-150 ease-in-out
        hover:scale-105 active:scale-95
        focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2
        flex items-center justify-center
        relative
        rounded-none
      "
      style={{
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      }}
      aria-label={accessibleLabel}
    >
      <span className="block leading-none">
        {isLoading ? "..." : "STOP"}
      </span>
    </Button>
  );
};
