# Migration to Base App Standard Web App

## Overview
This project has been migrated from a Farcaster mini-app to a Base App standard web application. The migration leverages wagmi + viem for wallet connectivity and removes dependency on the deprecated OnchainKit and Farcaster SDK.

## Changes Made

### 1. Provider Setup (`src/app/providers.tsx`)
- **Removed**: RainbowKit provider and OnchainKit dependencies
- **Updated**: Created Base App-compatible wagmi config with:
  - `baseAccount` connector (preferred in Base App)
  - `injected` connector (fallback)
  - Cookie storage for SSR compatibility
  - Base chain configuration

### 2. Wallet Connection (`src/components/WalletSelector.tsx`)
- **Replaced**: RainbowKit `ConnectButton` with custom wagmi-based implementation
- **Features**: 
  - Uses `useAccount`, `useConnect`, `useDisconnect` hooks from wagmi
  - Automatically prefers Base Account connector
  - Shows truncated wallet address when connected
  - Styled with Tailwind CSS to match app design

### 3. Farcaster Integration (`src/components/FarcasterWrapper.tsx`)
- **Simplified**: Converted to no-op component (just passes through children)
- **Reasoning**: Base App doesn't require manifest signing; standard web app mode is automatic
- **Note**: Can be removed entirely if no longer needed

### 4. Metadata (`src/app/layout.tsx`)
- **Removed**: Deprecated Farcaster frame metadata
- **Added**: Builder code: `bc_m2hcei0g`
- **Kept**: Base app_id: `6962553e8a6eeb04b568dc5d`
- **Removed**: OnchainKit CSS import

### 5. Dependencies (`package.json`)
- **Removed**:
  - `@coinbase/onchainkit` - No longer needed
  - `@rainbow-me/rainbowkit` - Using direct wagmi instead

## How to Use the App

### For Users in Base App
1. The app loads as a standard web app
2. Users can connect their wallet using the "Connect Wallet" button
3. The Base Account connector will be automatically preferred if available
4. Game plays on Base mainnet with FRUITS token minting

### For Users in Standard Browsers
1. The injected connector (MetaMask, etc.) is available as fallback
2. Same functionality and token minting on Base

## Authentication Pattern

The app uses wagmi hooks for authentication and wallet connection. For future sign-in features, implement Sign-In with Ethereum (SIWE):

```typescript
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';
import { useSignMessage } from 'wagmi';

// Generate SIWE message
const nonce = generateSiweNonce();
const message = createSiweMessage({
  address,
  chainId,
  domain: window.location.host,
  nonce,
  uri: window.location.origin,
  version: '1',
});

// Sign with wallet
const signature = await signMessageAsync({ message });
```

## Next Steps

1. **Register on Base.dev** (if not already done)
   - Complete app metadata
   - Ensure primary URL is set
   - Add builder code to project

2. **Test in Base App** (once registered)
   - Load the app URL in Base App in-app browser
   - Verify wallet connection works
   - Test FRUITS token minting

3. **Notifications** (when available)
   - Migrate from Neynar to Base.dev notifications API
   - Send wallet-address-based notifications

## Farcaster SDK Migration Reference

The following Farcaster SDK methods are replaced:

| Farcaster SDK | Base App Alternative |
|---|---|
| `sdk.signIn()` | `useSignMessage` + SIWE |
| `sdk.sendToken()` | `useWriteContract` + standard ERC-20 |
| `sdk.openUrl()` | `window.open()` |
| User context (FID) | `useAccount()` → wallet address |
| `sdk.isInMiniApp()` | No longer needed |

## Verification Checklist

- [x] Removed OnchainKit dependency
- [x] Updated to wagmi-only setup
- [x] Created Base App wagmi config
- [x] Updated wallet selector component
- [x] Removed Farcaster manifest signing
- [x] Added builder code to metadata
- [x] App loads in standard browsers
- [ ] Test in Base App in-app browser
- [ ] Verify wallet connection works
- [ ] Test FRUITS token minting

## Support

For issues or questions about the Base App migration, refer to:
- https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app
- https://docs.base.org/onchainkit/migrate-from-onchainkit
