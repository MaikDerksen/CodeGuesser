
"use client";

import { useState, useEffect } from "react";
import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import type { GenerateCodeSnippetOutput, Language } from "@/ai/flows/generate-code-snippet";
import { CodeGuesser } from "./code-guesser";
import { SettingsMenu } from "@/components/settings-menu";
import { Code, Settings, Loader2, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/languages";
import Link from "next/link";


export default function Home() {
  const [initialSnippet, setInitialSnippet] = useState<GenerateCodeSnippetOutput | null>(null);
  const [activeLanguages, setActiveLanguages] = useState<Language[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedLangSettings = localStorage.getItem("codeGuesserLangSettings");
      if (storedLangSettings) {
        setActiveLanguages(JSON.parse(storedLangSettings));
      }
    } catch (error) {
      console.error("Could not load language settings.", error)
      // Saved data is not valid, clear it
      localStorage.removeItem("codeGuesserLangSettings");
    }
    
    generateCodeSnippet({ difficulty: 'EASY' }).then(setInitialSnippet);
  }, []);

  const handleLanguageChange = (updatedLanguages: Language[]) => {
    setActiveLanguages(updatedLanguages);
     try {
      localStorage.setItem("codeGuesserLangSettings", JSON.stringify(updatedLanguages));
    } catch (error) {
      console.error("Could not save language settings.", error)
    }
  }

  if (!isClient || !initialSnippet) {
    return (
       <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your game...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen container mx-auto p-4 md:py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Code className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
                Code Guesser
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-muted-foreground text-base md:text-lg hidden sm:block">
                    Can you guess the programming language?
                </p>
                 <Link href="/multiplayer">
                    <Button variant="outline">
                        <Gamepad2 className="mr-2" />
                        Multiplayer
                    </Button>
                </Link>
                <SettingsMenu 
                    allLanguages={LANGUAGES as Language[]}
                    activeLanguages={activeLanguages}
                    onActiveLanguagesChange={handleLanguageChange}
                >
                    <Button variant="ghost" size="icon">
                    <Settings className="h-6 w-6" />
                    <span className="sr-only">Settings</span>
                    </Button>
                </SettingsMenu>
            </div>
        </div>
        <p className="text-muted-foreground text-center text-base mt-4 sm:hidden">
            Can you guess the programming language?
        </p>

      </header>
      <CodeGuesser initialSnippet={initialSnippet} activeLanguages={activeLanguages} />
    </main>
  );
}
