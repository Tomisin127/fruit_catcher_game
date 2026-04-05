import { Fruit } from '../entities/Fruit';
import { FRUIT_CONFIGS, GAME_WIDTH, INITIAL_SPAWN_INTERVAL, MIN_SPAWN_INTERVAL, SPAWN_DECAY_RATE } from '../constants';

export class SpawnSystem {
  private lastSpawnTime: number = 0;
  private currentInterval: number = INITIAL_SPAWN_INTERVAL;

  public update(currentTime: number, gameTime: number): Fruit | null {
    // Calculate dynamic spawn interval based on game time
    const difficulty = 1.0 + Math.log10(1 + gameTime / 15000);
    this.currentInterval = MIN_SPAWN_INTERVAL + 
      (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * 
      Math.exp(-SPAWN_DECAY_RATE * (gameTime / 1000));

    if (currentTime - this.lastSpawnTime < this.currentInterval) {
      return null;
    }

    this.lastSpawnTime = currentTime;
    return this.spawnFruit();
  }

  private spawnFruit(): Fruit {
    // Select fruit type based on probability
    const random = Math.random();
    let fruitConfig = FRUIT_CONFIGS.strawberry;

    if (random < FRUIT_CONFIGS.watermelon.probability) {
      fruitConfig = FRUIT_CONFIGS.watermelon;
    } else if (random < FRUIT_CONFIGS.watermelon.probability + FRUIT_CONFIGS.banana.probability) {
      fruitConfig = FRUIT_CONFIGS.banana;
    }

    // Random X position with margins
    const margin = 40;
    const x = margin + Math.random() * (GAME_WIDTH - margin * 2);

    return new Fruit(x, fruitConfig);
  }

  public reset(): void {
    this.lastSpawnTime = 0;
    this.currentInterval = INITIAL_SPAWN_INTERVAL;
  }
}
