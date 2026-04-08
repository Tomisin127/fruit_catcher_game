export interface FruitConfig {
  type: string;
  points: number;
  color: number;
  glowColor: number;
  scale: number;
  fallSpeed: number;
  probability: number;
  imagePath?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  highScore: number;
  isPlaying: boolean;
  isGameOver: boolean;
  combo: number;
  difficulty: number;
}

export interface AccountAssociation {
  address: string;
  domain: string;
  fid: number;
  username: string;
}
