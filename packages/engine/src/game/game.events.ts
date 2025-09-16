import type { EmptyObject, Prettify, Values } from '@game/shared';
import type { Input } from '../input/input';
import { InputError } from '../input/input-errors';
import type { SerializedInput } from '../input/input-system';
import type { SerializedGame } from './game';
import {
  MODIFIER_EVENTS,
  type Modifier,
  type ModifierEventMap,
  type SerializedModifier
} from '../modifier/modifier.entity';
import { StarEvent, TypedSerializableEvent } from '../utils/typed-emitter';
import { UNIT_EVENTS } from '../unit/unit.constants';
import type { UnitEventMap } from '../unit/unit.events';
import { TURN_EVENTS, type TurnEventMap } from './systems/turn.system';
import type { PlayerEventMap } from '../player/player.events';
import { PLAYER_EVENTS } from '../player/player.constants';
import type { Obstacle } from '../obstacle/obstacle.entity';
import type { ObstacleEventMap } from '../obstacle/obstacle.events';
import { OBSTACLE_EVENTS } from '../obstacle/obstacle.constants';

export class GameInputEvent extends TypedSerializableEvent<
  { input: Input<any> },
  SerializedInput
> {
  serialize() {
    return this.data.input.serialize() as SerializedInput;
  }
}

export class GameInputRequiredEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameInputQueueFlushedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameErrorEvent extends TypedSerializableEvent<
  { error: Error; debugDump: SerializedGame },
  { error: string; isFatal: boolean; debugDump: SerializedGame }
> {
  serialize() {
    return {
      error: this.data.error.message,
      isFatal: !(this.data.error instanceof InputError),
      debugDump: this.data.debugDump
    };
  }
}

export class GameReadyEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class GameNewSnapshotEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameModifierEvent extends TypedSerializableEvent<
  {
    modifier: Modifier<any>;
    eventName: string;
    event: { serialize: () => any };
  },
  { modifier: SerializedModifier; eventName: string; event: any }
> {
  serialize() {
    return {
      modifier: this.data.modifier.serialize(),
      eventName: this.data.eventName,
      event: this.data.event.serialize()
    };
  }
}

export type SerializedStarEvent = Values<{
  [Name in Exclude<GameEventName, '*'>]: {
    eventName: Name;
    event: ReturnType<GameEventMap[Name]['serialize']>;
  };
}>;

type GameEventsBase = {
  'game.input-start': GameInputEvent;
  'game.input-end': GameInputEvent;
  'game.input-queue-flushed': GameInputQueueFlushedEvent;
  'game.input-required': GameInputRequiredEvent;
  'game.error': GameErrorEvent;
  'game.ready': GameReadyEvent;
  'game.modifier-event': GameModifierEvent;
  'game.new-snapshot': GameNewSnapshotEvent;
};

export type GameEventMap = Prettify<
  GameEventsBase &
    TurnEventMap &
    ModifierEventMap &
    UnitEventMap &
    PlayerEventMap &
    ObstacleEventMap
>;
export type GameEventName = keyof GameEventMap;

export type GameStarEvent = StarEvent<GameEventMap>;
export const GAME_EVENTS = {
  ERROR: 'game.error',
  READY: 'game.ready',
  FLUSHED: 'game.input-queue-flushed',
  INPUT_S0TART: 'game.input-start',
  INPUT_END: 'game.input-end',
  NEW_SNAPSHOT: 'game.new-snapshot',
  ...MODIFIER_EVENTS,
  ...UNIT_EVENTS,
  ...TURN_EVENTS,
  ...PLAYER_EVENTS,
  ...OBSTACLE_EVENTS
} as const satisfies Record<string, GameEventName>;
