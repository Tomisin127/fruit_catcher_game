'use client';

import { Star, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="absolute top-3 left-0 right-0 flex justify-between items-start px-3 pointer-events-none z-10 gap-2">
      {/* Score */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-1 text-gray-600 text-xs font-bold mb-0.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span>Score</span>
        </div>
        <div className="text-2xl font-black text-orange-500">{score}</div>
      </div>
      
      {/* Combo - Center */}
      {combo > 1 && (
        <div className="bg-gradient-to-r from-yellow-200 to-orange-200 backdrop-blur-sm border border-yellow-300 rounded-lg px-3 py-2 shadow-md animate-pulse">
          <div className="flex items-center gap-1 text-orange-600 text-xs font-black">
            <Zap className="w-3 h-3 fill-orange-600" />
            <span>x{combo}</span>
          </div>
        </div>
      )}

      {/* Fruits Caught */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg px-3 py-2 shadow-md ml-auto">
        <div className="text-xs font-bold text-gray-600">🍓 Caught</div>
      </div>
    </div>
  );
}
