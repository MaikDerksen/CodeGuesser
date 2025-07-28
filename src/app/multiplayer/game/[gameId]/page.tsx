
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, runTransaction, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type GenerateCodeSnippetOutput, type Language, type Difficulty } from '@/ai/flows/generate-code-snippet';
import { getNewSnippet } from '@/app/actions';
import { SnippetDisplay } from '@/components/snippet-display';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from "lucide-react";
import { Progress } from '@/components/ui/progress';

// Types
interface Player {
  id: string;
  name: string;
  score: number;
}

interface Round {
  roundNumber: number;
  snippet: GenerateCodeSnippetOutput;
  startTime: Timestamp;
  guesses: Record<string, { language: string; time: number }>; // playerId -> { guess, time }
  results?: Record<string, number>; // playerId -> score change
}

interface GameState {
  settings: {
    rounds: number;
    difficulty: Difficulty;
    languages: Language[];
  };
  players: Player[];
  status: 'playing' | 'finished';
  hostId: string;
  currentRound: number;
  rounds: Record<string, Round>; // roundNumber -> Round data
}


export default function GamePage() {
  const { gameId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(30);

  const currentRoundData = game?.rounds?.[game.currentRound];
  const playerHasGuessed = playerId && currentRoundData?.guesses?.[playerId];


  useEffect(() => {
    setIsClient(true);
    const id = localStorage.getItem("playerId");
    if (!id) {
      toast({ title: "Error", description: "Player ID not found. Returning to lobby.", variant: "destructive" });
      router.push(`/multiplayer/lobby/${gameId}`);
    } else {
      setPlayerId(id);
    }
  }, [gameId, router, toast]);

  useEffect(() => {
    if (!gameId) return;
    const unsub = onSnapshot(doc(db, 'games', gameId as string), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameState;
        setGame(gameData);
        if (gameData.status === 'finished') {
          // You might want to redirect to a results page here
          console.log("Game finished!");
        }
      } else {
        toast({ title: 'Game not found', variant: 'destructive' });
        router.push('/multiplayer');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameId, router, toast]);

  // Effect to generate snippet for the current round if it doesn't exist
  useEffect(() => {
    const isHost = playerId === game?.hostId;
    if (isHost && game && game.status === 'playing' && !game.rounds?.[game.currentRound]) {
        const startRound = async () => {
            try {
                const newSnippet = await getNewSnippet(game.settings.difficulty, game.settings.languages);
                const roundData: Round = {
                    roundNumber: game.currentRound,
                    snippet: newSnippet,
                    startTime: Timestamp.now(),
                    guesses: {},
                };
                
                const gameRef = doc(db, 'games', gameId as string);
                await updateDoc(gameRef, {
                    [`rounds.${game.currentRound}`]: roundData,
                });
            } catch (error) {
                console.error("Error starting round:", error);
                toast({ title: "Error starting round", variant: "destructive" });
            }
        };
        startRound();
    }
  }, [game, gameId, playerId, toast]);

  const handleGuess = async () => {
    if (!playerId || !selectedLanguage || !currentRoundData || playerHasGuessed) return;
    
    setIsPending(true);
    const guessTime = Timestamp.now().seconds - currentRoundData.startTime.seconds;
    
    try {
      const gameRef = doc(db, "games", gameId as string);
      await updateDoc(gameRef, {
        [`rounds.${game.currentRound}.guesses.${playerId}`]: {
          language: selectedLanguage,
          time: guessTime,
        }
      });
      setSelectedLanguage("");
    } catch (error) {
        console.error("Error submitting guess:", error);
        toast({ title: "Couldn't submit guess", variant: "destructive" });
    } finally {
        setIsPending(false);
    }
  };

  if (loading || !isClient || !game || !currentRoundData) {
    return (
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading round {game?.currentRound || 1}...</p>
      </div>
    );
  }

  // TODO: Add game logic for timer, scoring, and round progression.
  // This component is currently a placeholder to show the game state.
  
  return (
    <main className="min-h-screen container mx-auto p-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Player scores */}
            <aside className="lg:col-span-1 order-last lg:order-first">
                <Card>
                    <CardHeader>
                        <CardTitle>Scoreboard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {game.players.sort((a,b) => b.score - a.score).map(p => (
                            <div key={p.id} className="flex justify-between items-center">
                                <span className="font-medium">{p.name} {p.id === playerId ? '(You)' : ''}</span>
                                <span className="font-bold">{p.score}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </aside>
        
            {/* Game Area */}
            <div className="lg:col-span-3 order-first lg:order-last space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Round {game.currentRound} of {game.settings.rounds}</CardTitle>
                            <div className="text-lg font-bold">Time Left: {timeLeft}s</div>
                        </div>
                        <Progress value={(timeLeft / 30) * 100} className="w-full" />
                    </CardHeader>
                    <CardContent>
                        <SnippetDisplay snippet={currentRoundData.snippet.snippet} difficulty={game.settings.difficulty} difficulties={[]} onDifficultyChange={() => {}} disabled={true} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Guess</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {playerHasGuessed ? (
                             <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Guess Submitted!</AlertTitle>
                                <AlertDescription>
                                    You guessed {currentRoundData.guesses[playerId!].language}. Waiting for other players...
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <LanguageSelector languages={game.settings.languages} value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isPending} />
                                <Button onClick={handleGuess} disabled={isPending || !selectedLanguage}>
                                    {isPending ? <Loader2 className="animate-spin" /> : "Submit Guess"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

    </main>
  );
}
