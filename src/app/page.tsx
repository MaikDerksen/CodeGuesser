import Image from "next/image";
import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import { CodeGuesser } from "./code-guesser";
import { Code, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const initialSnippet = await generateCodeSnippet({ difficulty: 'EASY' });

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
      <footer className="mt-12 text-center">
        <div className="inline-flex flex-col items-center gap-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-bold text-lg">Enjoying the game?</h3>
            <p className="text-muted-foreground">
                Support the creator by buying them a coffee!
            </p>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Link href="https://coff.ee/maikd" target="_blank">
                    <Button>
                        <Coffee className="mr-2" /> Buy me a coffee
                    </Button>
                </Link>
                <div className="p-2 border rounded-md">
                    <Image
                        src="/buy-me-a-coffee-qr.png"
                        alt="Buy me a coffee QR Code"
                        width={128}
                        height={128}
                        className="rounded-sm"
                    />
                </div>
            </div>
        </div>
      </footer>
    </main>
  );
}