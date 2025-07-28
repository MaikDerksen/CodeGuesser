"use client";

import { useState, useEffect, useTransition } from "react";
import type { GenerateCodeSnippetOutput, Difficulty } from "@/ai/flows/generate-code-snippet";
import { getNewSnippet } from "@/app/actions";
import { LanguageSelector } from "@/components/language-selector";
import { SnippetDisplay } from "@/components/snippet-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LANGUAGES } from "@/lib/languages";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialSnippet.difficulty);
  const [guessStatus, setGuessStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0 });
  const [isPending, startTransition] = useTransition();

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
      const newSnippet = await getNewSnippet(selectedDifficulty);
      setSnippetData(newSnippet);
      setSelectedLanguage("");
      setGuessStatus("idle");
    });
  };
  
  const winPercentage = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col items-center gap-8 p-4 md:p-0">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-headline">Your Stats</CardTitle>
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

      <div className="w-full max-w-4xl space-y-6">
        <SnippetDisplay
          snippet={snippetData.snippet}
          difficulty={selectedDifficulty}
          difficulties={DIFFICULTIES}
          onDifficultyChange={setSelectedDifficulty}
          disabled={isPending || guessStatus !== 'idle'}
        />
        
        {guessStatus === 'idle' && (
          <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              <LanguageSelector
                languages={LANGUAGES}
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
                disabled={isPending}
              />
              <Button onClick={handleGuess} disabled={!selectedLanguage || isPending} className="w-full sm:w-auto">
                {isPending ? <Loader2 className="animate-spin" /> : "Guess"}
              </Button>
            </div>
          </div>
        )}

        {guessStatus !== 'idle' && (
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
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
      </div>
    </div>
  );
}
