import type { EmptyObject, Point3D, Serializable } from '@game/shared';
import { EntityWithModifiers } from '../entity';
import type { Game } from '../game/game';
import type { ObstacleBlueprint } from './obstacle-blueprint';
import { Position } from '../utils/position';
import type { Direction } from '../board/board.utils';
import type { Player } from '../player/player.entity';
import type { Unit } from '../unit/unit.entity';
import type { Damage } from '../unit/damage';
import { OBSTACLE_EVENTS } from './obstacle.constants';
import {
  ObstacleAfterDestroyEvent,
  ObstacleAttackedEvent,
  ObstacleBeforeDestroyEvent,
  ObstacleTakeDamageEvent
} from './obstacle.events';

export type ObstacleOptions = {
  id: number;
  blueprint: ObstacleBlueprint;
  player: Player | null;
  position: Point3D;
  orientation: Direction;
  spriteParts: Record<string, string>;
};

export type SerializedObstacle = {
  entityType: 'obstacle';
  id: string;
  name: string;
  description: string;
  isAttackable: boolean;
  maxHp: number | null;
  currentHp: number | null;
  player: string | null;
  orientation: Direction;
  position: Point3D;
  sprite: {
    id: string;
    parts: Record<string, string>;
  };
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

  constructor(
    game: Game,
    private options: ObstacleOptions
  ) {
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
      isAttackable: this.blueprint.isAttackable,
      maxHp: this.blueprint.isDestroyable ? this.blueprint.maxHp : null,
      currentHp: this.blueprint.isDestroyable ? this.currentHp : null,
      player: this.player?.id ?? null,
      orientation: this.orientation,
      position: this.position.serialize(),
      sprite: {
        id: this.blueprint.sprite.id,
        parts: { ...this.blueprint.sprite.defaultParts, ...this.options.spriteParts }
      }
    };
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get isWalkable() {
    return this.blueprint.isWalkable;
  }

  get isAttackable() {
    return this.blueprint.isAttackable;
  }

  get isDestroyable() {
    return this.blueprint.isDestroyable;
  }

  onAttacked(source: Unit, damage: Damage<any>) {
    this.game.emit(
      OBSTACLE_EVENTS.OBSTACLE_BEFORE_ATTACKED,
      new ObstacleAttackedEvent({
        obstacle: this,
        attacker: source
      })
    );

    if (this.isDestroyable && this.currentHp !== null) {
      this.game.emit(
        OBSTACLE_EVENTS.OBSTACLE_BEFORE_TAKE_DAMAGE,
        new ObstacleTakeDamageEvent({
          obstacle: this,
          from: source,
          damage
        })
      );
      this.currentHp = Math.max(this.currentHp - damage.getFinalAmount(this), 0);

      this.game.emit(
        OBSTACLE_EVENTS.OBSTACLE_AFTER_TAKE_DAMAGE,
        new ObstacleTakeDamageEvent({
          obstacle: this,
          from: source,
          damage
        })
      );
      if (this.currentHp === 0) {
        this.destroy(source);
      }
    }

    this.blueprint.onAttacked?.(this.game, this, source);
    this.game.emit(
      OBSTACLE_EVENTS.OBSTACLE_AFTER_ATTACKED,
      new ObstacleAttackedEvent({
        obstacle: this,
        attacker: source
      })
    );
  }

  canBeAttackedBy(attacker: Unit) {
    if (!this.isAttackable) {
      return false;
    }

    return this.player === null || !this.player.equals(attacker.player);
  }

  destroy(source: Unit) {
    if (!this.isDestroyable) return;
    this.game.emit(
      OBSTACLE_EVENTS.OBSTACLE_BEFORE_DESTROY,
      new ObstacleBeforeDestroyEvent({
        obstacle: this,
        source
      })
    );

    this.blueprint.onDestroyed?.(this.game, this, source);
    const position = this.position.clone();
    this.game.obstacleManager.removeObstacle(this);

    this.game.emit(
      OBSTACLE_EVENTS.OBSTACLE_AFTER_DESTROY,
      new ObstacleAfterDestroyEvent({
        obstacle: this,
        source,
        destroyedAt: position
      })
    );
  }
}
