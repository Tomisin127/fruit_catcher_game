'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData, type Hex } from 'viem';
import { Attribution } from 'ox/erc8021';
import { GameCanvas } from './GameCanvas';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { GameOverScreen } from '../ui/GameOverScreen';
import { Button } from '../ui/button';
import { SwapModal } from '../ui/SwapModal';
import { WalletSelector } from '../WalletSelector';
import { toast } from 'sonner';
import { ArrowLeftRight, Zap, Trophy, Cherry, Citrus, Grape } from 'lucide-react';

// Fruits Token Contract - ERC20 with mint function
const SCORE_CONTRACT_ADDRESS = '0x96AE679AB8bFec71Dc1fdFEDe80f3912900BB49f' as `0x${string}`;
const SCORE_CONTRACT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const;

// Create the encoded data suffix with your builder code
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_agh0doqb'], // Your builder code from base.dev > Settings > Builder Codes
});

export function FruitCatchGame() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [hasMintedThisGame, setHasMintedThisGame] = useState(false);

  const { isConnected } = useAccount();
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    // Load high score from localStorage
    const saved = localStorage.getItem('fruitCatchHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      setIsClaiming(false);
      toast.success('Fruits tokens minted successfully!');
    }
  }, [isConfirmed]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleComboUpdate = useCallback((newCombo: number) => {
    setCombo(newCombo);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setIsGameOver(true);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('fruitCatchHighScore', finalScore.toString());
    }
  }, [highScore]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setIsClaiming(false);
    setHasMintedThisGame(false);
    setGameKey(prev => prev + 1);
  }, []);

  const handleBackToHome = useCallback(() => {
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setIsClaiming(false);
    setHasMintedThisGame(false);
    setIsStarted(false);
    setGameKey(prev => prev + 1);
  }, []);

  const handleClaimScore = useCallback(async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (score === 0) {
      toast.error('No score to claim');
      return;
    }

    if (hasMintedThisGame) {
      return;
    }

    setIsClaiming(true);
    setHasMintedThisGame(true);
    
    try {
      const tokensToMint = BigInt(score) * BigInt(10 ** 18);
      
      const functionData = encodeFunctionData({
        abi: SCORE_CONTRACT_ABI,
        functionName: 'mint',
        args: [tokensToMint],
      });

      const dataWithSuffix = (functionData + DATA_SUFFIX.slice(2)) as Hex;

      sendTransaction({
        to: SCORE_CONTRACT_ADDRESS,
        value: BigInt(1),
        data: dataWithSuffix,
      });

      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      toast.error('Failed to mint tokens. Please try again.');
      setIsClaiming(false);
      setHasMintedThisGame(false);
    }
  }, [score, isConnected, sendTransaction, hasMintedThisGame]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
  }, []);

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Floating fruit icons */}
          <div className="absolute top-20 right-[15%] animate-float text-4xl" style={{ animationDelay: '0.5s' }}>
            <Cherry className="w-8 h-8 text-destructive/40" />
          </div>
          <div className="absolute top-[40%] left-[10%] animate-float text-4xl" style={{ animationDelay: '1.5s' }}>
            <Citrus className="w-10 h-10 text-accent/40" />
          </div>
          <div className="absolute bottom-[30%] right-[10%] animate-float text-4xl" style={{ animationDelay: '0.8s' }}>
            <Grape className="w-8 h-8 text-secondary/40" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          {/* Header with wallet */}
          <div className="absolute top-4 right-4">
            <WalletSelector />
          </div>

          <div className="max-w-md w-full space-y-6">
            {/* Logo and title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center">
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                    <span className="text-primary neon-text">FRUIT</span>
                    <span className="text-foreground">CATCH</span>
                  </h1>
                  <div className="absolute -top-2 -right-4 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    BASE
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Catch fruits. Earn tokens. Trade on Base.
              </p>
            </div>

            {/* High Score Badge */}
            {highScore > 0 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-full">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">High Score: {highScore}</span>
                </div>
              </div>
            )}

            {/* Game rules card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-5 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                How to Play
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                  <div className="text-3xl flex-shrink-0">
                    <Cherry className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <div className="text-foreground font-semibold">Strawberry</div>
                    <div className="text-muted-foreground text-sm">+10 points</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                  <div className="text-3xl flex-shrink-0">
                    <Citrus className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-foreground font-semibold">Banana</div>
                    <div className="text-muted-foreground text-sm">+20 points (faster)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                  <div className="text-3xl flex-shrink-0">
                    <Grape className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <div className="text-foreground font-semibold">Watermelon</div>
                    <div className="text-muted-foreground text-sm">+30 points (rare)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-destructive text-sm pt-2 border-t border-border">
                <span className="text-lg">!</span>
                <span>Miss a fruit and it&apos;s game over</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold py-6 text-xl rounded-2xl shadow-lg animate-pulse-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Game
              </Button>

              <SwapModal 
                trigger={
                  <Button
                    variant="outline"
                    className="w-full border-2 border-primary/50 bg-primary/5 text-primary font-semibold py-5 text-lg rounded-2xl hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  >
                    <ArrowLeftRight className="w-5 h-5 mr-2" />
                    Swap FRUITS Token
                  </Button>
                }
              />
            </div>

            {/* Wallet connection status */}
            {isConnected ? (
              <div className="flex items-center justify-center gap-2 text-secondary text-sm">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span>Wallet connected - Ready to earn on Base</span>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                Connect wallet to mint your score as FRUITS tokens
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative">
        <ScoreDisplay score={score} combo={combo} />
        
        <GameCanvas
          key={gameKey}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          onComboUpdate={handleComboUpdate}
        />

        {isGameOver && (
          <GameOverScreen
            score={score}
            highScore={highScore}
            onRestart={handleRestart}
            onBackToHome={handleBackToHome}
            onClaimScore={handleClaimScore}
            isNewHighScore={score > 0 && score >= highScore}
            isClaiming={isClaiming || isPending || isConfirming}
            hasMintedThisGame={hasMintedThisGame}
          />
        )}
      </div>
    </div>
  );
}
