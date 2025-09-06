import type { EmptyObject, Point, Point3D, Vec3 } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { UNIT_EVENTS } from './unit.constants';
import type { SerializedUnit, Unit } from './unit.entity';
import type { Position } from '../utils/position';
import type { Damage, DamageType } from './damage';

export class UnitTurnEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class UnitBeforeDestroyEvent extends TypedSerializableEvent<
  { unit: Unit; source: Unit },
  { unit: string; source: string }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      source: this.data.source.id
    };
  }
}

export class UnitAfterDestroyEvent extends TypedSerializableEvent<
  { unit: Unit; source: Unit; destroyedAt: Position },
  { unit: string; source: string; destroyedAt: Point3D }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      source: this.data.source.id,
      destroyedAt: this.data.destroyedAt.serialize()
    };
  }
}

export class UnitBeforeMoveEvent extends TypedSerializableEvent<
  { unit: Unit; path: Vec3[] },
  { unit: string; path: Point3D[] }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAfterMoveEvent extends TypedSerializableEvent<
  { unit: Unit; previousPosition: Vec3; path: Vec3[] },
  { unit: string; previousPosition: Point3D; path: Point3D[] }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      previousPosition: this.data.previousPosition.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAttackEvent extends TypedSerializableEvent<
  { unit: Unit; target: Vec3 },
  { unit: string; target: Point3D }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      target: this.data.target.serialize()
    };
  }
}

export class UnitDealDamageEvent extends TypedSerializableEvent<
  { unit: Unit; targets: Unit[]; damage: Damage<Unit> },
  { unit: string; targets: { unit: string; amount: number }[]; damageType: DamageType }
> {
  serialize() {
    return {
      unit: this.data.unit.id,
      targets: this.data.targets.map(target => ({
        unit: target.id,
        amount: this.data.damage.getFinalAmount(target)
      })),
      damageType: this.data.damage.type
    };
  }
}

export class ReceiveDamageEvent extends TypedSerializableEvent<
  { unit: Unit; from: Unit; damage: Damage<Unit> },
  {
    from: string;
    unit: string;
    damage: {
      type: DamageType;
      amount: number;
    };
  }
> {
  serialize() {
    return {
      from: this.data.from.id,
      unit: this.data.unit.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.unit)
      }
    };
  }
}

export type UnitEventMap = {
  [UNIT_EVENTS.UNIT_TURN_START]: UnitTurnEvent;
  [UNIT_EVENTS.UNIT_TURN_END]: UnitTurnEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DESTROY]: UnitBeforeDestroyEvent;
  [UNIT_EVENTS.UNIT_AFTER_DESTROY]: UnitAfterDestroyEvent;
  [UNIT_EVENTS.UNIT_BEFORE_MOVE]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.UNIT_AFTER_MOVE]: UnitAfterMoveEvent;
  [UNIT_EVENTS.UNIT_BEFORE_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_AFTER_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE]: ReceiveDamageEvent;
  [UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE]: ReceiveDamageEvent;
};
