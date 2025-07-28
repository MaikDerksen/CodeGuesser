
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Difficulty } from "@/ai/flows/generate-code-snippet";
import { useEffect, useState } from "react";

interface SnippetDisplayProps {
  snippet: string;
  difficulty: Difficulty;
  difficulties: Difficulty[];
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export function SnippetDisplay({
  snippet,
  difficulty,
  difficulties,
  onDifficultyChange,
  disabled,
}: SnippetDisplayProps) {
  const isOneLiner = difficulty === 'HARD' || difficulty === 'HARDCORE';
  const isEasy = difficulty === 'EASY';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive/90"></span>
          </span>
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
        </div>
        <div className="p-4">
          <pre className="p-4 rounded-md bg-muted overflow-x-auto">
            <code className="font-code text-sm">Loading...</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive/90"></span>
          </span>
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <Button variant="outline" className="text-sm text-muted-foreground font-medium rounded-md px-3 py-1 bg-muted">
              Difficulty: <span className="font-bold text-foreground ml-1">{difficulty}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {difficulties.map((d) => (
              <DropdownMenuItem key={d} onSelect={() => onDifficultyChange(d)}>
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4">
        <pre className="p-4 rounded-md bg-muted overflow-x-auto">
          <code className={cn(
            "font-code text-sm",
            isOneLiner && "whitespace-pre-wrap break-words"
          )}>
            {isEasy ? (
              <span dangerouslySetInnerHTML={{ __html: snippet }} />
            ) : (
              snippet
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
