"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { Language } from '@/contexts/language-context';

interface GameAreaProps {
  letter: string | null;
  categories: string[];
  playerResponses: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  isEvaluating: boolean;
  showResults: boolean;
  roundResults: RoundResults | null;
  language: Language;
  gameMode: "solo" | "room";
  isHost?: boolean;
  localPlayerSubmitted?: boolean;
  currentUserId?: string | null;
}

interface RoundResults {
  [category: string]: {
    playerScore: number;
    aiScore: number;
    playerResponse: string;
    aiResponse: string;
    playerResponseIsValid?: boolean;
    playerResponseErrorReason?: 'format' | 'invalid_word' | 'api_error' | null;
  };
}

const GAME_AREA_TEXTS = {
  errorFormat: {
    en: "Invalid format",
    es: "Formato inválido"
  },
  errorInvalidWord: {
    en: "Invalid word",
    es: "Palabra inválida"
  },
  errorApi: {
    en: "Verification error",
    es: "Error de verificación"
  },
  evaluatingRoomDescription: {
    en: "Evaluating responses...",
    es: "Evaluando respuestas..."
  },
  resultsRoomDescription: {
    en: "Round results",
    es: "Resultados de la ronda"
  },
  waitingForHost: {
    en: "Waiting for host to start next round",
    es: "Esperando a que el host inicie la siguiente ronda"
  },
  instructionsRoom: {
    en: "Fill in the fields and wait for all players",
    es: "Rellena los campos y espera a todos los jugadores"
  },
  evaluatingDescription: {
    en: "Evaluating your responses...",
    es: "Evaluando tus respuestas..."
  },
  resultsDescription: {
    en: "Here are the results of this round",
    es: "Aquí están los resultados de esta ronda"
  },
  instructions: {
    en: "Fill in all the fields with words that start with the letter",
    es: "Rellena todos los campos con palabras que empiecen por la letra"
  },
  letterLabel: {
    en: "Letter:",
    es: "Letra:"
  },
  inputPlaceholder: {
    en: "Enter",
    es: "Escribe"
  },
  youLabel: {
    en: "You:",
    es: "Tú:"
  },
  noResponsePlayer: {
    en: "No response",
    es: "Sin respuesta"
  },
  pointsSuffix: {
    en: "pts",
    es: "pts"
  },
  aiLabel: {
    en: "AI:",
    es: "IA:"
  },
  noResponseAI: {
    en: "No response",
    es: "Sin respuesta"
  }
};

export function GameArea({
  letter,
  categories,
  playerResponses,
  onInputChange,
  isEvaluating,
  showResults,
  roundResults,
  language,
  gameMode,
  isHost,
  localPlayerSubmitted,
  currentUserId,
}: GameAreaProps) {
  if (!letter) return null;

  const translate = (textKey: keyof typeof GAME_AREA_TEXTS, dynamicPart?: string) => {
    const translationObj = GAME_AREA_TEXTS[textKey];
    const baseText = (translationObj as any)[language] || translationObj['en'];
    return dynamicPart ? `${baseText} ${dynamicPart}` : baseText;
  };

  const getInvalidReasonText = (reason: RoundResults[string]['playerResponseErrorReason']) => {
    if (reason === 'format') return translate('errorFormat');
    if (reason === 'invalid_word') return translate('errorInvalidWord');
    if (reason === 'api_error') return translate('errorApi');
    return "";
  };

  const getCardDescription = () => {
    if (gameMode === "room") {
      if (isEvaluating) return translate('evaluatingRoomDescription');
      if (showResults) return translate('resultsRoomDescription');
      if (localPlayerSubmitted) return translate('waitingForHost');
      return translate('instructionsRoom');
    }
    if (isEvaluating) return translate('evaluatingDescription');
    if (showResults) return translate('resultsDescription');
    return translate('instructions');
  };

  const allowInput = gameMode === "solo" || (gameMode === "room" && !localPlayerSubmitted && !showResults && !isEvaluating);

  return (
    <Card className="w-full shadow-lg bg-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">
          <span className="text-muted-foreground">{translate('letterLabel')} </span>
          <span className="text-accent tracking-wider">{letter}</span>
        </CardTitle>
        <CardDescription className="mt-1 text-md">{getCardDescription()}</CardDescription>
      </CardHeader>

      {allowInput && (
        <CardContent className="space-y-6 p-6">
          {categories.map((category, index) => (
            <div key={category}>
              <div className="space-y-2">
                <label htmlFor={`${category}-${gameMode}`} className="text-xl font-semibold text-primary">
                  {category}
                </label>
                <Input
                  id={`${category}-${gameMode}`}
                  value={playerResponses[category] || ''}
                  onChange={(e) => onInputChange(category, e.target.value)}
                  placeholder={`${translate('inputPlaceholder')} ${category} ${language === 'es' ? 'con' : 'with'} ${letter}...`}
                  disabled={isEvaluating || showResults || (gameMode === "room" && localPlayerSubmitted)}
                  className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                  aria-label={`${language === 'es' ? 'Entrada para la categoría' : 'Input for category'} ${category}`}
                />
                {gameMode === "solo" && showResults && roundResults?.[category] && (
                  <div className="mt-3 p-4 bg-secondary rounded-md shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-md flex-grow">
                        <span className="font-semibold text-primary">{translate('youLabel')} </span>
                        {roundResults[category].playerResponse || (
                          <span className="italic text-muted-foreground">{translate('noResponsePlayer')}</span>
                        )}
                        {roundResults[category].playerResponse && roundResults[category].playerResponseIsValid === false && (
                          <span className="ml-2 text-xs text-destructive inline-flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {getInvalidReasonText(roundResults[category].playerResponseErrorReason)}
                          </span>
                        )}
                      </p>
                      <Badge
                        variant={roundResults[category].playerScore > 0 ? 
                          (roundResults[category].playerScore === 50 ? "secondary" : "default") : "outline"}
                        className="text-sm ml-2 shrink-0"
                      >
                        {roundResults[category].playerScore} {translate('pointsSuffix')}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <p className="text-md flex-grow">
                        <span className="font-semibold text-accent-foreground">{translate('aiLabel')} </span>
                        {roundResults[category].aiResponse || (
                          <span className="italic text-muted-foreground">{translate('noResponseAI')}</span>
                        )}
                      </p>
                      <Badge
                        variant={roundResults[category].aiScore > 0 ? 
                          (roundResults[category].aiScore === 50 ? "secondary" : "default") : "outline"}
                        className="text-sm ml-2 shrink-0"
                      >
                        {roundResults[category].aiScore} {translate('pointsSuffix')}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              {index < categories.length - 1 && <div className="border-t my-6" />}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}