import { objectEntries, type Values } from '@game/shared';
import { type GameEventMap, GAME_EVENTS } from '../../game/game.events';
import { TypedEventEmitter } from '../../utils/typed-emitter';

export type PreFXEvent<T extends keyof GameEventMap> = `pre_${T}`;
export type PreFXEventKey<T extends keyof typeof GAME_EVENTS> = `PRE_${T}`;
export type PreFxEventRecord = {
  [Key in keyof typeof GAME_EVENTS as PreFXEventKey<Key>]: PreFXEvent<
    (typeof GAME_EVENTS)[Key]
  >;
};

const makePreFxEvents = () =>
  Object.fromEntries(
    objectEntries(GAME_EVENTS).map(([key, value]) => [`PRE_${key}`, `pre_${value}`])
  ) as PreFxEventRecord;

export const FX_EVENTS = {
  ...GAME_EVENTS,
  ...makePreFxEvents()
} as const;

export type FXEvent = Values<typeof FX_EVENTS>;

export type FXEventName = keyof GameEventMap | PreFXEvent<keyof GameEventMap>;

type SerializedEvent<T extends keyof GameEventMap> = ReturnType<
  GameEventMap[T]['serialize']
>;

export type FXEventMap = {
  [Key in FXEventName]: Key extends PreFXEvent<infer U>
    ? SerializedEvent<U>
    : Key extends keyof GameEventMap
      ? SerializedEvent<Key>
      : never;
};

export class FxController {
  private emitter = new TypedEventEmitter<FXEventMap>('parallel');

  private _isPlaying = false;

  get isPlaying() {
    return this._isPlaying;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  async emit(eventName: keyof GameEventMap, event: FXEventMap[FXEventName]) {
    this._isPlaying = true;
    await this.emitter.emit(`pre_${eventName}`, event as any);
    await this.emitter.emit(eventName, event as any);
    this._isPlaying = false;
  }
}
