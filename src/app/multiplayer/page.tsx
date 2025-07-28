
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function MultiplayerHome() {
  const router = useRouter();
  const [gameId, setGameId] = useState("");

  const joinGame = () => {
    if (gameId.trim()) {
      router.push(`/multiplayer/lobby/${gameId.trim()}`);
    }
  };

  return (
    <main className="min-h-screen container mx-auto p-4 md:py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Gamepad2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Multiplayer</CardTitle>
            <CardDescription>Create a game or join an existing one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/multiplayer/create" className="block">
                <Button className="w-full" size="lg">Create New Game</Button>
            </Link>
            
            <div className="flex items-center gap-2">
                <hr className="w-full" />
                <span className="text-muted-foreground text-sm">OR</span>
                <hr className="w-full" />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter Game ID..."
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
              <Button onClick={joinGame} className="w-full" variant="secondary">Join Game</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
