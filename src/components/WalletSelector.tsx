'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WalletSelector() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-500 font-semibold">Connected</div>
          <div className="text-sm font-mono font-bold text-gray-700">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Try to find the Base Account connector first (preferred in Base App)
  const baseAccountConnector = connectors.find(c => c.id === 'baseAccount');
  const injectedConnector = connectors.find(c => c.id === 'injected');
  const preferredConnector = baseAccountConnector || injectedConnector;

  return (
    <Button
      onClick={() => {
        if (preferredConnector) {
          connect({ connector: preferredConnector });
        }
      }}
      disabled={isPending}
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:scale-[1.02] transition-all"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
      <ChevronDown className="w-4 h-4 ml-1" />
    </Button>
  );
}
