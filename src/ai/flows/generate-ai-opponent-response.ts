'use server';

import type { Language } from '@/contexts/language-context';

interface AiOpponentResponseInput {
  letter: string;
  category: string;
  language: Language;
}

interface AiOpponentResponseOutput {
  response: string;
}

// Diccionario completo con todas las lenguas y categorías básicas
const WORD_DATABASE: Record<Language, Record<string, string[]>> = {
  es: {
    animales: ['ardilla', 'ballena', 'camello', 'delfín', 'elefante'],
    países: ['argentina', 'brasil', 'colombia', 'dinamarca', 'españa'],
    colores: ['amarillo', 'blanco', 'celeste', 'dorado', 'esmeralda'],
    nombres: ['ana', 'berto', 'carla', 'david', 'elena'],
    frutas: ['arándano', 'banana', 'cereza', 'durazno', 'frambuesa']
  },
  en: {
    animals: ['antelope', 'bear', 'cat', 'dog', 'elephant'],
    countries: ['argentina', 'belgium', 'canada', 'denmark', 'england'],
    colors: ['amber', 'blue', 'cyan', 'daffodil', 'emerald'],
    names: ['alice', 'bob', 'charlie', 'david', 'emma'],
    fruits: ['apple', 'banana', 'cherry', 'date', 'elderberry']
  },
  fr: {
    animaux: ['abeille', 'baleine', 'chat', 'dauphin', 'éléphant'],
    pays: ['allemagne', 'belgique', 'canada', 'danemark', 'espagne'],
    couleurs: ['argent', 'bleu', 'cyan', 'doré', 'émeraude'],
    prénoms: ['anne', 'bernard', 'claire', 'david', 'émilie'],
    fruits: ['abricot', 'banane', 'cerise', 'datte', 'figue']
  },
  pt: {
    animais: ['abelha', 'baleia', 'cachorro', 'dromedário', 'elefante'],
    países: ['alemanha', 'brasil', 'canadá', 'dinamarca', 'espanha'],
    cores: ['amarelo', 'branco', 'ciano', 'dourado', 'esmeralda'],
    nomes: ['ana', 'bruno', 'carla', 'daniel', 'elena'],
    frutas: ['abacaxi', 'banana', 'cereja', 'damasco', 'figo']
  }
};

export async function generateAiOpponentResponse(
  input: AiOpponentResponseInput
): Promise<AiOpponentResponseOutput> {
  try {
    const { letter, category, language } = input;
    const lowerLetter = letter.toLowerCase();
    const normalizedCategory = normalizeCategory(category, language);

    // 1. Buscar en diccionario local
    const categoryWords = WORD_DATABASE[language]?.[normalizedCategory] || [];
    const validWords = categoryWords.filter(word => 
      word.toLowerCase().startsWith(lowerLetter)
    );

    if (validWords.length > 0) {
      return { 
        response: validWords[Math.floor(Math.random() * validWords.length)] 
      };
    }

    // 2. Fallback generativo mejorado
    return { 
      response: generateFallbackWord(lowerLetter, normalizedCategory, language) 
    };
  } catch (error) {
    console.error('Error en IA:', error);
    return { response: "" };
  }
}

// Normaliza categorías entre idiomas
function normalizeCategory(category: string, language: Language): string {
  const categoryMap: Record<string, Record<Language, string>> = {
    animal: { es: 'animales', en: 'animals', fr: 'animaux', pt: 'animais' },
    país: { es: 'países', en: 'countries', fr: 'pays', pt: 'países' },
    color: { es: 'colores', en: 'colors', fr: 'couleurs', pt: 'cores' }
  };

  return categoryMap[category.toLowerCase()]?.[language] || category.toLowerCase();
}

// Generador de palabras de respaldo mejorado
function generateFallbackWord(letter: string, category: string, language: Language): string {
  const fallbackPatterns: Record<Language, Record<string, string[]>> = {
    es: {
      animales: ['a', 'e', 'i', 'o', 'u'].map(v => letter + 'r' + v + 'co'),
      países: ['a', 'e', 'i', 'o', 'u'].map(v => letter + v + 'landia')
    },
    en: {
      animals: ['a', 'e', 'i', 'o', 'u'].map(v => letter + 'r' + v + 'ph'),
      countries: ['a', 'e', 'i', 'o', 'u'].map(v => letter + v + 'land')
    },
    fr: {
      animaux: ['a', 'e', 'i', 'o', 'u'].map(v => letter + 'r' + v + 'que'),
      pays: ['a', 'e', 'i', 'o', 'u'].map(v => letter + v + 'sie')
    },
    pt: {
      animais: ['a', 'e', 'i', 'o', 'u'].map(v => letter + 'r' + v + 'ca'),
      países: ['a', 'e', 'i', 'o', 'u'].map(v => letter + v + 'lândia')
    }
  };

  const patterns = fallbackPatterns[language]?.[category] || [letter + 'a', letter + 'e', letter + 'i'];
  return patterns[Math.floor(Math.random() * patterns.length)];
}