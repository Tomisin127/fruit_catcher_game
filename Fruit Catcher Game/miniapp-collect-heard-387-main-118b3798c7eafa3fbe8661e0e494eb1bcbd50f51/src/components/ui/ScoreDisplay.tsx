'use client';

interface ScoreDisplayProps {
  score: number;
  combo: number;
}

export function ScoreDisplay({ score, combo }: ScoreDisplayProps) {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-between px-6 pointer-events-none z-10">
      <div className="text-left">
        <div className="text-white/60 text-sm font-medium">SCORE</div>
        <div className="text-white text-3xl font-bold tracking-wider">{score}</div>
      </div>
      
      {combo > 1 && (
        <div className="text-right animate-pulse">
          <div className="text-yellow-400/80 text-sm font-medium">COMBO</div>
          <div className="text-yellow-400 text-3xl font-bold">x{combo}</div>
        </div>
      )}
    </div>
  );
}
