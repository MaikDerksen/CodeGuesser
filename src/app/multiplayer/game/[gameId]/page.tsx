
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type GenerateCodeSnippetOutput, type Language, type Difficulty } from '@/ai/flows/generate-code-snippet';
import { getNewSnippet } from '@/app/actions';
import { SnippetDisplay } from '@/components/snippet-display';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Progress } from '@/components/ui/progress';

const ROUND_TIME = 30; // seconds

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
  guesses: Record<string, { language: string; time: number; correct: boolean }>; // playerId -> { guess, time, correct }
  results?: Record<string, { scoreChange: number, newScore: number }>; // playerId -> score change
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
  const [isPending, startTransition] = useTransition();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  const currentRoundData = game?.rounds?.[game.currentRound];
  const playerHasGuessed = playerId && currentRoundData?.guesses?.[playerId];
  const roundHasEnded = !!currentRoundData?.results;


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

  // Firestore listener for game state
  useEffect(() => {
    if (!gameId) return;
    const unsub = onSnapshot(doc(db, 'games', gameId as string), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameState;
        setGame(gameData);
        if (gameData.status === 'finished' && !loading) {
          // Future: Redirect to a dedicated results page
           toast({ title: "Game Over!", description: "Check out the final scores." });
        }
      } else {
        toast({ title: 'Game not found', variant: 'destructive' });
        router.push('/multiplayer');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameId, router, toast, loading]);
  
  // Timer effect
  useEffect(() => {
    if (!currentRoundData || roundHasEnded) {
        if(currentRoundData?.startTime) setTimeLeft(ROUND_TIME);
        return;
    };
    
    const interval = setInterval(() => {
      const elapsed = Timestamp.now().seconds - currentRoundData.startTime.seconds;
      const newTimeLeft = Math.max(0, ROUND_TIME - elapsed);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoundData, roundHasEnded]);


  // Effect to generate snippet for a new round (HOST ONLY)
  useEffect(() => {
    const isHost = playerId === game?.hostId;
    if (isHost && game && game.status === 'playing' && !game.rounds?.[game.currentRound]) {
        startTransition(async () => {
             try {
                const newSnippet = await getNewSnippet(game.settings.difficulty, game.settings.languages);
                const roundData: Omit<Round, 'guesses'> = {
                    roundNumber: game.currentRound,
                    snippet: newSnippet,
                    startTime: Timestamp.now(),
                };
                
                const gameRef = doc(db, 'games', gameId as string);
                await updateDoc(gameRef, {
                    [`rounds.${game.currentRound}`]: roundData,
                    [`rounds.${game.currentRound}.guesses`]: {}, // Ensure guesses is initialized
                });
            } catch (error) {
                console.error("Error starting round:", error);
                toast({ title: "Error starting round", variant: "destructive" });
            }
        });
    }
  }, [game, gameId, playerId, toast]);

  // Effect to end round when time is up or all players have guessed (HOST ONLY)
   useEffect(() => {
    if (!game || !currentRoundData || roundHasEnded) return;

    const isHost = playerId === game.hostId;
    const allPlayersGuessed = Object.keys(currentRoundData.guesses).length === game.players.length;

    if (isHost && (timeLeft <= 0 || allPlayersGuessed)) {
       endRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, currentRoundData, timeLeft, playerId, roundHasEnded]);


  const handleGuess = async () => {
    if (!playerId || !selectedLanguage || !currentRoundData || playerHasGuessed) return;
    
    startTransition(async () => {
        const guessTime = Timestamp.now().seconds - currentRoundData.startTime.seconds;
        const isCorrect = selectedLanguage.toLowerCase() === currentRoundData.snippet.solution.toLowerCase();
        
        try {
        const gameRef = doc(db, "games", gameId as string);
        await updateDoc(gameRef, {
            [`rounds.${game.currentRound}.guesses.${playerId}`]: {
            language: selectedLanguage,
            time: guessTime,
            correct: isCorrect,
            }
        });
        setSelectedLanguage("");
        } catch (error) {
            console.error("Error submitting guess:", error);
            toast({ title: "Couldn't submit guess", variant: "destructive" });
        }
    });
  };
  
  const endRound = async () => {
    if (isPending) return;
    startTransition(async () => {
        const gameRef = doc(db, 'games', gameId as string);
        try {
             await runTransaction(db, async (transaction) => {
                const gameDoc = await transaction.get(gameRef);
                if (!gameDoc.exists()) throw new Error("Game not found!");

                const gameData = gameDoc.data() as GameState;
                const currentRound = gameData.rounds[gameData.currentRound];
                
                // Prevent re-calculating if results already exist
                if (currentRound.results) return;

                const newPlayers = [...gameData.players];
                const roundResults: Round['results'] = {};

                newPlayers.forEach(player => {
                    const guess = currentRound.guesses[player.id];
                    let scoreChange = 0;
                    if (guess) {
                        if (guess.correct) {
                            // Base score + time bonus
                            scoreChange = 50 + Math.max(0, (ROUND_TIME - guess.time) * 5);
                        } else {
                            scoreChange = -25;
                        }
                    }
                    player.score += scoreChange;
                    player.score = Math.max(0, player.score); // No negative total scores
                    roundResults[player.id] = { scoreChange, newScore: player.score };
                });
                
                const isLastRound = gameData.currentRound >= gameData.settings.rounds;
                
                transaction.update(gameRef, {
                    players: newPlayers,
                    status: isLastRound ? 'finished' : 'playing',
                    currentRound: isLastRound ? gameData.currentRound : gameData.currentRound + 1,
                    [`rounds.${gameData.currentRound}.results`]: roundResults,
                });
             });

        } catch(e) {
            console.error("Failed to end round: ", e);
            toast({ title: "Error ending round", variant: "destructive" });
        }
    });
  }


  if (loading || !isClient || !game ) {
    return (
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }
  
  if (game.status === 'finished') {
     return (
        <main className="min-h-screen container mx-auto p-4 md:py-8 flex items-center justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><Trophy/> Game Over!</CardTitle>
                    <CardDescription>Here are the final results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {game.players.sort((a,b) => b.score - a.score).map((p, index) => (
                        <div key={p.id} className="flex justify-between items-center p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-bold w-8 text-center">{index + 1}</span>
                                <span className="font-medium">{p.name} {p.id === playerId ? '(You)' : ''}</span>
                            </div>
                            <span className="font-bold text-lg">{p.score} pts</span>
                        </div>
                    ))}
                    <Button onClick={() => router.push('/multiplayer')} className="w-full">Play Again</Button>
                </CardContent>
            </Card>
        </main>
     )
  }
  
  if (!currentRoundData) {
     return (
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Starting round {game?.currentRound || 1}...</p>
      </div>
    );
  }

  
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
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle>Round {game.currentRound} of {game.settings.rounds}</CardTitle>
                            <div className="text-lg font-bold">Time Left: {timeLeft}s</div>
                        </div>
                        <Progress value={(timeLeft / ROUND_TIME) * 100} className="w-full h-2" />
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
                        {playerHasGuessed || roundHasEnded ? (
                             <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>
                                    {roundHasEnded ? "Round Over!" : "Guess Submitted!"}
                                </AlertTitle>
                                <AlertDescription>
                                    {roundHasEnded ? "Calculating scores..." : `You guessed ${currentRoundData.guesses[playerId!]?.language}. Waiting for other players...`}
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
