// src/ai/dev.ts
const WORD_DICTIONARY: Record<string, Record<string, string[]>> = {
  es: {
    animales: ['ardilla', 'ballena', 'caballo'],
    ciudades: ['alicante', 'barcelona', 'cádiz'],
    nombres: ['ana', 'bernardo', 'carla']
  },
  en: {
    animals: ['ant', 'bear', 'cat'],
    cities: ['austin', 'boston', 'chicago'],
    names: ['alice', 'bob', 'charlie']
  }
};

export async function generateAiOpponentResponse(input: {
  letter: string;
  category: string;
  language: 'es' | 'en' | 'fr' | 'pt';
}): Promise<{ response: string }> {
  const { letter, category, language } = input;
  const lowerLetter = letter.toLowerCase();
  const categoryWords = WORD_DICTIONARY[language]?.[category] || [];
  const validWords = categoryWords.filter(word => word.toLowerCase().startsWith(lowerLetter));
  return { response: validWords[Math.floor(Math.random() * validWords.length)] || '' };
}

export async function validatePlayerWord(input: {
  letter: string;
  category: string;
  playerWord: string;
  language: 'es' | 'en' | 'fr' | 'pt';
}): Promise<{ isValid: boolean }> {
  const { letter, playerWord, category, language } = input;
  const lowerLetter = letter.toLowerCase();
  const lowerWord = playerWord.toLowerCase();
  const categoryWords = WORD_DICTIONARY[language]?.[category] || [];
  return { isValid: lowerWord.startsWith(lowerLetter) && categoryWords.includes(lowerWord) };
}

export const aiEvents = {
  generateAIResponse: generateAiOpponentResponse,
  validatePlayerWord: validatePlayerWord
};