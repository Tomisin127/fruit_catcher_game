export type FruitType = 'strawberry' | 'banana' | 'watermelon';

export interface FruitConfig {
  type: FruitType;
  points: number;
  color: number;
  glowColor: number;
  scale: number;
  fallSpeed: number;
  probability: number;
}

export interface GameState {
  score: number;
  highScore: number;
  isPlaying: boolean;
  isGameOver: boolean;
  combo: number;
  difficulty: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}
