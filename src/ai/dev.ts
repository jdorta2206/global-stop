// src/ai/events.ts - Configuración de eventos de IA (Versión Gratuita)
import { setupLocalAI } from './local-ai';
import { setupWordValidation } from './word-validator';

// Configuración inicial de los servicios de IA
export function initializeAIEvents() {
  // 1. Configura el generador de respuestas de IA local
  setupLocalAI({
    dictionaryPath: '/public/dictionaries',
    languages: ['es', 'en', 'fr', 'pt']
  });

  // 2. Configura el validador de palabras
  setupWordValidation({
    strictMode: true,
    allowProperNouns: true
  });

  // 3. Eventos disponibles
  return {
    generateAIResponse: generateAiOpponentResponse,
    validatePlayerWord: validatePlayerWord
  };
}

// Tipos para TypeScript
interface AIEvents {
  generateAIResponse: (input: {
    letter: string;
    category: string;
    language: 'es' | 'en' | 'fr' | 'pt';
  }) => Promise<{ response: string }>;

  validatePlayerWord: (input: {
    letter: string;
    category: string;
    playerWord: string;
    language: 'es' | 'en' | 'fr' | 'pt';
  }) => Promise<{ isValid: boolean }>;
}

// Implementación alternativa con TensorFlow.js (opcional)
import * as tf from '@tensorflow/tfjs';

class AIModel {
  private model: tf.LayersModel;

  async initialize() {
    this.model = await tf.loadLayersModel('/models/word-model.json');
  }

  async predict(input: string): Promise<string> {
    const prediction = this.model.predict(tf.tensor([this.encodeInput(input)]));
    return this.decodeOutput(prediction);
  }

  private encodeInput(text: string): number[] {
    // Implementación básica de codificación
    return Array.from(text).map(c => c.charCodeAt(0) / 255);
  }

  private decodeOutput(tensor: tf.Tensor): string {
    // Decodificación básica
    return String.fromCharCode(Math.round(tensor.dataSync()[0] * 255));
  }
}

export const aiEvents: AIEvents = initializeAIEvents();
