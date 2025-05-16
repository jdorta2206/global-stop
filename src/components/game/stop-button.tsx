"use client";

import { Button } from '@/components/ui/button';
import { Hand } from 'lucide-react';

interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function StopButton({ onClick, disabled }: StopButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="default"
      size="lg"
      className="w-full md:w-auto text-xl font-bold px-10 py-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl rounded-lg
                 transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95
                 focus-visible:ring-4 focus-visible:ring-accent/50"
      aria-label="Stop the round"
    >
      <Hand className="mr-3 h-7 w-7" />
      STOP!
    </Button>
  );
}
