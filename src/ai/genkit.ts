// src/ai/local-ai.ts - Reemplazo gratuito para Genkit/Google AI

/**
 * Módulo de IA local - Versión gratuita
 * Proporciona funcionalidades similares a Genkit pero sin dependencias de pago
 */

import { LocalAIModel } from './local-models';
import { DictionaryValidator } from './dictionary-validator';

// Configuración inicial
const localModel = new LocalAIModel();
const dictionaryValidator = new DictionaryValidator();

export const ai = {
  /**
   * Generador de respuestas de IA local
   */
  async generateResponse(input: {
    letter: string;
    category: string;
    language: string;
  }): Promise<{ response: string }> {
    console.log("[LocalAI] Generating response for:", input);
    return localModel.generate(input);
  },

  /**
   * Validador de palabras local
   */
  async validateWord(input: {
    word: string;
    language: string;
  }): Promise<{ isValid: boolean }> {
    console.log("[LocalAI] Validating word:", input);
    return dictionaryValidator.validate(input);
  },

  // Compatibilidad con la interfaz original (opcional)
  definePrompt: () => {
    console.warn("definePrompt no es necesario en la versión local");
    return (input: any) => localModel.generate(input);
  },

  defineFlow: () => {
    console.warn("defineFlow no es necesario en la versión local");
    return (input: any) => localModel.generate(input);
  }
};

// Implementación del modelo local
class LocalAIModel {
  private dictionaries: Record<string, Record<string, string[]>> = {
    es: {
      animales: ['ardilla', 'ballena', 'camello'],
      países: ['argentina', 'brasil', 'colombia']
    },
    en: {
      animals: ['antelope', 'bear', 'cat'],
      countries: ['argentina', 'belgium', 'canada']
    }
  };

  async generate(input: {
    letter: string;
    category: string;
    language: string;
  }): Promise<{ response: string }> {
    const { letter, category, language } = input;
    const lowerLetter = letter.toLowerCase();

    const words = this.dictionaries[language]?.[category.toLowerCase()] || [];
    const validWords = words.filter(word => 
      word.toLowerCase().startsWith(lowerLetter)
    );

    return {
      response: validWords.length > 0 
        ? validWords[Math.floor(Math.random() * validWords.length)]
        : ""
    };
  }
}

// Implementación del validador
class DictionaryValidator {
  private wordSets: Record<string, Set<string>> = {
    es: new Set(['ardilla', 'ballena', 'camello']),
    en: new Set(['antelope', 'bear', 'cat'])
  };

  async validate(input: {
    word: string;
    language: string;
  }): Promise<{ isValid: boolean }> {
    const { word, language } = input;
    return {
      isValid: this.wordSets[language]?.has(word.toLowerCase()) || false
    };
  }
}
