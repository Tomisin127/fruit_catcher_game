import * as PIXI from 'pixi.js';
import type { FruitConfig, Position, Velocity } from '@/types/game';
import { GAME_HEIGHT, GRAVITY } from '../constants';

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
    this.radius = 15 * config.scale;
    
    this.position = { x, y: -this.radius * 2 };
    this.velocity = { x: 0, y: config.fallSpeed };

    // Create glow effect (outer circle)
    this.glowSprite = new PIXI.Graphics();
    this.glowSprite.circle(0, 0, this.radius * 1.5);
    this.glowSprite.fill({ color: config.glowColor, alpha: 0.3 });
    this.glowSprite.x = x;
    this.glowSprite.y = this.position.y;

    // Create main fruit sprite - try to use image, fallback to graphics
    try {
      const texture = PIXI.Texture.from(config.imagePath);
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.width = this.radius * 2;
      this.sprite.height = this.radius * 2;
      this.sprite.anchor.set(0.5, 0.5);
    } catch {
      // Fallback to graphics if image fails to load
      this.sprite = new PIXI.Graphics();
      (this.sprite as PIXI.Graphics).circle(0, 0, this.radius);
      (this.sprite as PIXI.Graphics).fill({ color: config.color, alpha: 0.8 });
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
