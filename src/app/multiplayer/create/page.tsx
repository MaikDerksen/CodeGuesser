
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LANGUAGES } from "@/lib/languages";
import type { Difficulty, Language } from "@/ai/flows/generate-code-snippet";
import { Loader2 } from "lucide-react";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD", "HARDCORE"];

export default function CreateGame() {
  const router = useRouter();
  const [rounds, setRounds] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [selectedLanguages, setSelectedLanguages] = useState<Set<Language>>(new Set(LANGUAGES));
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (language: Language, checked: boolean) => {
    const newSelection = new Set(selectedLanguages);
    if (checked) {
      newSelection.add(language);
    } else {
      newSelection.delete(language);
    }
    setSelectedLanguages(newSelection);
  };

  const createGame = async () => {
    setIsLoading(true);
    try {
      const gameData = {
        settings: {
          rounds,
          difficulty,
          languages: Array.from(selectedLanguages),
        },
        players: [],
        status: "waiting",
        currentRound: 0,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "games"), gameData);
      router.push(`/multiplayer/lobby/${docRef.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      setIsLoading(false);
      // You could show a toast notification here
    }
  };

  return (
    <main className="min-h-screen container mx-auto p-4 md:py-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create Multiplayer Game</CardTitle>
            <CardDescription>Configure the settings for your game.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rounds">Rounds</Label>
              <Input id="rounds" type="number" value={rounds} onChange={(e) => setRounds(parseInt(e.target.value, 10))} min="1" max="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                    <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label>Languages</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                    {LANGUAGES.map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                            <Checkbox
                                id={lang}
                                checked={selectedLanguages.has(lang)}
                                onCheckedChange={(checked) => handleLanguageChange(lang, !!checked)}
                            />
                            <Label htmlFor={lang} className="font-normal">{lang}</Label>
                        </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
            <Button onClick={createGame} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Create Game"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
