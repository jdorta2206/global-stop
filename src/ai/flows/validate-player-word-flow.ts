
'use server';
/**
 * @fileOverview Validador de palabras del jugador para el juego Global Stop.
 *
 * - validatePlayerWord - Una función que valida la palabra de un jugador.
 * - ValidatePlayerWordInput - El tipo de entrada para la función validatePlayerWord.
 * - ValidatePlayerWordOutput - El tipo de retorno para la función validatePlayerWord.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidatePlayerWordInputSchema = z.object({
  letter: z.string().describe('La letra para la ronda actual.'),
  category: z.string().describe('La categoría para la ronda actual (aunque la validación de la palabra debe ser general).'),
  playerWord: z.string().describe('La palabra ingresada por el jugador.'),
});
export type ValidatePlayerWordInput = z.infer<typeof ValidatePlayerWordInputSchema>;

const ValidatePlayerWordOutputSchema = z.object({
  isValid: z.boolean().describe('True si la palabra es válida, bien escrita y comienza con la letra especificada; false en caso contrario.'),
});
export type ValidatePlayerWordOutput = z.infer<typeof ValidatePlayerWordOutputSchema>;

export async function validatePlayerWord(input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> {
  console.log(`validatePlayerWordFlow: Iniciando validación para input: ${JSON.stringify(input)}`);
  
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!                 MODO DE DEPURACIÓN ACTIVO             !!
  // !! ESTE FLUJO SIEMPRE DEVUELVE isValid: true             !!
  // !! ESTO ES PARA PROBAR LA LÓGICA DE PUNTUACIÓN EN GamePage !!
  // !!   SI LAS PALABRAS PUNTÚAN AHORA, EL PROBLEMA ESTÁ     !!
  // !!   EN EL PROMPT/RESPUESTA DEL LLM. SI NO PUNTÚAN,      !!
  // !!   EL PROBLEMA ESTÁ EN GamePage.tsx.                   !!
  // !!       POR FAVOR, INFORMA EL RESULTADO.                !!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  console.warn("validatePlayerWordFlow: DEBUG MODE - FORCING isValid: true");
  if (input.playerWord.trim() === "") {
    console.log("validatePlayerWordFlow (DEBUG): Palabra vacía, retornando isValid: false (incluso en modo debug para esta condición)");
    return { isValid: false };
  }
  if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
    console.log(`validatePlayerWordFlow (DEBUG): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}", retornando isValid: false (incluso en modo debug para esta condición)`);
    return { isValid: false };
  }
  return { isValid: true };

  // Código original comentado para la depuración:
  /*
  // Pre-validación en el flujo (defensiva)
  if (input.playerWord.trim() === "") {
    console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida para letra "${input.letter}", categoría "${input.category}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
    return { isValid: false };
  }
  if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
      console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
  }
    
  console.log(`validatePlayerWordFlow: Input pasó las pre-validaciones. Llamando al LLM con: ${JSON.stringify(input)}`);
  
  const {output, response: rawLLMResponse} = await prompt(input);

  console.log(`validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}`);

  if (output && typeof output.isValid === 'boolean') {
    console.log(`validatePlayerWordFlow: Validación exitosa vía schema. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}", isValid: ${output.isValid}`);
    return output;
  }
    
  let llmResponseText = "Unavailable";
  try {
    llmResponseText = await rawLLMResponse.text() || "Empty LLM response text";
    console.warn(`validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano o el objeto output fue nulo/undefined. Input: ${JSON.stringify(input)}. Raw LLM Output Object: ${JSON.stringify(output)}. Intentando parsear desde texto crudo: "${llmResponseText}"`);
      
    const trueMatch = llmResponseText.match(/\{\s*"isValid"\s*:\s*true\s*\}/);
    if (trueMatch) {
        console.warn(`validatePlayerWordFlow: Parseo manual de JSON desde texto crudo exitoso (encontrado TRUE): ${trueMatch[0]}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: true`);
        return { isValid: true };
    }
    const falseMatch = llmResponseText.match(/\{\s*"isValid"\s*:\s*false\s*\}/);
    if (falseMatch) {
        console.warn(`validatePlayerWordFlow: Parseo manual de JSON desde texto crudo exitoso (encontrado FALSE): ${falseMatch[0]}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: false`);
        return { isValid: false };
    }
    console.error(`validatePlayerWordFlow: No se encontró un objeto JSON válido ({"isValid": true/false}) en el texto crudo del LLM: "${llmResponseText}". Input: ${JSON.stringify(input)}`);

  } catch (fetchTextError) {
    llmResponseText = "Error al obtener texto de respuesta del LLM";
    console.error(`validatePlayerWordFlow: Error al obtener texto crudo de respuesta del LLM para input ${JSON.stringify(input)}. Error:`, fetchTextError);
  }
    
  console.error(`validatePlayerWordFlow: Todos los intentos de obtener un booleano válido para 'isValid' fallaron. Defaulting to false. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}". LLM Raw Output Object: ${JSON.stringify(output)}, LLM Raw Text: "${llmResponseText}"`);
  return { isValid: false };
  */
}

