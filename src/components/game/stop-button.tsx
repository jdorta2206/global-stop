
"use client";

import * as React from 'react';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

// If this file continues to cause a "Unexpected token Button" parsing error
// after applying this change, PLEASE try the following:
// 1. Manually DELETE this file (stop-button.tsx) from your project.
// 2. CREATE a NEW file with the same name in the same location.
// 3. PASTE this exact code into the new file.
// 4. Stop your dev server, run "rm -rf .next" in your terminal, then restart your dev server.
// This often resolves persistent parsing issues caused by hidden characters or cache problems.

const internalStopButtonTexts: Record<Language, { ariaDefaultLabel: string }> = {
  es: { ariaDefaultLabel: "Detener la ronda" },
  en: { ariaDefaultLabel: "Stop the round" },
  fr: { ariaDefaultLabel: "Arrêter la manche" },
  pt: { ariaDefaultLabel: "Parar a rodada" },
};

interface StopButtonProps {
  onClick: () => void;
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
  const translateText = (key: keyof typeof internalStopButtonTexts[Language]) => {
    const langTexts = internalStopButtonTexts[language] || internalStopButtonTexts['en'];
    return langTexts?.[key] || String(key);
  }
  const accessibleLabel = label || translateText('ariaDefaultLabel');

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
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
      <span className="block leading-none">STOP</span>
    </Button>
  );
}
