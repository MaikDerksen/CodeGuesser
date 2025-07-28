
"use client";

import { useState, useEffect, useTransition } from "react";
import type { GenerateCodeSnippetOutput, Difficulty, Language } from "@/ai/flows/generate-code-snippet";
import { getNewSnippet, changeSnippetDifficulty } from "@/app/actions";
import { LanguageSelector } from "@/components/language-selector";
import { SnippetDisplay } from "@/components/snippet-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LANGUAGES } from "@/lib/languages";
import { CheckCircle2, XCircle, Loader2, Coffee } from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Stats {
  total: number;
  correct: number;
  streak: number;
}

interface CodeGuesserProps {
  initialSnippet: GenerateCodeSnippetOutput;
}

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD", "HARDCORE"];

export function CodeGuesser({ initialSnippet }: CodeGuesserProps) {
  const [snippetData, setSnippetData] = useState<GenerateCodeSnippetOutput>(initialSnippet);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [guessStatus, setGuessStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0 });
  const [isPending, startTransition] = useTransition();

  // Store the original snippet for each "round" to re-format it
  const [originalSnippet, setOriginalSnippet] = useState(initialSnippet.snippet);

  useEffect(() => {
    try {
      const storedStats = localStorage.getItem("codeGuesserStats");
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error("Failed to load stats from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("codeGuesserStats", JSON.stringify(stats));
    } catch (error) {
      console.error("Failed to save stats to localStorage", error);
    }
  }, [stats]);

  const handleGuess = () => {
    const isCorrect = selectedLanguage.toLowerCase() === snippetData.solution.toLowerCase();
    if (isCorrect) {
      setGuessStatus("correct");
      setStats((prev) => ({
        total: prev.total + 1,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
      }));
    } else {
      setGuessStatus("incorrect");
      setStats((prev) => ({ ...prev, total: prev.total + 1, streak: 0 }));
    }
  };

  const handleNextSnippet = () => {
    startTransition(async () => {
      const newSnippet = await getNewSnippet(snippetData.difficulty);
      setSnippetData(newSnippet);
      setOriginalSnippet(newSnippet.snippet); // Save the new original snippet
      setSelectedLanguage("");
      setGuessStatus("idle");
    });
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    // If the difficulty is already the selected one, do nothing.
    if (newDifficulty === snippetData.difficulty) return;

    startTransition(async () => {
      // Use the original snippet from the current round to re-format
      const newSnippet = await changeSnippetDifficulty(originalSnippet, snippetData.language as Language, newDifficulty);
      setSnippetData(newSnippet);
    });
  }
  
  const winPercentage = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <SnippetDisplay
          snippet={snippetData.snippet}
          difficulty={snippetData.difficulty}
          difficulties={DIFFICULTIES}
          onDifficultyChange={handleDifficultyChange}
          disabled={isPending}
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Guess the Language</CardTitle>
          </CardHeader>
          <CardContent>
            {guessStatus === 'idle' && (
              <div className="flex flex-col gap-4">
                  <LanguageSelector
                    languages={LANGUAGES}
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                    disabled={isPending}
                  />
                  <Button onClick={handleGuess} disabled={!selectedLanguage || isPending} className="w-full">
                    {isPending ? <Loader2 className="animate-spin" /> : "Guess"}
                  </Button>
              </div>
            )}

            {guessStatus !== 'idle' && (
              <div className="flex flex-col items-center gap-4">
                 {guessStatus === 'correct' && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertTitle>Correct!</AlertTitle>
                        <AlertDescription>
                            You guessed it! The language was {snippetData.solution}.
                        </AlertDescription>
                    </Alert>
                 )}
                 {guessStatus === 'incorrect' && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Incorrect!</AlertTitle>
                        <AlertDescription>
                            The correct language was {snippetData.solution}. Better luck next time!
                        </AlertDescription>
                    </Alert>
                 )}
                <Button onClick={handleNextSnippet} disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                  Next Snippet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.correct}/{stats.total}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-sm text-muted-foreground">Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{winPercentage}%</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Enjoying the game?</CardTitle>
                <CardDescription>
                    Support the creator by buying them a coffee!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Link href="https://coff.ee/maikd" target="_blank" className="w-full">
                    <Button className="w-full">
                        <Coffee className="mr-2" /> Buy me a coffee
                    </Button>
                </Link>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Why is your support important?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                     <p>
                        This game is a passion project, and it's completely free to play. However, creating this unique experience requires using powerful AI models to generate the code snippets, which has real-world costs.
                      </p>
                      <p>
                        Your support helps cover these operational expenses and allows me to continue improving the game with new features and more languages. Thank you for being a part of the journey!
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
