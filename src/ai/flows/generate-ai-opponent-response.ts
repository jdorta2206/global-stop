'use server';

/**
 * Generador de respuestas para un oponente IA en el juego Global Stop (Versión Gratuita)
 * - Usa un diccionario local para respuestas predefinidas
 * - Alternativa con TensorFlow.js para modelo simple
 */

import type { Language } from '@/contexts/language-context';

// Tipos de entrada/salida
interface AiOpponentResponseInput {
  letter: string;
  category: string;
  language: Language;
}

interface AiOpponentResponseOutput {
  response: string;
}

// Diccionario local de palabras por categoría e idioma
const WORD_DATABASE: Record<Language, Record<string, string[]>> = {
  es: {
    animales: ['ardilla', 'ballena', 'camello', 'delfín', 'elefante'],
    países: ['argentina', 'brasil', 'colombia', 'dinamarca', 'españa'],
    colores: ['amarillo', 'blanco', 'celeste', 'dorado', 'esmeralda']
  },
  en: {
    animals: ['antelope', 'bear', 'cat', 'dog', 'elephant'],
    countries: ['argentina', 'belgium', 'canada', 'denmark', 'england'],
    colors: ['amber', 'blue', 'cyan', 'daffodil', 'emerald']
  },
  fr: {
    animaux: ['abeille', 'baleine', 'chat', 'dauphin', 'éléphant'],
    pays: ['allemagne', 'belgique', 'canada', 'danemark', 'espagne'],
    couleurs: ['argent', 'bleu', 'cyan', 'doré', 'émeraude']
  },
  pt: {
    animais: ['abelha', 'baleia', 'cachorro', 'dromedário', 'elefante'],
    países: ['alemanha', 'brasil', 'canadá', 'dinamarca', 'espanha'],
    cores: ['amarelo', 'branco', 'ciano', 'dourado', 'esmeralda']
  }
};

export async function generateAiOpponentResponse(
  input: AiOpponentResponseInput
): Promise<AiOpponentResponseOutput> {
  try {
    const { letter, category, language } = input;
    const lowerLetter = letter.toLowerCase();
    
    // 1. Buscar en diccionario local primero
    const categoryWords = WORD_DATABASE[language]?.[category.toLowerCase()] || [];
    const validWords = categoryWords.filter(word => 
      word.toLowerCase().startsWith(lowerLetter)
    );

    if (validWords.length > 0) {
      // Selección aleatoria simple
      const randomIndex = Math.floor(Math.random() * validWords.length);
      return { response: validWords[randomIndex] };
    }

    // 2. Fallback a algoritmo generativo simple
    return { 
      response: generateSimpleWord(lowerLetter, category, language) 
    };
  } catch (error) {
    console.error('Error en IA local:', error);
    return { response: "" };
  }
}

// Algoritmo generativo básico
function generateSimpleWord(letter: string, category: string, language: Language): string {
  const prefixes: Record<Language, Record<string, string[]>> = {
    es: {
      animales: ['oso', 'tigre', 'leon', 'jirafa'],
      países: ['rusia', 'china', 'india', 'japon']
    },
    // ... otros idiomas
  };

  const suffix = {
    animales: letter === 'a' ? 'beja' : 'ino',
    países: letter === 'a' ? 'ngola' : 'ilandia'
  }[category] || '';

  return letter + (suffix || 'default');
}
