'use server';

import { generateCodeSnippet, type GenerateCodeSnippetOutput, type Difficulty, type Language } from "@/ai/flows/generate-code-snippet";

export async function getNewSnippet(difficulty?: Difficulty, languages?: Language[]): Promise<GenerateCodeSnippetOutput> {
  const snippet = await generateCodeSnippet({ difficulty, languages });
  return snippet;
}

export async function changeSnippetDifficulty(
  codeToTransform: string,
  language: Language,
  difficulty: Difficulty
): Promise<GenerateCodeSnippetOutput> {
  const snippet = await generateCodeSnippet({
    codeToTransform,
    language,
    difficulty,
  });
  return snippet;
}
