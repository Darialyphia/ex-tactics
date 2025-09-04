import type { EmptyObject, Point3D } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { UNIT_EVENTS } from './unit.constants';
import type { Unit } from './unit.entity';
import type { Position } from '../utils/position';

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

export type UnitEventMap = {
  [UNIT_EVENTS.UNIT_TURN_START]: UnitTurnEvent;
  [UNIT_EVENTS.UNIT_TURN_END]: UnitTurnEvent;
  [UNIT_EVENTS.UNIT_BEFORE_DESTROY]: UnitBeforeDestroyEvent;
  [UNIT_EVENTS.UNIT_AFTER_DESTROY]: UnitAfterDestroyEvent;
};
