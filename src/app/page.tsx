
"use client";

import { useState, useEffect } from "react";
import { generateCodeSnippet } from "@/ai/flows/generate-code-snippet";
import type { GenerateCodeSnippetOutput, Language } from "@/ai/flows/generate-code-snippet";
import { CodeGuesser } from "./code-guesser";
import { SettingsMenu } from "@/components/settings-menu";
import { Code, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/languages";


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
       <div className="min-h-screen container mx-auto py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your game...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen container mx-auto py-8">
      <header className="text-center mb-8 relative">
        <div className="flex items-center justify-center gap-4 mb-2">
            <Code className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
              Code Guesser
            </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Can you guess the programming language?
        </p>
         <div className="absolute top-0 right-0">
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
      </header>
      <CodeGuesser initialSnippet={initialSnippet} activeLanguages={activeLanguages} />
    </main>
  );
}
