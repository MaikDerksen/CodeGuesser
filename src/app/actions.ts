'use server';

import { generateCodeSnippet, type GenerateCodeSnippetOutput } from "@/ai/flows/generate-code-snippet";

export async function getNewSnippet(): Promise<GenerateCodeSnippetOutput> {
  const snippet = await generateCodeSnippet({});
  return snippet;
}
