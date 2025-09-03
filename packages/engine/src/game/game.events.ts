import type { EmptyObject, Prettify, Values } from '@game/shared';
import type { Input } from '../input/input';
import { InputError } from '../input/input-errors';
import type { SerializedInput } from '../input/input-system';
import { StarEvent, TypedSerializableEvent } from '../utils/typed-emitter';
import type { SerializedGame } from './game';
import { GAME_PHASE_EVENTS } from './game.enums';
import type { GamePhaseEventMap } from './systems/game-phase.system';
import {
  MODIFIER_EVENTS,
  type Modifier,
  type ModifierEventMap,
  type SerializedModifier
} from '../modifier/modifier.entity';
import { CARD_EVENTS } from '../card/card.enums';
import type { CardEventMap } from '../card/card.events';
import { COMBAT_EVENTS, type CombatEventMap } from './phases/combat.phase';
import { MINION_EVENTS, type MinionCardEventMap } from '../card/entities/minion.entity';
import { HERO_EVENTS, type HeroCardEventMap } from '../card/entities/hero.entity';
import {
  ARTIFACT_EVENTS,
  type ArtifactCardEventMap
} from '../card/entities/artifact.entity';
import { PLAYER_EVENTS } from '../player/player.enums';
import type { PlayerEventMap } from '../player/player.events';
import {
  DESTINY_EVENTS,
  type DestinyCardEventMap
} from '../card/entities/destiny.entity';
import { ABILITY_EVENTS, type AbilityEventMap } from '../card/entities/ability.entity';

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
    GamePhaseEventMap &
    ModifierEventMap &
    CardEventMap &
    CombatEventMap &
    MinionCardEventMap &
    HeroCardEventMap &
    ArtifactCardEventMap &
    PlayerEventMap &
    DestinyCardEventMap &
    AbilityEventMap
>;
export type GameEventName = keyof GameEventMap;

export type GameStarEvent = StarEvent<GameEventMap>;
export const GAME_EVENTS = {
  ERROR: 'game.error',
  READY: 'game.ready',
  FLUSHED: 'game.input-queue-flushed',
  INPUT_START: 'game.input-start',
  INPUT_END: 'game.input-end',
  INPUT_REQUIRED: 'game.input-required',
  NEW_SNAPSHOT: 'game.new-snapshot',
  ...GAME_PHASE_EVENTS,
  ...MODIFIER_EVENTS,
  ...CARD_EVENTS,
  ...COMBAT_EVENTS,
  ...MINION_EVENTS,
  ...HERO_EVENTS,
  ...ARTIFACT_EVENTS,
  ...PLAYER_EVENTS,
  ...DESTINY_EVENTS,
  ...ABILITY_EVENTS
} as const satisfies Record<string, GameEventName>;
