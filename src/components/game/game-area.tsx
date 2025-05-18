
"use client";

import type { RoundResults } from '@/app/page'; 
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react'; 
import type { Language } from '@/contexts/language-context'; // Import Language type

interface GameAreaProps {
  letter: string | null;
  categories: string[];
  playerResponses: Record<string, string>; 
  onInputChange: (category: string, value: string) => void;
  isEvaluating: boolean;
  showResults: boolean;
  roundResults: RoundResults | null; 
  language: Language; // Add language prop
}

const GAME_AREA_TEXTS = {
  letterLabel: { es: "Letra:", en: "Letter:", fr: "Lettre :", pt: "Letra:" },
  instructions: { es: "Completa las categorías a continuación. ¡Buena suerte!", en: "Complete the categories below. Good luck!", fr: "Complétez les catégories ci-dessous. Bonne chance !", pt: "Complete as categorias abaixo. Boa sorte!" },
  evaluatingDescription: { es: "La IA está pensando y validando tus respuestas... Tus respuestas están bloqueadas.", en: "The AI is thinking and validating your answers... Your answers are locked.", fr: "L'IA réfléchit et valide vos réponses... Vos réponses sont verrouillées.", pt: "A IA está pensando e validando suas respostas... Suas respostas estão bloqueadas." },
  resultsDescription: { es: "¡Ronda terminada! Aquí están los resultados y puntuaciones por categoría.", en: "Round over! Here are the results and scores per category.", fr: "Manche terminée ! Voici les résultats et les scores par catégorie.", pt: "Rodada encerrada! Aqui estão os resultados e pontuações por categoria." },
  inputPlaceholder: { es: "Ej:", en: "Ex:", fr: "Ex :", pt: "Ex:" }, // Example: Ej: Categoría con Letra...
  youLabel: { es: "Tú:", en: "You:", fr: "Vous :", pt: "Você:" },
  aiLabel: { es: "IA:", en: "AI:", fr: "IA :", pt: "IA:" },
  noResponsePlayer: { es: "Sin respuesta", en: "No response", fr: "Pas de réponse", pt: "Sem resposta" },
  noResponseAI: { es: "Sin respuesta por IA", en: "No response by AI", fr: "Pas de réponse de l'IA", pt: "Sem resposta da IA" },
  pointsSuffix: { es: "pts", en: "pts", fr: "pts", pt: "pts" },
  errorFormat: { es: "(No empieza con la letra correcta)", en: "(Doesn't start with the correct letter)", fr: "(Ne commence pas par la bonne lettre)", pt: "(Não começa com a letra correta)" },
  errorInvalidWord: { es: "(Palabra no válida o mal escrita)", en: "(Invalid or misspelled word)", fr: "(Mot invalide ou mal orthographié)", pt: "(Palavra inválida ou mal escrita)" },
  errorApi: { es: "(Error al validar)", en: "(Error validating)", fr: "(Erreur de validation)", pt: "(Erro ao validar)" },
};

export function GameArea({ letter, categories, playerResponses, onInputChange, isEvaluating, showResults, roundResults, language }: GameAreaProps) {
  if (!letter) return null;

  const translate = (textKey: keyof typeof GAME_AREA_TEXTS, dynamicPart?: string) => {
    const baseText = GAME_AREA_TEXTS[textKey][language] || GAME_AREA_TEXTS[textKey]['en'];
    return dynamicPart ? `${baseText} ${dynamicPart}` : baseText;
  };

  const getInvalidReasonText = (reason: RoundResults[string]['playerResponseErrorReason']) => {
    if (reason === 'format') return translate('errorFormat');
    if (reason === 'invalid_word') return translate('errorInvalidWord');
    if (reason === 'api_error') return translate('errorApi');
    return "";
  };

  return (
    <Card className="w-full shadow-lg bg-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">
          <span className="text-muted-foreground">{translate('letterLabel')} </span> 
          <span className="text-accent tracking-wider">{letter}</span>
        </CardTitle>
        {!showResults && !isEvaluating && <CardDescription className="mt-1 text-md">{translate('instructions')}</CardDescription>}
         {isEvaluating && <CardDescription className="mt-1 text-md">{translate('evaluatingDescription')}</CardDescription>}
         {showResults && <CardDescription className="mt-1 text-md">{translate('resultsDescription')}</CardDescription>}
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
                placeholder={`${translate('inputPlaceholder')} ${category} ${language === 'es' ? 'con' : 'with'} ${letter}...`}
                disabled={isEvaluating || showResults}
                className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                aria-label={`${language === 'es' ? 'Entrada para la categoría' : 'Input for category'} ${category}`}
              />
              {showResults && roundResults && roundResults[category] && (
                <div className="mt-3 p-4 bg-secondary rounded-md shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-md flex-grow">
                      <span className="font-semibold text-primary">{translate('youLabel')} </span>
                      {roundResults[category].playerResponse || <span className="italic text-muted-foreground">{translate('noResponsePlayer')}</span>}
                      {roundResults[category].playerResponse && roundResults[category].playerResponseIsValid === false && (
                        <span className="ml-2 text-xs text-destructive inline-flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {getInvalidReasonText(roundResults[category].playerResponseErrorReason)}
                        </span>
                      )}
                    </p>
                    <Badge 
                      variant={roundResults[category].playerScore > 0 ? (roundResults[category].playerScore === 50 ? "secondary" : "default") : "outline"} 
                      className="text-sm ml-2 shrink-0"
                    >
                      {roundResults[category].playerScore} {translate('pointsSuffix')}
                    </Badge>
                  </div>
                  <Separator className="my-1 bg-border" />
                  <div className="flex justify-between items-center">
                    <p className="text-md flex-grow">
                      <span className="font-semibold text-accent-foreground">{translate('aiLabel')} </span>
                      {roundResults[category].aiResponse || <span className="italic text-muted-foreground">{translate('noResponseAI')}</span>}
                    </p>
                     <Badge 
                       variant={roundResults[category].aiScore > 0 ? (roundResults[category].aiScore === 50 ? "secondary" : "default") : "outline"} 
                       className="text-sm ml-2 shrink-0"
                     >
                      {roundResults[category].aiScore} {translate('pointsSuffix')}
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
