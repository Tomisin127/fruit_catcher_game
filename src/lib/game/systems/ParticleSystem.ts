import * as PIXI from 'pixi.js';

export interface ParticleConfig {
  x: number;
  y: number;
  color: number;
  count: number;
}

export class ParticleSystem {
  private container: PIXI.Container;
  private particles: Array<{ sprite: PIXI.Graphics; vx: number; vy: number; life: number }> = [];

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public emit(config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count;
      const speed = 2 + Math.random() * 3;
      
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 2 + Math.random() * 3);
      particle.fill({ color: config.color, alpha: 0.8 });
      particle.x = config.x;
      particle.y = config.y;
      
      this.container.addChild(particle);
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
      });
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.sprite.x += particle.vx * deltaTime;
      particle.sprite.y += particle.vy * deltaTime;
      particle.vy += 0.2 * deltaTime; // Gravity
      particle.life -= deltaTime * 0.03;
      
      particle.sprite.alpha = particle.life;
      
      if (particle.life <= 0) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  public clear(): void {
    this.particles.forEach(particle => {
      this.container.removeChild(particle.sprite);
      particle.sprite.destroy();
    });
    this.particles = [];
  }
}
