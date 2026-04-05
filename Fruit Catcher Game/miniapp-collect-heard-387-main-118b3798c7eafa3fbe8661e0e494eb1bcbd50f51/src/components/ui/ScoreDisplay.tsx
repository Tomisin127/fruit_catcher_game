'use client';

import { Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between px-4 pointer-events-none z-10">
      {/* Score */}
      <div className="bg-card/80 backdrop-blur-md border border-border rounded-xl px-4 py-2">
        <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Score</div>
        <div className="text-primary text-2xl font-black tracking-tight">{score}</div>
      </div>
      
      {/* Combo */}
      {combo > 1 && (
        <div className="bg-accent/20 backdrop-blur-md border border-accent/30 rounded-xl px-4 py-2 animate-pulse">
          <div className="flex items-center gap-1 text-accent text-xs uppercase tracking-wider font-medium">
            <Zap className="w-3 h-3" />
            <span>Combo</span>
          </div>
          <div className="text-accent text-2xl font-black">x{combo}</div>
        </div>
      )}
    </div>
  );
}
