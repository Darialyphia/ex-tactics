import type { EmptyObject, Point3D, Serializable } from '@game/shared';
import { EntityWithModifiers } from '../entity';
import type { Game } from '../game/game';
import type { ObstacleBlueprint } from './obstacle-blueprint';
import { Position } from '../utils/position';
import type { Direction } from '../board/board.utils';
import type { Player } from '../player/player.entity';

export type ObstacleOptions = {
  id: number;
  blueprint: ObstacleBlueprint;
  player: Player | null;
  position: Point3D;
  orientation: Direction;
};

export type SerializedObstacle = {
  entityType: 'obstacle';
  id: string;
  name: string;
  description: string;
  spriteId: string;
  isAttackable: boolean;
  maxHp: number | null;
  currentHp: number | null;
  player: string | null;
  orientation: Direction;
};

export class Obstacle
  extends EntityWithModifiers<EmptyObject>
  implements Serializable<SerializedObstacle>
{
  private blueprint: ObstacleBlueprint;

  private currentHp: number | null;

  readonly player: Player | null;

  private game: Game;

  readonly position: Position;

  orientation: Direction;

  constructor(game: Game, options: ObstacleOptions) {
    super(`obstacle-${options.id}`, {});
    this.game = game;
    this.blueprint = options.blueprint;
    this.currentHp = this.blueprint.isDestroyable ? this.blueprint.maxHp : null;
    this.player = options.player;
    this.position = Position.fromPoint3D(options.position);
    this.orientation = options.orientation;
  }

  serialize() {
    return {
      entityType: 'obstacle' as const,
      id: this.id,
      name: this.blueprint.name,
      description: this.blueprint.description,
      spriteId: this.blueprint.spriteId,
      isAttackable: this.blueprint.isAttackable,
      maxHp: this.blueprint.isDestroyable ? this.blueprint.maxHp : null,
      currentHp: this.blueprint.isDestroyable ? this.currentHp : null,
      player: this.player?.id ?? null,
      orientation: this.orientation
    };
  }

  get blueprintId() {
    return this.blueprint.id;
  }
}