const prompt = ai.definePrompt({
  name: 'validatePlayerWordPrompt',
  input: {schema: ValidatePlayerWordInputSchema},
  output: {schema: ValidatePlayerWordOutputSchema},
  prompt: `Eres un juez experto para el juego "Stop" (también conocido como Tutti Frutti o Basta) jugado en español.
Tu tarea específica es determinar si la palabra '{{{playerWord}}}' es una entrada válida para la letra '{{{letter}}}'.

Reglas a seguir ESTRICTAMENTE:
1.  La palabra DEBE comenzar con la letra '{{{letter}}}' (ignora mayúsculas/minúsculas).
2.  La palabra '{{{playerWord}}}' DEBE ser una palabra española real, comúnmente conocida y correctamente escrita, O un nombre propio común en español (como 'Paco', 'París', 'Zaragoza', 'Zorro'). No debe ser una palabra inventada, un error tipográfico, una cadena aleatoria de letras o una palabra de otro idioma (a menos que sea un préstamo muy común en español). La categoría '{{{category}}}' se proporciona como contexto del juego, pero NO la uses para decidir si la palabra en sí es válida; la validación de la palabra debe ser general e independiente de la categoría.
3.  La palabra NO debe estar vacía ni consistir solo en espacios en blanco.

Palabra del jugador: '{{{playerWord}}}'
Letra requerida: '{{{letter}}}'
Categoría (solo contexto): '{{{category}}}'

Considerando SOLO estas reglas, ¿es válida la palabra del jugador?
Responde con un objeto JSON en el formato {"isValid": true} si TODAS las reglas se cumplen.
Responde con un objeto JSON en el formato {"isValid": false} si ALGUNA regla no se cumple.
TU RESPUESTA COMPLETA DEBE SER ÚNICAMENTE EL OBJETO JSON. NO INCLUYAS NINGÚN OTRO TEXTO, EXPLICACIÓN O MARKDOWN.`,
});

