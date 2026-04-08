'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Basket } from '@/lib/game/entities/Basket';
import { Fruit } from '@/lib/game/entities/Fruit';
import { CollisionSystem } from '@/lib/game/systems/CollisionSystem';
import { SpawnSystem } from '@/lib/game/systems/SpawnSystem';
import { ParticleSystem } from '@/lib/game/systems/ParticleSystem';
import { GAME_WIDTH, GAME_HEIGHT, BASKET_Y, COLORS } from '@/lib/game/constants';
import type { GameState } from '@/types/game';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onComboUpdate: (combo: number) => void;
}

export function GameCanvas({ onScoreUpdate, onGameOver, onComboUpdate }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const initRef = useRef<boolean>(false);

  // Game state refs
  const gameStateRef = useRef<GameState>({
    score: 0,
    highScore: 0,
    isPlaying: true,
    isGameOver: false,
    combo: 0,
    difficulty: 1.0,
  });

  const basketRef = useRef<Basket | null>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const pointerXRef = useRef<number>(GAME_WIDTH / 2);
  const gameTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Systems
  const collisionSystemRef = useRef<CollisionSystem>(new CollisionSystem());
  const spawnSystemRef = useRef<SpawnSystem>(new SpawnSystem());
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(intensity);
    }
  }, []);

  const playSound = useCallback((frequency: number, combo: number) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    try {
      const audioContext = new window.AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Musical scale based on combo (C major)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
      const noteIndex = Math.min(combo - 1, notes.length - 1);
      oscillator.frequency.value = notes[noteIndex];

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silent fail for audio
    }
  }, []);

  const handleCatch = useCallback((fruit: Fruit, nearMiss: boolean) => {
    const state = gameStateRef.current;
    fruit.caught = true;

    const multiplier = nearMiss ? 1.5 : 1.0;
    const points = Math.floor(fruit.config.points * multiplier);
    
    state.score += points;
    state.combo += 1;

    onScoreUpdate(state.score);
    onComboUpdate(state.combo);

    // Visual feedback
    if (basketRef.current) {
      basketRef.current.triggerCatchEffect(fruit.config.color);
    }

    // Particle splash
    if (particleSystemRef.current) {
      particleSystemRef.current.emit({
        x: fruit.position.x,
        y: fruit.position.y,
        color: fruit.config.color,
        count: 12,
      });
    }

    // Audio and haptic
    playSound(440, state.combo);
    triggerHaptic(nearMiss ? 30 : 10);
  }, [onScoreUpdate, onComboUpdate, playSound, triggerHaptic]);

  const handleMiss = useCallback(() => {
    const state = gameStateRef.current;
    state.isGameOver = true;
    state.isPlaying = false;
    
    triggerHaptic(300); // Heavy thud
    onGameOver(state.score);
  }, [onGameOver, triggerHaptic]);

  const gameLoop = useCallback(() => {
    if (!appRef.current || !basketRef.current || !gameStateRef.current.isPlaying) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current || 16;
    lastTimeRef.current = currentTime;
    gameTimeRef.current += deltaTime;

    const state = gameStateRef.current;
    state.difficulty = 1.0 + Math.log10(1 + gameTimeRef.current / 15000);

    // Update basket to follow pointer
    basketRef.current.setPosition(pointerXRef.current);
    basketRef.current.update(deltaTime);

    // Spawn new fruits
    const newFruit = spawnSystemRef.current.update(currentTime, gameTimeRef.current);
    if (newFruit && appRef.current.stage) {
      appRef.current.stage.addChild(newFruit.getGlowSprite());
      appRef.current.stage.addChild(newFruit.sprite);
      fruitsRef.current.push(newFruit);
    }

    // Update fruits and check collisions
    for (let i = fruitsRef.current.length - 1; i >= 0; i--) {
      const fruit = fruitsRef.current[i];
      fruit.update(deltaTime, state.difficulty);

      // Collision check
      if (!fruit.caught) {
        const collision = collisionSystemRef.current.checkCollision(basketRef.current, fruit);
        if (collision.caught) {
          handleCatch(fruit, collision.nearMiss);
        } else if (collisionSystemRef.current.isFruitMissed(fruit, basketRef.current.position.y)) {
          handleMiss();
          return;
        }
      }

      // Remove off-screen or caught fruits
      if (fruit.isOffScreen() || fruit.caught) {
        if (appRef.current.stage) {
          appRef.current.stage.removeChild(fruit.getGlowSprite());
          appRef.current.stage.removeChild(fruit.sprite);
        }
        fruit.destroy();
        fruitsRef.current.splice(i, 1);
      }
    }

    // Update particles
    if (particleSystemRef.current) {
      particleSystemRef.current.update(deltaTime);
    }
  }, [handleCatch, handleMiss]);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    
    initRef.current = true;

    const initGame = async () => {
      try {
        console.log('Initializing PixiJS game...');
        
        const app = new PIXI.Application();
        
        await app.init({
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: COLORS.background,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        console.log('PixiJS app initialized');

        if (containerRef.current && app.canvas) {
          const canvas = app.canvas as HTMLCanvasElement;
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.maxWidth = `${GAME_WIDTH}px`;
          canvas.style.maxHeight = `${GAME_HEIGHT}px`;
          canvas.style.margin = '0 auto';
          containerRef.current.appendChild(canvas);
          console.log('Canvas appended to DOM');
        }

        appRef.current = app;

        // Create background elements
        // Sky gradient
        const skyGraphics = new PIXI.Graphics();
        skyGraphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.65);
        skyGraphics.fill({ color: 0x87CEEB }); // Sky blue
        app.stage.addChild(skyGraphics);

        // Clouds
        const cloud1 = new PIXI.Graphics();
        cloud1.ellipse(60, 80, 45, 20);
        cloud1.fill({ color: 0xFFFFFF, alpha: 0.6 });
        cloud1.ellipse(100, 75, 50, 25);
        cloud1.fill({ color: 0xFFFFFF, alpha: 0.6 });
        app.stage.addChild(cloud1);

        const cloud2 = new PIXI.Graphics();
        cloud2.ellipse(280, 120, 40, 18);
        cloud2.fill({ color: 0xFFFFFF, alpha: 0.5 });
        cloud2.ellipse(320, 115, 45, 22);
        cloud2.fill({ color: 0xFFFFFF, alpha: 0.5 });
        app.stage.addChild(cloud2);

        // Land/ground
        const groundGraphics = new PIXI.Graphics();
        groundGraphics.rect(0, GAME_HEIGHT * 0.65, GAME_WIDTH, GAME_HEIGHT * 0.35);
        groundGraphics.fill({ color: 0x90EE90 }); // Light green grass
        app.stage.addChild(groundGraphics);

        // Ground details - grass tufts
        for (let i = 0; i < GAME_WIDTH; i += 30) {
          const grassTuft = new PIXI.Graphics();
          grassTuft.rect(i, GAME_HEIGHT * 0.64, 20, 8);
          grassTuft.fill({ color: 0x7CCD7C, alpha: 0.8 });
          app.stage.addChild(grassTuft);
        }
        particleSystemRef.current = new ParticleSystem(app.stage);

        // Create basket
        const basketY = GAME_HEIGHT * BASKET_Y;
        const basket = new Basket(GAME_WIDTH / 2, basketY);
        app.stage.addChild(basket.getGlowSprite());
        app.stage.addChild(basket.sprite);
        basketRef.current = basket;
        console.log('Basket created');

        // Touch/pointer events
        const handlePointerMove = (event: PointerEvent | TouchEvent) => {
          const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
          const scaleX = GAME_WIDTH / rect.width;
          
          let clientX: number;
          if ('touches' in event && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
          } else if ('clientX' in event) {
            clientX = event.clientX;
          } else {
            return;
          }
          
          pointerXRef.current = (clientX - rect.left) * scaleX;
        };

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.touchAction = 'none';
        
        // Add both pointer and touch events for better mobile support
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerdown', handlePointerMove);
        canvas.addEventListener('touchmove', handlePointerMove as EventListener, { passive: false });
        canvas.addEventListener('touchstart', handlePointerMove as EventListener, { passive: false });

        // Prevent default touch behavior
        canvas.addEventListener('touchmove', (e: Event) => e.preventDefault(), { passive: false });

        // Start game loop
        lastTimeRef.current = Date.now();
        app.ticker.add(gameLoop);
        console.log('Game loop started');

      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initGame();

    return () => {
      if (appRef.current) {
        console.log('Destroying PixiJS app');
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      initRef.current = false;
    };
  }, [gameLoop]);

  return (
    <div 
      ref={containerRef} 
      className="relative mx-auto bg-gradient-to-b from-blue-100 via-sky-50 to-white rounded-3xl border-4 border-white shadow-2xl overflow-hidden"
      style={{
        width: '100%',
        maxWidth: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
        maxHeight: '80vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }}
    />
  );
}
