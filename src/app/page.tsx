import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import { CodeGuesser } from "./code-guesser";
import { Code } from "lucide-react";

export default async function Home() {
  const initialSnippet = await generateCodeSnippet({});

  return (
    <main className="min-h-screen container mx-auto py-8">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
            <Code className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
              Code Guesser
            </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Can you guess the programming language?
        </p>
      </header>
      <CodeGuesser initialSnippet={initialSnippet} />
    </main>
  );
}
