import type { Point3D } from '@game/shared';
import type { Unit } from '../unit/unit.entity';
import type { Position } from '../utils/position';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { OBSTACLE_EVENTS } from './obstacle.constants';
import type { Obstacle } from './obstacle.entity';
import type { Damage, DamageType } from '../unit/damage';

export class ObstacleAttackedEvent extends TypedSerializableEvent<
  { obstacle: Obstacle; attacker: Unit },
  { obstacle: string; attacker: string }
> {
  serialize() {
    return { obstacle: this.data.obstacle.id, attacker: this.data.attacker.id };
  }
}

export class ObstacleBeforeDestroyEvent extends TypedSerializableEvent<
  { obstacle: Obstacle; source: Unit },
  { obstacle: string; source: string }
> {
  serialize() {
    return {
      obstacle: this.data.obstacle.id,
      source: this.data.source.id
    };
  }
}

export class ObstacleAfterDestroyEvent extends TypedSerializableEvent<
  { obstacle: Obstacle; source: Unit; destroyedAt: Position },
  { obstacle: string; source: string; destroyedAt: Point3D }
> {
  serialize() {
    return {
      obstacle: this.data.obstacle.id,
      source: this.data.source.id,
      destroyedAt: this.data.destroyedAt.serialize()
    };
  }
}

export class ObstacleTakeDamageEvent extends TypedSerializableEvent<
  { obstacle: Obstacle; from: Unit; damage: Damage<Obstacle> },
  {
    from: string;
    obstacle: string;
    damage: {
      type: DamageType;
      amount: number;
    };
  }
> {
  serialize() {
    return {
      from: this.data.from.id,
      obstacle: this.data.obstacle.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.obstacle)
      }
    };
  }
}

export type ObstacleEventMap = {
  [OBSTACLE_EVENTS.OBSTACLE_BEFORE_ATTACKED]: ObstacleAttackedEvent;
  [OBSTACLE_EVENTS.OBSTACLE_AFTER_ATTACKED]: ObstacleAttackedEvent;
  [OBSTACLE_EVENTS.OBSTACLE_BEFORE_TAKE_DAMAGE]: ObstacleTakeDamageEvent;
  [OBSTACLE_EVENTS.OBSTACLE_AFTER_TAKE_DAMAGE]: ObstacleTakeDamageEvent;
  [OBSTACLE_EVENTS.OBSTACLE_BEFORE_DESTROY]: ObstacleBeforeDestroyEvent;
  [OBSTACLE_EVENTS.OBSTACLE_AFTER_DESTROY]: ObstacleAfterDestroyEvent;
};
