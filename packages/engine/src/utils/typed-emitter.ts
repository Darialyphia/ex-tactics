import {
  type AnyObject,
  type JSONObject,
  type MaybePromise,
  type Serializable
} from '@game/shared';

type GenericEventMap = Record<Exclude<string, '*'>, AnyObject>;

type EmitterMode = 'sequential' | 'parallel';

export type EventMapWithStarEvent<TEvents extends GenericEventMap> = TEvents & {
  '*': StarEvent<TEvents>;
};

export class TypedEventEmitter<TEvents extends GenericEventMap> {
  private _listeners: Partial<{
    [Event in keyof EventMapWithStarEvent<TEvents>]: Set<
      (eventArg: EventMapWithStarEvent<TEvents>[Event]) => MaybePromise<void>
    >;
  }> = {};

  constructor(private mode: EmitterMode = 'sequential') {}

  private async emitSequential<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    const listeners = Array.from(this._listeners[eventName] ?? []);

    for (const listener of listeners) {
      // @ts-expect-error
      await listener(eventArg);
    }
    const starListeners = Array.from(this._listeners['*'] ?? []);
    for (const listener of starListeners) {
      await listener(new StarEvent({ eventName, event: eventArg }) as any);
    }
  }

  private async emitParallel<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    const listeners = Array.from(this._listeners[eventName] ?? []).map(listener =>
      // @ts-expect-error
      listener(eventArg)
    );

    await Promise.all(listeners);

    const starListeners = Array.from(this._listeners['*'] ?? []).map(listener =>
      listener(new StarEvent({ eventName, event: eventArg }) as any)
    );
    await Promise.all(starListeners);
  }

  async emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    if (this.mode === 'sequential') {
      await this.emitSequential(eventName, eventArg);
    } else if (this.mode === 'parallel') {
      await this.emitParallel(eventName, eventArg);
    }
  }

  on<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = new Set();
    }
    this._listeners[eventName].add(handler);

    return () => this.off(eventName, handler as any);
  }

  once<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = new Set();
    }
    let handled = false;
    const onceHandler = (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => {
      // makes sure the handler is only called once as some async weirdness might make the handler run twice before it gets cleaned up
      if (handled) return;
      handled = true;
      this.off(eventName, onceHandler as any);
      return handler(eventArg);
    };
    this._listeners[eventName].add(onceHandler);

    return () => this.off(eventName, onceHandler as any);
  }

  off<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>
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
