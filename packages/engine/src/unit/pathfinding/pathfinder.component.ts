import { Vec3, type Point3D } from '@game/shared';
import { dijkstra, findShortestPath } from './algorithms/dijkstra';
import type { SerializedCoords } from '../../board/board-cell.entity';
import { cellIdToPoint, pointToCellId } from '../../board/board.utils';
import type { Game } from '../../game/game';
import type { PathfindingStrategy } from './strategies/pathfinding-strategy';

export type DistanceMap = {
  costs: ReturnType<typeof dijkstra>['costs'];
  get: (point: Point3D) => {
    distance: number;
    path: Point3D[] | null;
  };
};

export class PathfinderComponent {
  constructor(
    private game: Game,
    private strategy: PathfindingStrategy
  ) {}

  changeStrategy(strategy: PathfindingStrategy) {
    this.strategy = strategy;
  }

  getDistanceMap(from: Point3D, maxDistance?: number): DistanceMap {
    this.strategy.setOrigin(from);
    const map = dijkstra(this.strategy, {
      startNode: pointToCellId(from),
      maxWeight: maxDistance
    });

    this.strategy.done();

    return {
      costs: map.costs,
      get: (pt: Point3D) => {
        return {
          distance: map.costs[pointToCellId(pt)],
          path:
            findShortestPath<SerializedCoords>({
              adapter: this.strategy,
              startNode: pointToCellId(from),
              finishNode: pointToCellId(pt),
              maxWeight: maxDistance,
              distanceMap: map
            })?.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p))) ?? null
        };
      }
    };
  }

  getPathTo(from: Point3D, to: Point3D, maxDistance?: number) {
    const entityAtPoint = this.game.unitManager.getUnitAt(to);
    if (entityAtPoint) return null;

    this.strategy.setOrigin(from);

    const path = findShortestPath<SerializedCoords>({
      adapter: this.strategy,
      startNode: pointToCellId(from),
      finishNode: pointToCellId(to),
      maxWeight: maxDistance
    });

    if (!path) return null;
    this.strategy.done();

    return {
      distance: path.distance,
      path: path.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p)))
    };
  }
}
