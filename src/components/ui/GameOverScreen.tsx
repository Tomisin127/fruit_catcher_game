'use client';

import { Button } from './button';
import { useAccount } from 'wagmi';
import { WalletSelector } from '../WalletSelector';
import { SwapModal } from './SwapModal';
import { Trophy, RotateCcw, Home, Coins, ArrowLeftRight, Sparkles, Check, Loader2, Star, Zap } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onBackToHome: () => void;
  onClaimScore: () => void;
  isNewHighScore: boolean;
  isClaiming: boolean;
  hasMintedThisGame: boolean;
}

export function GameOverScreen({
  score,
  highScore,
  onRestart,
  onBackToHome,
  onClaimScore,
  isNewHighScore,
  isClaiming,
  hasMintedThisGame,
}: GameOverScreenProps) {
  const { isConnected } = useAccount();

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-border rounded-3xl p-7 max-w-sm w-full space-y-6 card-shadow">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-strawberry/10 rounded-full mb-2">
            <Star className="w-8 h-8 text-strawberry" />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight">Game Over</h2>
          {isNewHighScore && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/30 to-orange/20 text-foreground px-5 py-2.5 rounded-full animate-bounce-soft border border-accent/40">
              <Sparkles className="w-5 h-5 text-orange" />
              <span className="font-bold">New High Score!</span>
              <Sparkles className="w-5 h-5 text-orange" />
            </div>
          )}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-strawberry/5 border border-strawberry/20 rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3" />
              <span>Final Score</span>
            </div>
            <div className="text-4xl font-black gradient-text">{score}</div>
          </div>

          <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </div>
            <div className="text-4xl font-black text-secondary">{highScore}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Play Again - Primary CTA */}
          <Button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-strawberry via-grape to-secondary text-white font-bold py-4 text-base rounded-lg shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>

          {/* Mint Tokens */}
          {isConnected ? (
            <Button
              onClick={onClaimScore}
              disabled={isClaiming || score === 0 || hasMintedThisGame}
              className={`w-full font-bold py-4 text-base rounded-lg shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                hasMintedThisGame
                  ? 'bg-secondary/10 text-secondary border-2 border-secondary/30'
                  : 'bg-gradient-to-r from-secondary to-secondary/80 text-white hover:shadow-lg'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {hasMintedThisGame ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Tokens Minted!
                </>
              ) : isClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Mint {score} FRUITS
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-muted-foreground text-sm">
                Connect wallet to mint tokens
              </p>
              <div className="flex justify-center">
                <WalletSelector />
              </div>
            </div>
          )}

          {/* Swap Button */}
          <SwapModal 
            trigger={
              <Button
                variant="outline"
                className="w-full border-2 border-secondary/30 bg-secondary/5 text-secondary font-semibold py-3 text-sm rounded-lg hover:bg-secondary/10 hover:border-secondary/50 transition-all duration-200"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Swap FRUITS
              </Button>
            }
          />

          {/* Back to Home - Secondary */}
          <Button
            onClick={onBackToHome}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground font-medium py-3 text-sm rounded-lg transition-all duration-200 hover:bg-muted"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-xs pt-1">
          Scores minted as FRUITS on Base
        </div>
      </div>
    </div>
  );
}
