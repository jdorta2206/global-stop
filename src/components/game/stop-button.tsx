"use client";

import { Button } from '@/components/ui/button';
import { Hand } from 'lucide-react';
import type { Language } from '@/contexts/language-context'; // Import Language type

interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
  language: Language;
  label?: string; // Optional custom label
}

const STOP_BUTTON_TEXTS = {
  stop: { es: "¡ALTO!", en: "STOP!", fr: "STOP !", pt: "PARE!" },
  ariaLabel: { es: "Detener la ronda o enviar respuestas", en: "Stop the round or submit answers", fr: "Arrêter la manche ou envoyer les réponses", pt: "Parar a rodada ou enviar respostas" },
};

export function StopButton({ onClick, disabled, language, label }: StopButtonProps) {
  const translate = (textKey: keyof typeof STOP_BUTTON_TEXTS) => {
    return STOP_BUTTON_TEXTS[textKey][language] || STOP_BUTTON_TEXTS[textKey]['en'];
  }
  
  const buttonLabel = label || translate('stop');

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="default"
      size="lg"
      className="w-full md:w-auto text-xl font-bold px-10 py-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl rounded-lg
                 transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                 focus-visible:ring-4 focus-visible:ring-accent/50"
      aria-label={translate('ariaLabel')}
    >
      <Hand className="mr-3 h-7 w-7" />
      {buttonLabel}
    </Button>
  );
}
