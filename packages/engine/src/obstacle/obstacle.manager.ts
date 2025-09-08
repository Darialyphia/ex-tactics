import type { Point3D } from '@game/shared';
import type { Game } from '../game/game';
import { Obstacle } from './obstacle.entity';
import type { Player } from '../player/player.entity';
import { OBSTACLE_DICTIONARY } from './obstacles';
import type { Direction } from '../board/board.utils';

export class ObstacleManager {
  private obstacleMap = new Map<string, Obstacle>();

  private nextObstacleId = 0;

  constructor(private game: Game) {}

  get obstacles() {
    return [...this.obstacleMap.values()];
  }

  getObstacleById(id: string) {
    return this.obstacleMap.get(id) ?? null;
  }

  getObstacleAt(position: Point3D) {
    return (
      this.obstacles.find(obstacle => {
        return obstacle.position.equals(position);
      }) ?? null
    );
  }

  getNearbyUnits({ x, y, z }: Point3D) {
    return this.obstacles.filter(
      o => o.position.isNearby({ x, y, z }) && !o.position.equals({ x, y, z })
    );
  }

  addObstacle(options: {
    player: Player | null;
    position: Point3D;
    blueprintId: string;
    orientation: Direction;
  }) {
    const blueprint = OBSTACLE_DICTIONARY[options.blueprintId];
    if (!blueprint) {
      throw new Error(`Unknown obstacle blueprint ID: ${options.blueprintId}`);
    }
    const id = ++this.nextObstacleId;
    const obstacle = new Obstacle(this.game, {
      id,
      blueprint,
      player: options.player,
      position: options.position,
      orientation: options.orientation
    });
    this.obstacleMap.set(obstacle.id, obstacle);

    return obstacle;
  }

  removeObstacle(obstacle: Obstacle) {
    this.obstacleMap.delete(obstacle.id);
  }
}
