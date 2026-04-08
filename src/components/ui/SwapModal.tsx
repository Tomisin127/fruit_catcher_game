'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { 
  createPublicClient, 
  http, 
  formatEther, 
  parseEther, 
  encodeFunctionData,
  type Hex,
  fallback
} from 'viem';
import { base } from 'viem/chains';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { Button } from './button';
import { ArrowUpDown, Loader2, ExternalLink } from 'lucide-react';
import { WalletSelector } from '../WalletSelector';

// Contract addresses
const FRUITS_TOKEN = '0xad83e2f8f0304eafdab624364ec5a1ade9c19205' as const;
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;
const UNISWAP_V3_QUOTER = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as const;
const UNISWAP_V3_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481' as const;

// Multiple RPC endpoints for reliability
const BASE_RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://1rpc.io/base',
  'https://base.drpc.org'
];

// Create client with fallback transport
const publicClient = createPublicClient({
  chain: base,
  transport: fallback(BASE_RPC_URLS.map(url => http(url)))
});

// Pool fee tiers to try
const POOL_FEES = [10000, 3000, 500, 100] as const;

// ABIs
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

const QUOTER_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'fee', type: 'uint24' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' }
      ]
    }],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' }
    ]
  }
] as const;

const ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' }
      ]
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  },
  {
    name: 'multicall',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'deadline', type: 'uint256' },
      { name: 'data', type: 'bytes[]' }
    ],
    outputs: [{ name: 'results', type: 'bytes[]' }]
  },
  {
    name: 'unwrapWETH9',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountMinimum', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ],
    outputs: []
  }
] as const;

interface SwapModalProps {
  trigger?: React.ReactNode;
}

