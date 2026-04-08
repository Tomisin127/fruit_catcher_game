import * as PIXI from 'pixi.js';
import type { Position } from '@/types/game';
import { BASKET_WIDTH, BASKET_HEIGHT, GAME_WIDTH, COLORS } from '../constants';

// Cache for basket texture
let basketTextureCache: PIXI.Texture | null = null;

export async function preloadBasketTexture(): Promise<void> {
  try {
    basketTextureCache = await PIXI.Assets.load('/basket.png');
  } catch (error) {
    console.warn('Failed to preload basket texture:', error);
  }
}

export class Basket {
  public sprite: PIXI.Sprite | PIXI.Graphics;
  public position: Position;
  public width: number = BASKET_WIDTH * 1.3; // Bigger basket
  public height: number = BASKET_HEIGHT * 1.3;
  private glowSprite: PIXI.Graphics;
  private wobblePhase: number = 0;
  public currentColor: number = COLORS.basketMain;

  constructor(x: number, y: number) {
    this.position = { x, y };

    // Create glow effect
    this.glowSprite = new PIXI.Graphics();
    this.updateGlow();

    // Create main basket sprite - use cached texture or fallback to graphics
    if (basketTextureCache && basketTextureCache.valid) {
      this.sprite = new PIXI.Sprite(basketTextureCache);
      this.sprite.width = this.width;
      this.sprite.height = this.height;
      this.sprite.anchor.set(0.5, 0.5);
    } else {
      // Fallback to nice looking graphics basket
      this.sprite = new PIXI.Graphics();
      this.updateGraphicsSprite();
    }
    
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
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

  private updateGraphicsSprite(): void {
    if (!(this.sprite instanceof PIXI.Graphics)) return;
    
    this.sprite.clear();
    
    // Basket body - woven look
    this.sprite.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      12
    );
    this.sprite.fill({ color: 0x8B4513, alpha: 1 }); // Brown
    
    // Inner basket
    this.sprite.roundRect(
      -this.width / 2 + 6,
      -this.height / 2 + 6,
      this.width - 12,
      this.height - 6,
      8
    );
    this.sprite.fill({ color: 0xD2691E, alpha: 1 }); // Lighter brown
    
    // Weave pattern lines
    for (let i = -this.width / 2 + 10; i < this.width / 2 - 10; i += 12) {
      this.sprite.rect(i, -this.height / 2 + 2, 2, this.height - 4);
      this.sprite.fill({ color: 0x654321, alpha: 0.5 });
    }
    
    // Rim highlight
    this.sprite.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      8,
      6
    );
    this.sprite.fill({ color: 0xA0522D, alpha: 1 });

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
    // Only apply color effect if using fallback graphics
    if (!(this.sprite instanceof PIXI.Graphics)) return;
    
    // Color merge effect
    const targetColor = this.lerpColor(this.currentColor, fruitColor, 0.3);
    this.currentColor = targetColor;
    this.updateGraphicsSprite();

    // Reset color after a delay
    setTimeout(() => {
      this.currentColor = COLORS.basketMain;
      this.updateGraphicsSprite();
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
