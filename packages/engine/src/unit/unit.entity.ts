import type { EmptyObject, Point3D, Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { Position } from '../utils/position';
import type { Player } from '../player/player.entity';

export type SerializedUnit = {
  id: string;
  position: Point3D;
  player: string;
};

export type UnitOptions = { id: number; position: Point3D; player: Player };

export class Unit extends Entity<EmptyObject> implements Serializable<SerializedUnit> {
  private _position: Position;

  readonly player: Player;

  constructor(
    private game: Game,
    options: UnitOptions
  ) {
    super(`unit-${options.id}`, {});
    this._position = Position.fromPoint3D(options.position);
    this.player = options.player;
  }

  get position() {
    return this._position;
  }

  get initiative() {
    return 1; // @TODO: implement initiative properly
  }

  serialize() {
    return {
      id: this.id,
      position: this._position.serialize(),
      player: this.player.id
    };
  }

  startTurn() {
    console.log('todo unit start turn');
  }
}
