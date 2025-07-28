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
const LanguageSchema = z.enum([
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
]);

const GenerateCodeSnippetInputSchema = z.object({
  difficulty: DifficultySchema.optional().describe('The desired difficulty of the code snippet. If not provided, a random difficulty will be selected.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

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
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `You are CodeMaster, an expert generator of obfuscated and formatted code snippets for the game GuessTheCode. Your output must be a single, valid JSON object with four fields: "difficulty", "language", "snippet", and "solution".

Follow these rules precisely:

1.  **difficulty**: Use the provided difficulty. If none is given, select one at random from [EASY, MEDIUM, HARD, HARDCORE]. This field in your output must match the selected difficulty.

2.  **language**: Choose one language at random from the full list provided below.

3.  **solution**: This field must exactly match the "language" field.

4.  **snippet**: Generate a syntactically valid code snippet (e.g., a function, class, loop) of about 10-20 lines for the chosen language. Then, format this snippet according to the selected difficulty:
    *   **EASY**: The snippet must be a multi-line string, properly indented, with HTML \`<span>\` tags for basic syntax highlighting. The containing element has a dark background. Use distinct, bright, high-contrast inline CSS \`color\` styles for keywords (e.g., '#81A1C1'), strings (e.g., '#A3BE8C'), comments (e.g., '#5E81AC'), and other token types.
    *   **MEDIUM**: The snippet must be a multi-line string, properly indented, but in plain text with no syntax highlighting.
    *   **HARD**: The snippet must be a single-line string. Remove all unnecessary whitespace and line breaks, leaving only minimal required separators (like semicolons or commas).
    *   **HARDCORE**: The snippet must be a single-line string with absolutely no whitespace. Additionally, randomly replace 1 to 3 significant tokens or identifiers with a single underscore character ('_').

**Available Languages**:
C, C++, C#, Java, JavaScript, TypeScript, Python, Ruby, PHP, Go, Rust, Swift, Kotlin, SQL, MATLAB, R, Bash, PowerShell, Visual Basic, Perl, Haskell, Elm, F#, OCaml, Elixir, Scala, Lisp, ML, Prolog, Erlang, Brainfuck, Befunge, Piet, Assembly, Dart, Julia, Nim, Objective-C, Ada, GDScript, Hack, Cobol, Fortran, Lua, Crystal, D, Smalltalk, Forth, Racket, Tcl, Scheme, VHDL, Verilog.

**Input Difficulty**: {{#if difficulty}}{{difficulty}}{{else}}random{{/if}}`,
})

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
