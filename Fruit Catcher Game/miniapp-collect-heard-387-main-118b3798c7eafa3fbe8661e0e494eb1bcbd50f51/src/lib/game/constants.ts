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
    color: 0xFF10F0, // Neon pink
    glowColor: 0xFF69B4,
    scale: 0.7,
    fallSpeed: 0.3, // Slower initial speed
    probability: 0.6,
  },
  banana: {
    type: 'banana',
    points: 20,
    color: 0xFFFF00, // Neon yellow
    glowColor: 0xFFFF99,
    scale: 0.8,
    fallSpeed: 0.5, // Faster but still reasonable
    probability: 0.3,
  },
  watermelon: {
    type: 'watermelon',
    points: 30,
    color: 0x00FF88, // Neon green
    glowColor: 0x88FFAA,
    scale: 1.2,
    fallSpeed: 0.25, // Heavy fruit falls slower initially
    probability: 0.1,
  },
};

export const COLORS = {
  background: 0x050510, // Midnight blue
  basketMain: 0x00CCFF, // Cyan
  basketGlow: 0x88EEFF,
};
