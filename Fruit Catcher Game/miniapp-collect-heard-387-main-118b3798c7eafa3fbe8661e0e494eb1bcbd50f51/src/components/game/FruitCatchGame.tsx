'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData, type Hex } from 'viem';
import { Attribution } from 'ox/erc8021';
import { GameCanvas } from './GameCanvas';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { GameOverScreen } from '../ui/GameOverScreen';
import { Button } from '../ui/button';
import { toast } from 'sonner';

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
      toast.success('Fruits tokens minted successfully! 🎉');
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
    setHasMintedThisGame(false); // Reset mint tracking for new game
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
      return; // Already minted for this game
    }

    setIsClaiming(true);
    setHasMintedThisGame(true); // Mark as minted immediately
    
    try {
      // Mint Fruits tokens equal to your score (requires 1 wei payment)
      // Convert score to wei (multiply by 10^18 for ERC20 decimals)
      const tokensToMint = BigInt(score) * BigInt(10 ** 18);
      
      // Encode the function call data
      const functionData = encodeFunctionData({
        abi: SCORE_CONTRACT_ABI,
        functionName: 'mint',
        args: [tokensToMint],
      });

      // Manually append ERC-8021 data suffix to ensure it's included in the transaction
      // This ensures the builder code is always present, regardless of wallet capability support
      const dataWithSuffix = (functionData + DATA_SUFFIX.slice(2)) as Hex;

      // Send the transaction with the complete data including ERC-8021 attribution
      sendTransaction({
        to: SCORE_CONTRACT_ADDRESS,
        value: BigInt(1), // Send 1 wei as required by the contract
        data: dataWithSuffix,
      });

      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      toast.error('Failed to mint tokens. Please try again.');
      setIsClaiming(false);
      setHasMintedThisGame(false); // Reset on error
    }
  }, [score, isConnected, sendTransaction, hasMintedThisGame]);

  const handleStart = useCallback(() => {
    setIsStarted(true);
  }, []);

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">

        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">
              Fruit<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Catch</span>
            </h1>
            <p className="text-white/60 text-lg">
              Catch falling fruits with your basket!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-4">
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍓</div>
                <div>
                  <div className="text-white font-medium">Strawberry</div>
                  <div className="text-white/60 text-sm">10 points</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍌</div>
                <div>
                  <div className="text-white font-medium">Banana</div>
                  <div className="text-white/60 text-sm">20 points (faster!)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍉</div>
                <div>
                  <div className="text-white font-medium">Watermelon</div>
                  <div className="text-white/60 text-sm">30 points (rare!)</div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/80 text-sm">
                ⚠️ Miss a fruit and it&apos;s game over!
              </p>
            </div>
          </div>

          {highScore > 0 && (
            <div className="text-white/60">
              High Score: <span className="text-white font-bold">{highScore}</span>
            </div>
          )}

          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-6 text-xl rounded-xl shadow-lg"
          >
            Start Game
          </Button>

          {isConnected && (
            <div className="text-green-400 text-sm">
              ✓ Wallet connected - ready to mint Fruits tokens on Base!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">

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
