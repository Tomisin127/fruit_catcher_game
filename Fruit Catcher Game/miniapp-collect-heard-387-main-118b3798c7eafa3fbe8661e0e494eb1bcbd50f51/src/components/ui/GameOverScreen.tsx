'use client';

import { Button } from './button';
import { useAccount } from 'wagmi';
import { WalletSelector } from '../WalletSelector';
import { SwapModal } from './SwapModal';
import { Trophy, RotateCcw, Home, Coins, ArrowLeftRight, Sparkles, Check, Loader2 } from 'lucide-react';

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
    <div className="absolute inset-0 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-foreground tracking-tight">GAME OVER</h2>
          {isNewHighScore && (
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full animate-pulse">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">New High Score!</span>
              <Sparkles className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-2xl p-4 text-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Final Score</div>
            <div className="text-4xl font-black text-primary">{score}</div>
          </div>

          <div className="bg-muted rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs uppercase tracking-wider mb-1">
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </div>
            <div className="text-4xl font-black text-accent">{highScore}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Play Again - Primary CTA */}
          <Button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold py-5 text-lg rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>

          {/* Mint Tokens */}
          {isConnected ? (
            <Button
              onClick={onClaimScore}
              disabled={isClaiming || score === 0 || hasMintedThisGame}
              className={`w-full font-bold py-5 text-lg rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                hasMintedThisGame
                  ? 'bg-secondary/20 text-secondary border-2 border-secondary/30'
                  : 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {hasMintedThisGame ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Tokens Minted!
                </>
              ) : isClaiming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  Mint {score} FRUITS
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
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
                className="w-full border-2 border-primary/30 bg-primary/5 text-primary font-semibold py-4 text-base rounded-xl hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
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
            className="w-full text-muted-foreground hover:text-foreground font-medium py-4 text-base rounded-xl transition-all duration-200"
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
