
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


// This is a placeholder for a real user object, maybe from a real auth system later
interface Player {
    id: string;
    name: string;
    isHost?: boolean;
    score: number;
}

interface GameState {
    settings: {
        rounds: number;
        difficulty: string;
        languages: string[];
    };
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    hostId?: string;
}

export default function Lobby() {
    const { gameId } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [game, setGame] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [playerName, setPlayerName] = useState("");
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

    // Get or create a unique player ID
    const getPlayerId = () => {
        let playerId = localStorage.getItem("playerId");
        if (!playerId) {
            playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("playerId", playerId);
        }
        return playerId;
    }
    
    useEffect(() => {
        if (!gameId) return;

        const unsub = onSnapshot(doc(db, "games", gameId as string), (doc) => {
            if (doc.exists()) {
                const gameData = doc.data() as GameState;
                setGame(gameData);
                
                const playerId = getPlayerId();
                const playerInGame = gameData.players.find(p => p.id === playerId);
                if(playerInGame) {
                    setCurrentPlayer(playerInGame);
                }

            } else {
                console.error("Game not found");
                router.push("/multiplayer");
            }
            setLoading(false);
        });

        return () => unsub();
    }, [gameId, router]);


    const joinLobby = async () => {
        if (!playerName.trim() || !gameId) return;
        
        const playerId = getPlayerId();
        const newPlayer: Player = {
            id: playerId,
            name: playerName,
            score: 0,
            isHost: !game?.players.length // First player is the host
        };
        
        try {
            const gameRef = doc(db, "games", gameId as string);
            await updateDoc(gameRef, {
                players: arrayUnion(newPlayer),
                ...(newPlayer.isHost && { hostId: newPlayer.id })
            });
            setCurrentPlayer(newPlayer);

        } catch (error) {
            console.error("Error joining lobby:", error);
        }
    };
    
    const copyGameId = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(gameId as string);
            toast({ title: "Game ID copied to clipboard!" });
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen container mx-auto p-4 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Joining lobby...</p>
            </div>
        )
    }

    if (!game) {
        return <p>Game not found.</p>
    }

    if (!currentPlayer) {
        return (
            <div className="min-h-screen container mx-auto p-4 flex items-center justify-center">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Enter Your Name</CardTitle>
                        <CardDescription>Choose a name to join the lobby.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Input 
                            placeholder="Your awesome name..."
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                        <Button onClick={joinLobby}>Join Lobby</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }


  return (
    <main className="min-h-screen container mx-auto p-4 md:py-8">
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Lobby: Waiting for Players</CardTitle>
            <CardDescription>Share the game ID with your friends to let them join.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-3 border rounded-md bg-muted">
                <p className="text-lg font-mono flex-1 overflow-x-auto">{gameId}</p>
                <Button variant="ghost" size="icon" onClick={copyGameId}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Players ({game.players.length})</h3>
                <div className="space-y-3">
                    {game.players.map(player => (
                        <div key={player.id} className="flex items-center gap-4 p-2 rounded-md border">
                             <Avatar>
                                <AvatarImage src={`https://placehold.co/128x128.png`} data-ai-hint="avatar" />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <p className="font-medium flex-1">{player.name} {player.id === currentPlayer.id && "(You)"}</p>
                            {player.isHost && <span className="text-xs font-bold text-primary rounded-full bg-primary/10 px-2 py-1">HOST</span>}
                        </div>
                    ))}
                </div>
            </div>

            {currentPlayer.isHost && (
                <Button className="w-full" size="lg" disabled={game.players.length < 1}>
                    Start Game ({game.players.length} players)
                </Button>
            )}

            {!currentPlayer.isHost && (
                <div className="text-center text-muted-foreground">
                    <p>Waiting for the host to start the game...</p>
                </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
