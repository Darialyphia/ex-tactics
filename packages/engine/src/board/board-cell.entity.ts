import { type EmptyObject, type Point3D, type Serializable } from '@game/shared';
import { EntityWithModifiers } from '../entity';
import type { Game } from '../game/game';
import { Position } from '../utils/position';
import type { Tile } from './tile';

export type SerializedCoords = `${string}:${string}:${string}`;

export type CellOptions = {
  id: string;
  position: Point3D;
  tile: Tile;
};

export type SerializedBoardCell = {
  entityType: 'board_cell';
  id: string;
  position: Point3D;
  spriteId: string;
};

export class BoardCell
  extends EntityWithModifiers<EmptyObject>
  implements Serializable<SerializedBoardCell>
{
  readonly position: Position;

  // obstacle: Obstacle | null;

  constructor(
    private game: Game,
    private readonly options: CellOptions
  ) {
    super(options.id, {});
    this.position = Position.fromPoint3D(options.position);
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'board_cell' as const,
      position: this.position.serialize(),
      spriteId: this.tile.spriteId
    };
  }

  get tile() {
    return this.options.tile;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  isNeightbor(point: Point3D) {
    return this.position.isNearby(point);
  }

  get above(): BoardCell | null {
    return this.game.board.getCellAt({
      x: this.position.x,
      y: this.position.y,
      z: this.position.z + 1
    });
  }

  get isWalkable() {
    return !this.above && this.tile.isWalkable && !this.unit;
  }

  get unit() {
    return this.game.unitManager.getUnitAt(this.position);
  }
}
