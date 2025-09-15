import { type AnyObject, type JSONObject, type Serializable } from '@game/shared';

type GenericEventMap = Record<Exclude<string, '*'>, AnyObject>;

export type EventMapWithStarEvent<TEvents extends GenericEventMap> = TEvents & {
  '*': StarEvent<TEvents>;
};

export class TypedEventEmitter<TEvents extends GenericEventMap> {
  private _listeners: Partial<{
    [Event in keyof EventMapWithStarEvent<TEvents>]: Set<
      (eventArg: EventMapWithStarEvent<TEvents>[Event]) => void
    >;
  }> = {};

  constructor() {}

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    Array.from(this._listeners[eventName] ?? []).forEach(listener =>
      // @ts-expect-error
      listener(eventArg)
    );

    Array.from(this._listeners['*'] ?? []).forEach(listener =>
      // @ts-expect-error
      listener(new StarEvent({ eventName, event: eventArg }))
    );
  }

  on<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => void
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = new Set();
    }
    this._listeners[eventName].add(handler);

    return () => this.off(eventName, handler as any);
  }

  once<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => void
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = new Set();
    }
    const onceHandler = (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => {
      this.off(eventName, onceHandler as any);
      return handler(eventArg);
    };
    this._listeners[eventName].add(onceHandler);

    return () => this.off(eventName, onceHandler as any);
  }

  off<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => void
  ) {
    const listeners = this._listeners[eventName];
    if (!listeners) return;
    listeners.delete(handler);
    if (listeners.size === 0) {
      delete this._listeners[eventName];
    }
  }

  removeAllListeners() {
    this._listeners = {};
  }
}

export abstract class TypedSerializableEvent<TData, TSerialized extends JSONObject>
  implements Serializable<TSerialized>
{
  constructor(public data: TData) {}

  abstract serialize(): TSerialized;
}

export type SerializedEvent<TEvent extends TypedSerializableEvent<any, any>> = ReturnType<
  TEvent['serialize']
>;

type GenericSerializableEventMap = Record<
  string,
  TypedSerializableEvent<AnyObject, JSONObject>
>;

export class TypedSerializableEventEmitter<
  TEvents extends GenericSerializableEventMap
> extends TypedEventEmitter<TEvents> {}

export class StarEvent<TMap extends GenericEventMap> extends TypedSerializableEvent<
  {
    eventName: keyof TMap & string;
    event: TMap[keyof TMap];
  },
  {
    eventName: keyof TMap & string;
    event: ReturnType<TMap[keyof TMap]['serialize']>;
  }
> {
  serialize() {
    return {
      eventName: this.data.eventName,
      event: this.data.event.serialize()
    };
  }
}
