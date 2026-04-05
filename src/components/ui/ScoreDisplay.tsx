'use client';

import { Zap, Star } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between px-4 pointer-events-none z-10">
      {/* Score */}
      <div className="bg-white/90 backdrop-blur-md border border-border rounded-2xl px-5 py-3 card-shadow">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-medium mb-0.5">
          <Star className="w-3 h-3" />
          <span>Score</span>
        </div>
        <div className="text-3xl font-black gradient-text tracking-tight">{score}</div>
      </div>
      
      {/* Combo */}
      {combo > 1 && (
        <div className="bg-gradient-to-r from-accent/20 to-orange/20 backdrop-blur-md border border-accent/40 rounded-2xl px-5 py-3 animate-bounce-soft">
          <div className="flex items-center gap-1.5 text-orange text-xs uppercase tracking-wider font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Combo</span>
          </div>
          <div className="text-3xl font-black text-orange">x{combo}</div>
        </div>
      )}
    </div>
  );
}
