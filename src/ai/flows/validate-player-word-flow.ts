'use server';

/**
 * Validador de palabras del jugador (Versión Gratuita)
 * - Usa diccionarios locales y reglas de validación
 * - No requiere APIs externas de pago
 */

import type { Language } from '@/contexts/language-context';

interface ValidatePlayerWordInput {
  letter: string;
  category: string;
  playerWord: string;
  language: Language;
}

interface ValidatePlayerWordOutput {
  isValid: boolean;
}

// Diccionario de palabras válidas por idioma
const WORD_DATABASE: Record<Language, Set<string>> = {
  es: new Set([
    'ardilla', 'ballena', 'camello', 'delfín', 'elefante',
    'argentina', 'brasil', 'colombia', 'dinamarca', 'españa',
    'azul', 'blanco', 'celeste', 'dorado', 'esmeralda'
  ]),
  en: new Set([
    'antelope', 'bear', 'cat', 'dog', 'elephant',
    'argentina', 'belgium', 'canada', 'denmark', 'england',
    'amber', 'blue', 'cyan', 'daffodil', 'emerald'
  ]),
  fr: new Set([
    'abeille', 'baleine', 'chat', 'dauphin', 'éléphant',
    'allemagne', 'belgique', 'canada', 'danemark', 'espagne',
    'argent', 'bleu', 'cyan', 'doré', 'émeraude'
  ]),
  pt: new Set([
    'abelha', 'baleia', 'cachorro', 'dromedário', 'elefante',
    'alemanha', 'brasil', 'canadá', 'dinamarca', 'espanha',
    'amarelo', 'branco', 'ciano', 'dourado', 'esmeralda'
  ])
};

// Palabras prohibidas (impropias, ofensivas, etc.)
const BANNED_WORDS: Record<Language, Set<string>> = {
  es: new Set(['palabra1', 'palabra2']),
  en: new Set(['word1', 'word2']),
  fr: new Set(['mot1', 'mot2']),
  pt: new Set(['palavra1', 'palavra2'])
};

export async function validatePlayerWord(
  input: ValidatePlayerWordInput
): Promise<ValidatePlayerWordOutput> {
  const { letter, playerWord, language } = input;
  const lowerWord = playerWord.toLowerCase().trim();
  const lowerLetter = letter.toLowerCase();

  // 1. Validación básica
  if (!lowerWord || lowerWord.length === 0) {
    return { isValid: false };
  }

  // 2. Comienza con la letra correcta
  if (!lowerWord.startsWith(lowerLetter)) {
    return { isValid: false };
  }

  // 3. Es una palabra prohibida
  if (BANNED_WORDS[language]?.has(lowerWord)) {
    return { isValid: false };
  }

  // 4. Existe en el diccionario
  if (WORD_DATABASE[language]?.has(lowerWord)) {
    return { isValid: true };
  }

  // 5. Reglas adicionales para palabras no incluidas
  return {
    isValid: validateWithRules(lowerWord, language)
  };
}

// Validación basada en reglas lingüísticas
function validateWithRules(word: string, language: Language): boolean {
  // Implementa reglas específicas por idioma
  const rules = {
    es: (w: string) => w.length > 2 && /^[a-záéíóúñ]+$/i.test(w),
    en: (w: string) => w.length > 2 && /^[a-z]+$/i.test(w),
    fr: (w: string) => w.length > 2 && /^[a-zàâçéèêëîïôûùüÿæœ]+$/i.test(w),
    pt: (w: string) => w.length > 2 && /^[a-záàâãéêíóôõúç]+$/i.test(w)
  };

  return rules[language]?.(word) || false;
}
