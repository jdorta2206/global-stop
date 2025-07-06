// src/ai/genkit.ts
type Language = 'es' | 'en';
type Categories = {
  animales?: string[];
  países?: string[];
  nombres?: string[];
  ciudades?: string[];
  animals?: string[];
  countries?: string[];
  names?: string[];
  cities?: string[];
};

const DICTIONARIES: Record<Language, Categories> = {
  es: {
    animales: ['ardilla', 'ballena', 'camello'],
    países: ['argentina', 'brasil', 'colombia'],
    nombres: ['ana', 'bernardo', 'carla'],
    ciudades: ['alicante', 'barcelona', 'cádiz']
  },
  en: {
    animals: ['antelope', 'bear', 'cat'],
    countries: ['argentina', 'belgium', 'canada'],
    names: ['alice', 'bob', 'charlie'],
    cities: ['austin', 'boston', 'chicago']
  }
};

export const ai = {
  async generateResponse(input: {
    letter: string;
    category: keyof Categories;
    language: Language;
  }): Promise<{ response: string }> {
    const { letter, category, language } = input;
    const words = DICTIONARIES[language][category] || [];
    const validWords = words.filter((word: string) => 
      word.toLowerCase().startsWith(letter.toLowerCase())
    );
    return {
      response: validWords[Math.floor(Math.random() * validWords.length)] || ""
    };
  },

  async validateWord(input: {
    word: string;
    language: Language;
  }): Promise<{ isValid: boolean }> {
    const { word, language } = input;
    const allWords = Object.values(DICTIONARIES[language]).flat() as string[];
    return {
      isValid: allWords.includes(word.toLowerCase())
    };
  },

  definePrompt: () => (input: any) => ai.generateResponse(input),
  defineFlow: () => (input: any) => ai.generateResponse(input)
};