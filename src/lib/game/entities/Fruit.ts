import * as PIXI from 'pixi.js';
import type { FruitConfig, Position, Velocity } from '@/types/game';
import { GAME_HEIGHT, GRAVITY } from '../constants';

// Pre-load textures cache
const textureCache: Map<string, PIXI.Texture> = new Map();

// Preload all fruit textures
export async function preloadFruitTextures(): Promise<void> {
  const fruitPaths = ['/strawberry.png', '/banana.png', '/watermelon.png', '/basket.png'];
  
  for (const path of fruitPaths) {
    try {
      const texture = await PIXI.Assets.load(path);
      textureCache.set(path, texture);
    } catch (error) {
      console.warn(`Failed to preload texture: ${path}`, error);
    }
  }
}

export class Fruit {
  public sprite: PIXI.Sprite | PIXI.Graphics;
  public position: Position;
  public velocity: Velocity;
  public config: FruitConfig;
  public radius: number;
  public caught: boolean = false;
  private glowSprite: PIXI.Graphics;
  private initialScale: number;

  constructor(x: number, config: FruitConfig) {
    this.config = config;
    this.initialScale = config.scale;
    this.radius = 20 * config.scale; // Bigger fruits for visibility
    
    this.position = { x, y: -this.radius * 2 };
    this.velocity = { x: 0, y: config.fallSpeed };

    // Create glow effect (outer circle)
    this.glowSprite = new PIXI.Graphics();
    this.glowSprite.circle(0, 0, this.radius * 1.3);
    this.glowSprite.fill({ color: config.glowColor, alpha: 0.4 });
    this.glowSprite.x = x;
    this.glowSprite.y = this.position.y;

    // Create main fruit sprite - use cached texture or fallback to graphics
    const imagePath = config.imagePath.startsWith('/') 
      ? config.imagePath 
      : `/${config.imagePath}`;
    
    const cachedTexture = textureCache.get(imagePath);
    
    if (cachedTexture && cachedTexture.valid) {
      this.sprite = new PIXI.Sprite(cachedTexture);
      this.sprite.width = this.radius * 2.5;
      this.sprite.height = this.radius * 2.5;
      this.sprite.anchor.set(0.5, 0.5);
    } else {
      // Fallback to colorful graphics
      this.sprite = new PIXI.Graphics();
      (this.sprite as PIXI.Graphics).circle(0, 0, this.radius);
      (this.sprite as PIXI.Graphics).fill({ color: config.color, alpha: 1 });
      // Add shine effect
      (this.sprite as PIXI.Graphics).circle(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3);
      (this.sprite as PIXI.Graphics).fill({ color: 0xFFFFFF, alpha: 0.4 });
    }
    
    this.sprite.x = x;
    this.sprite.y = this.position.y;
  }

  public update(deltaTime: number, difficulty: number): void {
    if (this.caught) return;

    // Apply gravity (natural acceleration)
    this.velocity.y += GRAVITY * deltaTime * 0.05;
    
    // Update position (deltaTime normalized to ~16.67ms frame time)
    this.position.y += this.velocity.y * (deltaTime / 16.67) * difficulty;

    // Squash and stretch effect based on velocity
    const stretchFactor = Math.min(this.velocity.y / 15, 0.3);
    const scaleY = this.initialScale * (1 + stretchFactor);
    const scaleX = this.initialScale * (1 / scaleY); // Volume preservation

    this.sprite.scale.y = scaleY;
    this.sprite.scale.x = scaleX;
    this.glowSprite.scale.y = scaleY;
    this.glowSprite.scale.x = scaleX;

    // Gentle breathing/undulation effect
    const breathe = Math.sin(Date.now() * 0.003) * 0.05;
    this.sprite.scale.x += breathe;
    this.sprite.scale.y += breathe;

    // Update sprite positions
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.glowSprite.x = this.position.x;
    this.glowSprite.y = this.position.y;
  }

  public isOffScreen(): boolean {
    return this.position.y > GAME_HEIGHT + this.radius * 2;
  }

  public getGlowSprite(): PIXI.Graphics {
    return this.glowSprite;
  }

  public destroy(): void {
    this.sprite.destroy();
    this.glowSprite.destroy();
  }
}
