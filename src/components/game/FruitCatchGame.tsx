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
import { ArrowLeftRight, Zap, Trophy, Cherry, Citrus, Grape, Sparkles, Play } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
        
        {/* Floating fruit icons */}
        <div className="absolute top-24 right-[18%] animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="bg-red-200/20 p-4 rounded-2xl">
            <Cherry className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <div className="absolute top-[45%] left-[8%] animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="bg-yellow-200/20 p-4 rounded-2xl">
            <Citrus className="w-14 h-14 text-yellow-500" />
          </div>
        </div>
        <div className="absolute bottom-[25%] right-[12%] animate-float" style={{ animationDelay: '0.8s' }}>
          <div className="bg-green-200/20 p-4 rounded-2xl">
            <Grape className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="absolute top-[65%] left-[15%] animate-float" style={{ animationDelay: '2s' }}>
          <Sparkles className="w-10 h-10 text-purple-300" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header with wallet */}
        <div className="absolute top-4 right-4">
          <WalletSelector />
        </div>

        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Fruit</span>
                  <span className="text-gray-800 ml-2">Catch</span>
                </h1>
                <div className="absolute -top-3 -right-8 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  BASE
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg font-semibold">
              Catch fruits. Earn tokens. Play on Base.
            </p>
          </div>

          {/* High Score Badge */}
          {highScore > 0 && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 text-gray-800 px-6 py-3 rounded-full shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span className="font-black text-lg">High Score: {highScore}</span>
              </div>
            </div>
          )}

          {/* Game rules card */}
          <div className="bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              How to Play
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl transition-all hover:bg-red-100">
                <div className="bg-red-200 p-3 rounded-xl">
                  <Cherry className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <div className="text-gray-800 font-bold">Strawberry</div>
                  <div className="text-gray-600 text-sm font-semibold">+10 points</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl transition-all hover:bg-yellow-100">
                <div className="bg-yellow-200 p-3 rounded-xl">
                  <Citrus className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <div className="text-gray-800 font-bold">Banana</div>
                  <div className="text-gray-600 text-sm font-semibold">+20 points (faster)</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl transition-all hover:bg-green-100">
                <div className="bg-green-200 p-3 rounded-xl">
                  <Grape className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <div className="text-gray-800 font-bold">Watermelon</div>
                  <div className="text-gray-600 text-sm font-semibold">+30 points (rare)</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-red-600 text-sm pt-4 border-t-2 border-gray-200 font-semibold">
              <div className="bg-red-100 p-2 rounded-lg">
                <span className="text-base font-black">!</span>
              </div>
              <span>Miss a fruit and it&apos;s game over</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black py-8 text-xl rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-2xl"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              Start Game
            </Button>

            <SwapModal 
              trigger={
                <Button
                  variant="outline"
                  className="w-full border-2 border-purple-300 bg-purple-50 text-purple-700 font-bold py-6 text-lg rounded-2xl hover:bg-purple-100 hover:border-purple-400 transition-all duration-300"
                >
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  Swap FRUITS Token
                </Button>
              }
            />
          </div>

          {/* Wallet connection status */}
          {isConnected ? (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-bold">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span>Wallet connected - Ready to earn on Base</span>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-sm font-semibold">
              Connect wallet to mint your score as FRUITS tokens
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
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
