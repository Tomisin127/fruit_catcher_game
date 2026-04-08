/**
 * FarcasterWrapper - Legacy component for Farcaster mini-app support
 * 
 * This component is a no-op in the Base App standard web app environment.
 * The app now uses wagmi + SIWE for authentication and wallet connection.
 * 
 * Kept for backwards compatibility but can be removed if not needed.
 */

interface FarcasterWrapperProps {
  children: React.ReactNode
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps): JSX.Element {
  // In the Base App, we no longer need Farcaster manifest signing.
  // The app works as a standard web app with wagmi connectors.
  return <>{children}</>;
}
