'use client';

import { Zap, Star, Trophy } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 pointer-events-none z-10">
      {/* Score */}
      <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-4 shadow-lg">
        <div className="flex items-center gap-2 text-gray-600 text-xs uppercase tracking-widest font-bold mb-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>Score</span>
        </div>
        <div className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{score}</div>
      </div>
      
      {/* Combo - Center */}
      {combo > 1 && (
        <div className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 backdrop-blur-md border border-yellow-200/50 rounded-2xl px-6 py-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-red-600 text-xs uppercase tracking-widest font-black">
            <Zap className="w-5 h-5 fill-red-600" />
            <span>Combo</span>
          </div>
          <div className="text-4xl font-black text-red-600">x{combo}</div>
        </div>
      )}

      {/* High Score - Right */}
      <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl px-6 py-4 shadow-lg">
        <div className="flex items-center gap-2 text-gray-600 text-xs uppercase tracking-widest font-bold mb-1">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Fruits</span>
        </div>
        <div className="text-2xl font-black text-purple-600">Caught</div>
      </div>
    </div>
  );
}
