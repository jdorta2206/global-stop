"use client";

import type { RoundResults } from '@/app/page';
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
  isEvaluating: boolean; // True if AI is thinking (solo) or host is evaluating (room)
  showResults: boolean; // True if showing results (solo or shared room results)
  roundResults: RoundResults | null; // For solo mode results
  language: Language;
  gameMode: "solo" | "room";
  isHost?: boolean; // For room mode, if current user is host
  localPlayerSubmitted?: boolean; // For room mode, if current player has submitted their answers
  // Props for shared room results (optional, only used when gameMode="room" and showResults=true)
  sharedRoundEvaluation?: any | null; // Replace 'any' with a proper type for RoundEvaluationData
  connectedPlayers?: any[]; // Replace 'any' with PlayerInRoom type
  currentUserId?: string | null;
}

const GAME_AREA_TEXTS = {
  letterLabel: { es: "Letra:", en: "Letter:", fr: "Lettre :", pt: "Letra:" },
  instructions: { es: "Completa las categorías. ¡Suerte!", en: "Complete the categories. Good luck!", fr: "Complétez les catégories. Bonne chance !", pt: "Complete as categorias. Boa sorte!" },
  instructionsRoom: { es: "Completa y envía tus respuestas. ¡El anfitrión evaluará!", en: "Fill in and submit your answers. The host will evaluate!", fr: "Remplissez et envoyez vos réponses. L'hôte évaluera !", pt: "Preencha e envie suas respostas. O anfitrião avaliará!" },
  evaluatingDescription: { es: "La IA está pensando y validando tus respuestas... Tus respuestas están bloqueadas.", en: "The AI is thinking and validating your answers... Your answers are locked.", fr: "L'IA réfléchit et valide vos réponses... Vos réponses sont verrouillées.", pt: "A IA está pensando e validando suas respostas... Suas respostas estão bloqueadas." },
  evaluatingRoomDescription: { es: "El anfitrión está evaluando todas las respuestas...", en: "Host is evaluating all answers...", fr: "L'hôte évalue toutes les réponses...", pt: "O anfitrião está avaliando todas as respostas..." },
  resultsDescription: { es: "¡Ronda terminada! Aquí están los resultados y puntuaciones por categoría.", en: "Round over! Here are the results and scores per category.", fr: "Manche terminée ! Voici les résultats et les scores par catégorie.", pt: "Rodada encerrada! Aqui estão os resultados e pontuações por categoria." },
  resultsRoomDescription: { es: "Resultados de la ronda para todos los jugadores.", en: "Round results for all players.", fr: "Résultats de la manche pour tous les joueurs.", pt: "Resultados da rodada para todos os jogadores." },
  inputPlaceholder: { es: "Ej:", en: "Ex:", fr: "Ex :", pt: "Ex:" },
  youLabel: { es: "Tú:", en: "You:", fr: "Vous :", pt: "Você:" },
  aiLabel: { es: "IA:", en: "AI:", fr: "IA :", pt: "IA:" },
  noResponsePlayer: { es: "Sin respuesta", en: "No response", fr: "Pas de réponse", pt: "Sem resposta" },
  noResponseAI: { es: "Sin respuesta por IA", en: "No response by AI", fr: "Pas de réponse de l'IA", pt: "Sem resposta da IA" },
  pointsSuffix: { es: "pts", en: "pts", fr: "pts", pt: "pts" },
  errorFormat: { es: "(No empieza con la letra correcta)", en: "(Doesn't start with the correct letter)", fr: "(Ne commence pas par la bonne lettre)", pt: "(Não começa com a letra correta)" },
  errorInvalidWord: { es: "(Palabra no válida o mal escrita)", en: "(Invalid or misspelled word)", fr: "(Mot invalide ou mal orthographié)", pt: "(Palavra inválida ou mal escrita)" },
  errorApi: { es: "(Error al validar)", en: "Error validating", fr: "Erreur de validation", pt: "Erro ao validar" },
  waitingForHost: { es: "Respuestas enviadas. Esperando al anfitrión...", en: "Answers submitted. Waiting for host...", fr: "Réponses envoyées. En attente de l'hôte...", pt: "Respostas enviadas. Esperando o anfitrião..."},
  playerLabel: { es: "Jugador:", en: "Player:", fr: "Joueur :", pt: "Jogador:"},
};

export function GameArea({
  letter,
  categories,
  playerResponses,
  onInputChange,
  isEvaluating,
  showResults,
  roundResults, // For solo mode
  language,
  gameMode,
  isHost,
  localPlayerSubmitted,
  sharedRoundEvaluation, // For room mode results
  connectedPlayers,      // For room mode results
  currentUserId,         // For room mode results
}: GameAreaProps) {
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

  const getCardDescription = () => {
    if (gameMode === "room") {
      if (isEvaluating) return translate('evaluatingRoomDescription');
      if (showResults) return translate('resultsRoomDescription');
      if (localPlayerSubmitted) return translate('waitingForHost');
      return translate('instructionsRoom');
    }
    // Solo mode
    if (isEvaluating) return translate('evaluatingDescription');
    if (showResults) return translate('resultsDescription');
    return translate('instructions');
  };

  // In room mode, if results are shown, we don't show the input fields.
  // Instead, results will be displayed by the parent RoomPage component.
  // This GameArea is primarily for input in room mode, or input+results in solo mode.
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
                <Label htmlFor={`${category}-${gameMode}`} className="text-xl font-semibold text-primary">{category}</Label>
                <Input
                  id={`${category}-${gameMode}`}
                  value={playerResponses[category] || ''}
                  onChange={(e) => onInputChange(category, e.target.value)}
                  placeholder={`${translate('inputPlaceholder')} ${category} ${language === 'es' ? 'con' : 'with'} ${letter}...`}
                  disabled={isEvaluating || showResults || (gameMode === "room" && localPlayerSubmitted)}
                  className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                  aria-label={`${language === 'es' ? 'Entrada para la categoría' : 'Input for category'} ${category}`}
                />
                {gameMode === "solo" && showResults && roundResults && roundResults[category] && (
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
      )}
      {/* Note: Shared results display logic will be handled by RoomPage directly */}
    </Card>
  );
}
