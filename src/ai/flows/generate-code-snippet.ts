
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating code snippets of varying difficulty and language for the GuessTheCode game.
 *
 * - generateCodeSnippet - A function that generates a code snippet with specified difficulty and language.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The output type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'HARDCORE']);
export type Difficulty = z.infer<typeof DifficultySchema>;
const ALL_LANGUAGES = [
  'C',
  'C++',
  'C#',
  'Java',
  'JavaScript',
  'TypeScript',
  'Python',
  'Ruby',
  'PHP',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'SQL',
  'MATLAB',
  'R',
  'Bash',
  'PowerShell',
  'Visual Basic',
  'Perl',
  'Haskell',
  'Elm',
  'F#',
  'OCaml',
  'Elixir',
  'Scala',
  'Lisp',
  'ML',
  'Prolog',
  'Erlang',
  'Brainfuck',
  'Befunge',
  'Piet',
  'Assembly',
  'Dart',
  'Julia',
  'Nim',
  'Objective-C',
  'Ada',
  'GDScript',
  'Hack',
  'Cobol',
  'Fortran',
  'Lua',
  'Crystal',
  'D',
  'Smalltalk',
  'Forth',
  'Racket',
  'Tcl',
  'Scheme',
  'VHDL',
  'Verilog',
] as const;
const LanguageSchema = z.enum(ALL_LANGUAGES);
export type Language = z.infer<typeof LanguageSchema>;

const GenerateCodeSnippetInputSchema = z.object({
  difficulty: DifficultySchema.optional().describe('The desired difficulty of the code snippet. If not provided, a random difficulty will be selected.'),
  language: LanguageSchema.optional().describe('A specific language to generate the snippet for. If not provided, a random language will be selected.'),
  languages: z.array(LanguageSchema).optional().describe('A list of languages to choose from. If not provided, any language can be chosen.'),
  codeToTransform: z.string().optional().describe('An existing snippet of code to re-format to the new difficulty. If provided, the "language" field is required and a new snippet will not be generated.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

// This internal schema is used for the prompt itself, after we've processed the input.
const InternalPromptInputSchema = z.object({
    difficulty: DifficultySchema,
    language: LanguageSchema,
    codeToTransform: z.string().optional(),
});

const GenerateCodeSnippetOutputSchema = z.object({
  difficulty: DifficultySchema,
  language: LanguageSchema,
  snippet: z.string(),
  solution: z.string(),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(
  input: GenerateCodeSnippetInput
): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {schema: InternalPromptInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `You are CodeMaster, an expert generator of obfuscated and formatted code snippets for the game GuessTheCode. Your output must be a single, valid JSON object with four fields: "difficulty", "language", "snippet", and "solution".

Follow these rules precisely:

1.  **difficulty**: You MUST use the provided difficulty: **{{difficulty}}**. This field in your output must exactly match.

2.  **language**: You MUST use the provided language: **{{language}}**. This field in your output must exactly match.

3.  **solution**: This field must exactly match the "language" field of the output.

4.  **snippet**: Your response for the snippet field must be a string containing ONLY the code, formatted as described for the target difficulty. Your output MUST NOT contain any surrounding text, markdown, or HTML tags unless specifically required by the "EASY" difficulty format.
    *   If the "codeToTransform" input is provided, you MUST re-format that exact code into the target difficulty format. Do NOT change the logic or language.
    *   If "codeToTransform" is NOT provided, you MUST generate a new, syntactically valid code snippet. This snippet should be complex and resemble code from a real-world application (e.g., a component, a utility function, a class, a complex query). It does not need to be compilable, but it must be syntactically plausible and between 10-20 lines. **AVOID creating trivial examples like "Hello, World", fibonacci sequences, or basic loops.**
    *   The code should be interesting and challenging to identify.

    **Formatting Rules by Difficulty**:
    *   **EASY**: The snippet must be a multi-line string, properly indented, with HTML \`<span>\` tags for basic syntax highlighting. The containing element has a dark background. Use distinct, bright, high-contrast inline CSS \`color\` styles for keywords (e.g., '#81A1C1'), strings (e.g., '#A3BE8C'), comments (e.g., '#5E81AC'), and other token types.
    *   **MEDIUM**: The snippet must be a multi-line string, properly indented, but in plain text with NO SYNTAX HIGHLIGHTING and NO HTML TAGS.
    *   **HARD**: The snippet must be a single-line string with NO HTML TAGS. Remove all unnecessary whitespace and line breaks, leaving only minimal required separators (like semicolons or commas).
    *   **HARDCORE**: The snippet must be a single-line string with NO HTML TAGS and absolutely NO WHITESPACE. Additionally, randomly replace 1 to 3 significant tokens or identifiers with a single underscore character ('_').`,
})

function getRandom<T>(arr: readonly T[] | T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async (input) => {
    // Determine the final difficulty
    const difficulty = input.difficulty ?? getRandom(DifficultySchema.options);

    // Determine the final language
    let language: Language;
    if (input.language) {
      language = input.language;
    } else if (input.languages && input.languages.length > 0) {
      language = getRandom(input.languages);
    } else {
      language = getRandom(ALL_LANGUAGES);
    }
    
    // Prepare the input for the AI prompt
    const promptInput: z.infer<typeof InternalPromptInputSchema> = {
        difficulty,
        language,
        codeToTransform: input.codeToTransform,
    };

    const {output} = await prompt(promptInput);

    // The AI might occasionally fail to set the language/difficulty correctly despite the prompt.
    // We'll override it here to ensure consistency.
    if (output) {
      output.language = language;
      output.difficulty = difficulty;
      output.solution = language;
    }
    
    return output!;
  }
);
