import { Vec3, type Point3D } from '@game/shared';
import type { PathfinderComponent } from '../pathfinding/pathfinder.component';
import { Position } from '../../utils/position';
import { cellIdToPoint } from '../../board/board.utils';
import type { SerializedCoords } from '../../board/board-cell.entity';
import type { Unit } from '../unit.entity';
import type { Game } from '../../game/game';
import { UnitAfterMoveEvent, UnitBeforeMoveEvent } from '../unit.events';
import { UNIT_EVENTS } from '../unit.constants';

export type MovementComponentOptions = {
  position: Point3D;
  pathfinding: PathfinderComponent;
};

export class MovementComponent {
  position: Position;

  private pathfinding: PathfinderComponent;

  constructor(
    private game: Game,
    private unit: Unit,
    options: MovementComponentOptions
  ) {
    this.position = Position.fromPoint3D(options.position);
    this.pathfinding = options.pathfinding;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  isAt(point: Point3D) {
    return this.position.equals(point);
  }

  getAllPossibleMoves(maxDistance: number) {
    const distanceMap = this.pathfinding.getDistanceMap(this.position, maxDistance);
    return Object.entries(distanceMap.costs)
      .filter(([, cost]) => cost <= maxDistance)
      .map(([cellId]) => {
        return {
          point: cellIdToPoint(cellId as SerializedCoords),
          path: distanceMap.get(cellIdToPoint(cellId as SerializedCoords)).path!
        };
      });
  }

  canMoveTo(point: Point3D, maxDistance: number) {
    const path = this.pathfinding.getPathTo(this.position, point);
    if (!path) return false;
    return path.distance <= maxDistance;
  }

  getPathTo(point: Point3D, maxDistance?: number) {
    return this.pathfinding.getPathTo(this.position, point, maxDistance);
  }

  move(to: Point3D) {
    const path = this.pathfinding.getPathTo(this.position, to);
    if (!path) return;

    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_MOVE,
      new UnitBeforeMoveEvent({
        unit: this.unit,
        path: path.path.map(Vec3.fromPoint3D)
      })
    );
    const currentPosition = this.position;

    for (const point of path.path) {
      this.position = Position.fromPoint3D(point);
    }

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_MOVE,
      new UnitAfterMoveEvent({
        unit: this.unit,
        previousPosition: currentPosition,
        path: path.path.map(Vec3.fromPoint3D)
      })
    );

    return path;
  }
}
