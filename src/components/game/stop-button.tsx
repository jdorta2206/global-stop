
"use client";

import { Button } from '@/components/ui/button';
import type { Language } from '@/contexts/language-context';

interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
  language: Language;
  label?: string; // Optional custom label for aria-description
}

const STOP_BUTTON_TEXTS = {
  // 'stop' key is used for aria-label if no specific label is provided
  stop: { es: "¡ALTO!", en: "STOP!", fr: "STOP !", pt: "PARE!" },
  ariaDefaultLabel: { es: "Detener la ronda o enviar respuestas", en: "Stop the round or submit answers", fr: "Arrêter la manche ou envoyer les réponses", pt: "Parar a rodada ou enviar respostas" },
};

export function StopButton({ onClick, disabled, language, label }: StopButtonProps) {
  const translate = (textKey: keyof typeof STOP_BUTTON_TEXTS) => {
    return STOP_BUTTON_TEXTS[textKey]?.[language] || STOP_BUTTON_TEXTS[textKey]['en'];
  }

  const visualText = "STOP";
  const accessibleLabel = label || translate('ariaDefaultLabel');

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="default" // Base variant, we override colors
      size="lg" // Base size, we override dimensions
      className="
        w-28 h-28 md:w-32 md:h-32 /* Fixed size for octagon */
        p-0 /* Remove default padding to control text placement within clip-path */
        bg-red-600 hover:bg-red-700 /* Stop sign red */
        text-white
        font-bold text-2xl md:text-3xl /* Prominent "STOP" text */
        shadow-xl
        transform transition-all duration-150 ease-in-out
        hover:scale-105 active:scale-95
        focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2
        flex items-center justify-center /* Center the text */
        relative
        rounded-none /* Ensure no rounded corners interfere with clip-path */
      "
      style={{
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      }}
      aria-label={accessibleLabel}
    >
      <span className="block leading-none">{visualText}</span>
    </Button>
  );
}
