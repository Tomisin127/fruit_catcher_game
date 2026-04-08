'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WalletSelector() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, isError, error } = useConnect();
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

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleConnect}
        disabled={isPending || connectors.length === 0}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:scale-[1.02] transition-all"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
        <ChevronDown className="w-4 h-4 ml-1" />
      </Button>
      {isError && error && (
        <p className="text-xs text-red-600 text-center">
          {error.message || 'Connection failed'}
        </p>
      )}
    </div>
  );
}
