'use server';

import { generateCodeSnippet, type GenerateCodeSnippetOutput, type Difficulty } from "@/ai/flows/generate-code-snippet";

export async function getNewSnippet(difficulty?: Difficulty): Promise<GenerateCodeSnippetOutput> {
  const snippet = await generateCodeSnippet({ difficulty });
  return snippet;
}