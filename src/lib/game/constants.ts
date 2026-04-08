import type { FruitConfig } from '@/types/game';

export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;

export const BASKET_Y = 0.88; // Normalized position (88% down from top)
export const BASKET_WIDTH = 80;
export const BASKET_HEIGHT = 40;

export const GRAVITY = 0.15; // Realistic gravity for natural falling
export const INITIAL_SPAWN_INTERVAL = 1500; // ms
export const MIN_SPAWN_INTERVAL = 600; // ms
export const SPAWN_DECAY_RATE = 0.05;

export const FRUIT_CONFIGS: Record<string, FruitConfig> = {
  strawberry: {
    type: 'strawberry',
    points: 10,
    color: 0xFF6B6B, // Coral red - bright and cheerful
    glowColor: 0xFFB3B3,
    scale: 0.7,
    fallSpeed: 0.3, // Slower initial speed
    probability: 0.6,
    imagePath: '/strawberry.png',
  },
  banana: {
    type: 'banana',
    points: 20,
    color: 0xFFE66D, // Sunny yellow
    glowColor: 0xFFF3B8,
    scale: 0.8,
    fallSpeed: 0.5, // Faster but still reasonable
    probability: 0.3,
    imagePath: '/banana.png',
  },
  watermelon: {
    type: 'watermelon',
    points: 30,
    color: 0x4ECDC4, // Teal/mint green
    glowColor: 0xA8E6E2,
    scale: 1.2,
    fallSpeed: 0.25, // Heavy fruit falls slower initially
    probability: 0.1,
    imagePath: '/watermelon.png',
  },
};

export const COLORS = {
  background: 0x87CEEB, // Sky blue - fresh and open
  basketMain: 0xD4A574, // Warm tan/beige for basket
  basketGlow: 0xE8C4A0,
};
