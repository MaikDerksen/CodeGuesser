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
  prompt: `You are CodeMaster, an expert generator of obfuscated and formatted code snippets for the game GuessTheCode. Each time you are called, you must output exactly four fields in JSON, with no additional commentary:

{
  "difficulty": "{{#if difficulty}}{{difficulty}}{{else}}<EASY|MEDIUM|HARD|HARDCORE>{{/if}}",
  "language": "<one language randomly chosen from the FULL list below>",
  "snippet": "<the code snippet formatted according to the chosen difficulty>",
  "solution": "<the name of the language used in the snippet>"
}

Rules:

1. difficulty:
   - If a difficulty is provided in the input, use it. Otherwise, randomly select one.
   - EASY: multi\u2011line snippet, properly indented, with full syntax highlighting (i.e. language\u2011specific keywords, punctuation, and types clearly distinct).
   - MEDIUM: same multi\u2011line structure and indentation, but rendered in plain ASCII (no color or highlighting).
   - HARD: one\u2011liner snippet, no extraneous whitespace or line breaks; all tokens stuck together except minimal required separators (e.g. semicolons, commas).
   - HARDCORE: one\u2011liner snippet, no whitespace at all, no punctuation spacing, and randomly replace 1\u20113 tokens or identifiers with underscores (

2. language: choose uniformly at random from the comprehensive spectrum of programming languages:
   C, C++, C#, Java, JavaScript, TypeScript, Python, Ruby, PHP, Go, Rust, Swift, Kotlin, SQL, MATLAB, R, Bash, PowerShell, Visual Basic, Perl, Haskell, Elm, F#, OCaml, Elixir, Scala, Lisp, ML, Prolog, Erlang, Brainfuck, Befunge, Piet, Assembly, Dart, Julia, Nim, Objective\u2011C, Ada, GDScript, Hack, Elm, Cobol, Fortran, Lua, Crystal, D, Smalltalk, Forth, Racket, Tcl, Scheme, VHDL, Verilog, and any other esoteric or mainstream language you know.

3. snippet: generate either
   - a small, self\u2011contained function, class, loop, or expression drawn from:
     • real open\u2011source code patterns (e.g. \u201cmap\u201d, \u201cfilter\u201d, \u201cclass definitions\u201d, \u201cstring manipulation\u201d)  
     • or AI\u2011created code performing a simple task (e.g. reading a file, computing a factorial).  
   - Ensure the snippet is syntactically valid in the chosen language. The code snippit should always be big not 1 or 5 lines. More like a randome snippit of 40 lines from a 200 line page.

4. solution: exactly the name of the language used, matching the “language” field.

Always return strictly valid JSON with those four keys.`,
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