// El flujo original se comenta para la depuración.
/*
const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async input => {
    // Pre-validación en el flujo (defensiva)
    if (input.playerWord.trim() === "") {
      console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra vacía recibida para letra "${input.letter}", categoría "${input.category}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
        console.warn(`validatePlayerWordFlow (pre-LLM check): Palabra "${input.playerWord}" no comienza con la letra "${input.letter}". Input: ${JSON.stringify(input)}. Retornando {isValid: false}.`);
        return { isValid: false };
    }
    
    console.log(`validatePlayerWordFlow: Input pasó las pre-validaciones. Llamando al LLM con: ${JSON.stringify(input)}`);
    const {output, response: rawLLMResponse} = await prompt(input);

    console.log(`validatePlayerWordFlow: Input: ${JSON.stringify(input)}, Raw LLM Output Object (parsed by Genkit schema): ${JSON.stringify(output)}`);

    if (output && typeof output.isValid === 'boolean') {
      // Happy path: Genkit successfully parsed the output according to the schema
      console.log(`validatePlayerWordFlow: Validación exitosa vía schema. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}", isValid: ${output.isValid}`);
      return output;
    }
    
    // Attempt to parse from raw text if structured output (schema parsing) failed or was incomplete
    let llmResponseText = "Unavailable";
    try {
      llmResponseText = await rawLLMResponse.text() || "Empty LLM response text";
      console.warn(`validatePlayerWordFlow: LLM structured output (output.isValid) no fue un booleano o el objeto output fue nulo/undefined. Input: ${JSON.stringify(input)}. Raw LLM Output Object: ${JSON.stringify(output)}. Intentando parsear desde texto crudo: "${llmResponseText}"`);
      
      // Regex mejorado para ser más tolerante con espacios alrededor de los dos puntos y el valor booleano
      // Y buscar específicamente {"isValid": true} o {"isValid": false}
      const trueMatch = llmResponseText.match(/\{\s*"isValid"\s*:\s*true\s*\}/);
      if (trueMatch) {
        console.warn(`validatePlayerWordFlow: Parseo manual de JSON desde texto crudo exitoso (encontrado TRUE): ${trueMatch[0]}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: true`);
        return { isValid: true };
      }

      const falseMatch = llmResponseText.match(/\{\s*"isValid"\s*:\s*false\s*\}/);
      if (falseMatch) {
        console.warn(`validatePlayerWordFlow: Parseo manual de JSON desde texto crudo exitoso (encontrado FALSE): ${falseMatch[0]}. Word: "${input.playerWord}", Letter: "${input.letter}", isValid: false`);
        return { isValid: false };
      }
      
      console.error(`validatePlayerWordFlow: No se encontró un objeto JSON válido ({"isValid": true/false}) en el texto crudo del LLM: "${llmResponseText}". Input: ${JSON.stringify(input)}`);
      
    } catch (fetchTextError) {
      llmResponseText = "Error al obtener texto de respuesta del LLM";
      console.error(`validatePlayerWordFlow: Error al obtener texto crudo de respuesta del LLM para input ${JSON.stringify(input)}. Error:`, fetchTextError);
    }
    
    console.error(`validatePlayerWordFlow: Todos los intentos de obtener un booleano válido para 'isValid' fallaron. Defaulting to false. Word: "${input.playerWord}", Letter: "${input.letter}", Category: "${input.category}". LLM Raw Output Object: ${JSON.stringify(output)}, LLM Raw Text: "${llmResponseText}"`);
    return { isValid: false }; // Default to false if all else fails
  }
);
*/
// El prompt se define fuera para referencia, pero el flujo `validatePlayerWordFlow` anterior
// está ahora usando la lógica de depuración que devuelve true directamente.
const validatePlayerWordFlow = ai.defineFlow(
  {
    name: 'validatePlayerWordFlow',
    inputSchema: ValidatePlayerWordInputSchema,
    outputSchema: ValidatePlayerWordOutputSchema,
  },
  async (input: ValidatePlayerWordInput): Promise<ValidatePlayerWordOutput> => {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!                 MODO DE DEPURACIÓN ACTIVO             !!
    // !! ESTE FLUJO SIEMPRE DEVUELVE isValid: true             !!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    console.warn(`[${new Date().toISOString()}] validatePlayerWordFlow: DEBUG MODE - Input: ${JSON.stringify(input)}`);
    
    if (input.playerWord.trim() === "") {
      console.warn(`[${new Date().toISOString()}] validatePlayerWordFlow (DEBUG): Palabra vacía. Retornando {isValid: false}.`);
      return { isValid: false };
    }
    if (!input.playerWord.trim().toLowerCase().startsWith(input.letter.toLowerCase())) {
      console.warn(`[${new Date().toISOString()}] validatePlayerWordFlow (DEBUG): Palabra "${input.playerWord}" no comienza con letra "${input.letter}". Retornando {isValid: false}.`);
      return { isValid: false };
    }
    
    console.warn(`[${new Date().toISOString()}] validatePlayerWordFlow (DEBUG): Forzando {isValid: true} para palabra "${input.playerWord}", letra "${input.letter}".`);
    return { isValid: true };
  }
);

    