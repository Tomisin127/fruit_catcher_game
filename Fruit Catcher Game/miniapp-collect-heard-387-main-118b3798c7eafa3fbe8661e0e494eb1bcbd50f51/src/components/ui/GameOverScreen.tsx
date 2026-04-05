'use client';

import { Button } from './button';
import { useAccount } from 'wagmi';
import { WalletSelector } from '../WalletSelector';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onClaimScore: () => void;
  isNewHighScore: boolean;
  isClaiming: boolean;
  hasMintedThisGame: boolean;
}

export function GameOverScreen({
  score,
  highScore,
  onRestart,
  onClaimScore,
  isNewHighScore,
  isClaiming,
  hasMintedThisGame,
}: GameOverScreenProps) {
  const { isConnected } = useAccount();

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-8 max-w-md w-full space-y-6 border-2 border-white/20 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-white">Game Over!</h2>
          {isNewHighScore && (
            <div className="text-2xl font-bold text-yellow-300 animate-pulse">
              🎉 New High Score! 🎉
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-white/60 text-sm">Final Score</div>
            <div className="text-5xl font-bold text-white">{score}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-white/60 text-sm">High Score</div>
            <div className="text-3xl font-bold text-white">{highScore}</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            🎮 Play Again
          </Button>

          {isConnected ? (
            <Button
              onClick={onClaimScore}
              disabled={isClaiming || score === 0 || hasMintedThisGame}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {hasMintedThisGame ? '✓ Tokens Minted!' : (isClaiming ? 'Minting...' : `Mint ${score} Fruits Tokens 🍓`)}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-white/80 text-sm text-center">
                Connect wallet to mint Fruits tokens on Base
              </div>
              <div className="flex justify-center">
                <WalletSelector />
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-white/40 text-xs pt-2">
          Scores are minted on Base
        </div>
      </div>
    </div>
  );
}
