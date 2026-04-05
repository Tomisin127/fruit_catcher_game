'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletSelector() {
  return (
    <ConnectButton 
      chainStatus="icon"
      accountStatus="address"
      showBalance={false}
    />
  );
}
