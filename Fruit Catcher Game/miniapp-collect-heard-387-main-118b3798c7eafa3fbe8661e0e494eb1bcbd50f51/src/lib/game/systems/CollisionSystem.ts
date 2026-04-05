import type { Basket } from '../entities/Basket';
import type { Fruit } from '../entities/Fruit';

export class CollisionSystem {
  public checkCollision(basket: Basket, fruit: Fruit): { caught: boolean; nearMiss: boolean } {
    if (fruit.caught) {
      return { caught: false, nearMiss: false };
    }

    const dx = basket.position.x - fruit.position.x;
    const dy = basket.position.y - fruit.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const catchRadius = (basket.width / 2) + fruit.radius;
    const nearMissRadius = catchRadius * 1.2;

    if (distance < catchRadius * 0.8) {
      // Standard catch
      return { caught: true, nearMiss: false };
    } else if (distance < nearMissRadius) {
      // Near miss (rim mechanics)
      const random = Math.random();
      if (random > 0.5) {
        return { caught: true, nearMiss: true };
      }
    }

    return { caught: false, nearMiss: false };
  }

  public isFruitMissed(fruit: Fruit, basketY: number): boolean {
    return fruit.position.y > basketY + 50 && !fruit.caught;
  }
}