export function SwapModal({ trigger }: SwapModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(true);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [bestFee, setBestFee] = useState<number>(3000);
  const [slippage, setSlippage] = useState(5);

  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!address) return;

    try {
      const [ethBal, tokenBal] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: FRUITS_TOKEN,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address]
        })
      ]);

      setEthBalance(ethBal);
      setTokenBalance(tokenBal);

      // Check allowance if selling
      if (!isBuying && amount) {
        const allowance = await publicClient.readContract({
          address: FRUITS_TOKEN,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, UNISWAP_V3_ROUTER]
        });
        const amountToSwap = parseEther(amount);
        setNeedsApproval(allowance < amountToSwap);
      } else {
        setNeedsApproval(false);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, [address, isBuying]);

  // Get quote from Uniswap
  const getQuote = useCallback(async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);

    try {
      const amountIn = parseEther(inputAmount);
      const tokenIn = isBuying ? WETH_ADDRESS : FRUITS_TOKEN;
      const tokenOut = isBuying ? FRUITS_TOKEN : WETH_ADDRESS;

      // Try all fee tiers in parallel
      const quotePromises = POOL_FEES.map(async (fee) => {
        try {
          const data = encodeFunctionData({
            abi: QUOTER_ABI,
            functionName: 'quoteExactInputSingle',
            args: [{
              tokenIn,
              tokenOut,
              amountIn,
              fee,
              sqrtPriceLimitX96: 0n
            }]
          });

          const result = await publicClient.call({
            to: UNISWAP_V3_QUOTER,
            data
          });

          if (result.data) {
            // Decode the result - first 32 bytes is amountOut
            const amountOut = BigInt('0x' + result.data.slice(2, 66));
            return { fee, amountOut };
          }
          return null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(quotePromises);
      const validResults = results.filter((r): r is { fee: number; amountOut: bigint } => r !== null && r.amountOut > 0n);

      if (validResults.length > 0) {
        // Pick the best quote (highest output)
        const best = validResults.reduce((a, b) => a.amountOut > b.amountOut ? a : b);
        setBestFee(best.fee);
        setQuote(formatEther(best.amountOut));
      } else {
        setQuote(null);
      }
    } catch (error) {
      console.error('Quote error:', error);
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  }, [isBuying]);

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount) {
        getQuote(amount);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, getQuote]);

  // Fetch balances on mount and periodically
  useEffect(() => {
    if (isOpen && address) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, address, fetchBalances]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Swap completed successfully!');
      setAmount('');
      setQuote(null);
      fetchBalances();
    }
  }, [isConfirmed, fetchBalances]);

  const handleApprove = async () => {
    if (!address) return;

    setIsApproving(true);
    try {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V3_ROUTER, BigInt('1000000000') * BigInt(10 ** 18)]
      });

      sendTransaction({
        to: FRUITS_TOKEN,
        data
      });
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Approval failed');
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!address || !amount || !quote) return;

    try {
      const amountIn = parseEther(amount);
      const amountOutMin = parseEther(quote) * BigInt(100 - slippage) / 100n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes

      // Validate balance
      if (isBuying && amountIn > ethBalance) {
        toast.error('Insufficient ETH balance');
        return;
      }
      if (!isBuying && amountIn > tokenBalance) {
        toast.error('Insufficient FRUITS balance');
        return;
      }

      if (isBuying) {
        // ETH -> Token (Buy)
        const swapData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [{
            tokenIn: WETH_ADDRESS,
            tokenOut: FRUITS_TOKEN,
            fee: bestFee,
            recipient: address,
            amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n
          }]
        });

        const multicallData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: 'multicall',
          args: [deadline, [swapData]]
        });

        sendTransaction({
          to: UNISWAP_V3_ROUTER,
          value: amountIn,
          data: multicallData
        });
      } else {
        // Token -> ETH (Sell)
        const swapData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [{
            tokenIn: FRUITS_TOKEN,
            tokenOut: WETH_ADDRESS,
            fee: bestFee,
            recipient: UNISWAP_V3_ROUTER, // Send to router for unwrap
            amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n
          }]
        });

        const unwrapData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: 'unwrapWETH9',
          args: [amountOutMin, address]
        });

        const multicallData = encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: 'multicall',
          args: [deadline, [swapData, unwrapData]]
        });

        sendTransaction({
          to: UNISWAP_V3_ROUTER,
          data: multicallData
        });
      }

      toast.success('Transaction submitted!');
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error(error instanceof Error ? error.message : 'Swap failed');
    }
  };

  const handleMax = () => {
    if (isBuying) {
      // Use 90% of ETH balance to reserve for gas
      const maxAmount = (ethBalance * 90n) / 100n;
      setAmount(formatEther(maxAmount));
    } else {
      setAmount(formatEther(tokenBalance));
    }
  };

  const toggleDirection = () => {
    setIsBuying(!isBuying);
    setAmount('');
    setQuote(null);
  };

  const inputToken = isBuying ? 'ETH' : 'FRUITS';
  const outputToken = isBuying ? 'FRUITS' : 'ETH';
  const inputBalance = isBuying ? ethBalance : tokenBalance;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-primary to-accent text-foreground font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
            Swap FRUITS
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-white border-border rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-foreground text-center">
            Swap FRUITS
          </SheetTitle>
          <p className="text-muted-foreground text-sm text-center">Trade FRUITS token on Base</p>
        </SheetHeader>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">Connect your wallet to swap</p>
            <WalletSelector />
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => { setIsBuying(true); setAmount(''); setQuote(null); }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isBuying 
                    ? 'bg-secondary text-secondary-foreground shadow-lg' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Buy FRUITS
              </button>
              <button
                onClick={() => { setIsBuying(false); setAmount(''); setQuote(null); }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  !isBuying 
                    ? 'bg-destructive text-destructive-foreground shadow-lg' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sell FRUITS
              </button>
            </div>

            {/* Input Section */}
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">You pay</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {parseFloat(formatEther(inputBalance)).toFixed(4)} {inputToken}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
                />
                <span className="text-sm font-semibold text-foreground bg-background px-2 py-1 rounded-lg flex-shrink-0">
                  {inputToken}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Balance: {inputBalance ? parseFloat(inputBalance).toFixed(4) : '0.0'}
                </span>
                <button
                  onClick={handleMax}
                  className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md hover:bg-primary/30 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={toggleDirection}
                className="bg-card border-4 border-muted p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowUpDown className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Output Section */}
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">You receive</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-3xl font-bold text-foreground">
                  {isQuoting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : quote ? (
                    parseFloat(quote).toFixed(6)
                  ) : (
                    <span className="text-muted-foreground">0.0</span>
                  )}
                </div>
                <span className="text-lg font-semibold text-foreground bg-background px-3 py-1.5 rounded-lg">
                  {outputToken}
                </span>
              </div>
            </div>

            {/* Slippage */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
              <div className="flex gap-1">
                {[1, 3, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      slippage === s 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {!isBuying && needsApproval ? (
              <Button
                onClick={handleApprove}
                disabled={isApproving || isPending || isConfirming}
                className="w-full bg-gradient-to-r from-accent to-primary text-accent-foreground font-bold py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 transition-all duration-200"
              >
                {isApproving || isPending || isConfirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Approving...
                  </span>
                ) : (
                  'Approve FRUITS'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={!amount || !quote || isPending || isConfirming}
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold py-6 text-lg rounded-xl shadow-lg disabled:opacity-50 transition-all duration-200 hover:shadow-primary/30"
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isConfirming ? 'Confirming...' : 'Swapping...'}
                  </span>
                ) : (
                  `Swap ${inputToken} for ${outputToken}`
                )}
              </Button>
            )}

            {/* Transaction Hash */}
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                View on BaseScan <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Info */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              Powered by Uniswap V3 on Base
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
