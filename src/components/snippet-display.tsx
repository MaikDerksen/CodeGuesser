import { cn } from "@/lib/utils";

interface SnippetDisplayProps {
  snippet: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'HARDCORE';
}

export function SnippetDisplay({ snippet, difficulty }: SnippetDisplayProps) {
  const isOneLiner = difficulty === 'HARD' || difficulty === 'HARDCORE';
  
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
            <div className="text-sm text-muted-foreground font-medium rounded-md px-3 py-1 bg-muted">
                Difficulty: <span className="font-bold text-foreground">{difficulty}</span>
            </div>
        </div>
        <div className="p-4">
            <pre className="p-4 rounded-md bg-muted overflow-x-auto">
            <code className={cn(
                "font-code text-sm",
                isOneLiner && "whitespace-pre-wrap break-words"
            )}>
                {snippet}
            </code>
            </pre>
      </div>
    </div>
  );
}
