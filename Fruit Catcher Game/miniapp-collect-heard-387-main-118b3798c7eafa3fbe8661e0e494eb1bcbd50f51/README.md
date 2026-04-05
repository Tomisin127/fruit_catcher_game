# 🍓 FruitCatch - On-Chain Arcade Game

A vibrant 2D fruit-catching game built with Next.js, PixiJS, and OnchainKit. Catch falling fruits, build combos, and claim your high scores on Base!

## 🎮 Game Features

- **Touch-Optimized Controls**: Basket follows your finger in real-time
- **Three Fruit Types**: 
  - 🍓 Strawberry (10 points)
  - 🍌 Banana (20 points, faster!)
  - 🍉 Watermelon (30 points, rare!)
- **One-Strike Gameplay**: Miss a fruit and it's game over!
- **Combo System**: Build combos for multiplier bonuses
- **Dynamic Difficulty**: Game gets progressively harder
- **Particle Effects**: Satisfying visual feedback on catches
- **Haptic Feedback**: Vibration on mobile devices
- **Musical Sounds**: Combo-based audio feedback

## 🔗 Blockchain Integration

### Connect Your Wallet
- Uses **OnchainKit** for seamless wallet connections
- Supports **Base App** and other major wallets
- Built on **Base network** for fast, low-cost transactions

### Claim Scores On-Chain
After game over, connect your wallet and claim your score as an on-chain transaction!

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file:

```env
# Get your API key from https://portal.cdp.coinbase.com/products/onchainkit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# Your smart contract address (see below)
NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS=0x...
```

### 3. Deploy Your Score Contract (Optional)
The game includes a placeholder for a score claiming contract. To enable on-chain score claiming:

1. **Deploy a contract** on Base with a `claimScore(uint256 score)` function
2. **Update the contract address** in `src/components/game/FruitCatchGame.tsx`:
   ```typescript
   const SCORE_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS' as `0x${string}`;
   ```
3. **Update the ABI** if your contract has a different interface

### 4. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

## 🏗️ Tech Stack

- **Next.js 15** - React framework
- **PixiJS 8** - High-performance 2D rendering
- **OnchainKit** - Coinbase wallet components
- **Wagmi & Viem** - Ethereum interactions
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main entry point
│   ├── providers.tsx         # Wallet providers
│   └── layout.tsx            # App layout
├── components/
│   ├── game/
│   │   ├── FruitCatchGame.tsx   # Main game component
│   │   └── GameCanvas.tsx       # PixiJS canvas & game loop
│   ├── ui/
│   │   ├── ScoreDisplay.tsx     # Score HUD
│   │   └── GameOverScreen.tsx   # Game over UI
│   └── WalletConnect.tsx        # Wallet connection button
├── lib/
│   └── game/
│       ├── entities/
│       │   ├── Fruit.ts         # Fruit entity
│       │   └── Basket.ts        # Basket entity
│       ├── systems/
│       │   ├── CollisionSystem.ts  # Collision detection
│       │   ├── SpawnSystem.ts      # Fruit spawning
│       │   └── ParticleSystem.ts   # Particle effects
│       └── constants.ts         # Game configuration
└── types/
    └── game.ts                  # TypeScript types
```

## 🎯 Game Mechanics

### Scoring
- Each fruit type has a base point value
- **Near-miss bonus**: 1.5x multiplier when barely catching a fruit
- **Combo system**: Consecutive catches build multiplier

### Difficulty Scaling
The game dynamically adjusts difficulty over time:
- Fruits spawn more frequently
- Fruits fall faster
- Rare fruits appear more often

### Physics
- Realistic fruit falling with acceleration
- Smooth basket interpolation
- Responsive touch controls with no lag

## 🔐 Smart Contract Integration

The game expects a contract with this interface:

```solidity
interface IScoreContract {
    function claimScore(uint256 score) external;
}
```

You can extend this to:
- Mint NFT achievements
- Create leaderboards
- Award prizes for high scores
- Build tournaments

## 🌐 Deployment

Deploy to Vercel:
```bash
vercel deploy
```

Make sure to set your environment variables in Vercel dashboard!

## 📝 License

MIT License - feel free to use this for your own games!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new fruit types
- Create power-ups
- Improve particle effects
- Add sound effects
- Build leaderboard features

## 💡 Future Ideas

- [ ] NFT skins for baskets
- [ ] Multiplayer tournaments
- [ ] Power-ups (slow-motion, shield, etc.)
- [ ] Daily challenges
- [ ] Leaderboard contract
- [ ] Achievement system
- [ ] Social sharing

---

Built with ❤️ using OnchainKit and Base
