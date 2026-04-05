import * as PIXI from 'pixi.js';
import type { Position } from '@/types/game';
import { BASKET_WIDTH, BASKET_HEIGHT, GAME_WIDTH, COLORS } from '../constants';

export class Basket {
  public sprite: PIXI.Graphics;
  public position: Position;
  public width: number = BASKET_WIDTH;
  public height: number = BASKET_HEIGHT;
  private glowSprite: PIXI.Graphics;
  private wobblePhase: number = 0;
  public currentColor: number = COLORS.basketMain;

  constructor(x: number, y: number) {
    this.position = { x, y };

    // Create glow effect
    this.glowSprite = new PIXI.Graphics();
    this.updateGlow();

    // Create main basket sprite (U-shaped container)
    this.sprite = new PIXI.Graphics();
    this.updateSprite();
  }

  private updateGlow(): void {
    this.glowSprite.clear();
    this.glowSprite.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      15
    );
    this.glowSprite.fill({ color: COLORS.basketGlow, alpha: 0.4 });
    this.glowSprite.x = this.position.x;
    this.glowSprite.y = this.position.y;
  }

  private updateSprite(): void {
    this.sprite.clear();
    
    // U-shaped basket with liquid appearance
    this.sprite.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      15
    );
    this.sprite.fill({ color: this.currentColor, alpha: 0.9 });
    
    // Add rim highlights
    this.sprite.circle(-this.width / 2 + 5, 0, 5);
    this.sprite.fill({ color: 0xFFFFFF, alpha: 0.6 });
    this.sprite.circle(this.width / 2 - 5, 0, 5);
    this.sprite.fill({ color: 0xFFFFFF, alpha: 0.6 });

    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
  }

  public setPosition(x: number): void {
    // Clamp position to screen bounds
    const halfWidth = this.width / 2;
    this.position.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, x));
    
    this.sprite.x = this.position.x;
    this.glowSprite.x = this.position.x;
  }

  public update(deltaTime: number): void {
    // Wobble effect
    this.wobblePhase += deltaTime * 0.05;
    const wobble = Math.sin(this.wobblePhase) * 0.02;
    this.sprite.rotation = wobble;
    this.glowSprite.rotation = wobble;

    // Gentle pulsing
    const pulse = Math.sin(Date.now() * 0.002) * 0.03 + 1;
    this.glowSprite.scale.set(pulse);
  }

  public triggerCatchEffect(fruitColor: number): void {
    // Color merge effect
    const targetColor = this.lerpColor(this.currentColor, fruitColor, 0.3);
    this.currentColor = targetColor;
    this.updateSprite();

    // Reset color after a delay
    setTimeout(() => {
      this.currentColor = COLORS.basketMain;
      this.updateSprite();
    }, 300);
  }

  private lerpColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
  }

  public getGlowSprite(): PIXI.Graphics {
    return this.glowSprite;
  }

  public destroy(): void {
    this.sprite.destroy();
    this.glowSprite.destroy();
  }
}
