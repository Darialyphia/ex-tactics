import type { EmptyObject, Point3D, Serializable } from '@game/shared';
import { Entity, EntityWithModifiers } from '../entity';
import type { Game } from '../game/game';
import { Position } from '../utils/position';
import type { Player } from '../player/player.entity';

export type SerializedUnit = {
  type: 'unit';
  id: string;
  position: Point3D;
  player: string;
};

export type UnitOptions = { id: number; position: Point3D; player: Player };

export class Unit
  extends EntityWithModifiers<EmptyObject>
  implements Serializable<SerializedUnit>
{
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
      type: 'unit' as const,
      id: this.id,
      position: this._position.serialize(),
      player: this.player.id
    };
  }

  startTurn() {
    console.log('todo unit start turn');
  }
}
