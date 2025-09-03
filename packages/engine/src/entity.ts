import type { AnyObject } from '@game/shared';
import type { inferInterceptor, Interceptable } from './utils/interceptable';
import { ModifierManager } from './modifier/modifier-manager.component';

export type EmptyInterceptables = Record<string, never>;
export type AnyEntity = Entity<AnyObject>;

export abstract class Entity<TI extends Record<string, Interceptable<any, any>>> {
  readonly id: string;

  protected interceptors: TI;

  constructor(id: string, interceptables: TI) {
    this.id = id;
    this.interceptors = interceptables;
  }

  equals(e: { id: string }) {
    return this.id == e.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onInterceptorAdded(key: string) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onInterceptorRemoved(key: string) {}

  async addInterceptor<T extends keyof TI & string>(
    key: T,
    interceptor: inferInterceptor<TI[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor, priority);
    await this.onInterceptorAdded(key);
    return () => this.removeInterceptor(key, interceptor);
  }

  async removeInterceptor<T extends keyof TI & string>(
    key: T,
    interceptor: inferInterceptor<TI[T]>
  ) {
    this.interceptors[key].remove(interceptor);
    await this.onInterceptorRemoved(key);
  }
}

export abstract class EntityWithModifiers<
  TI extends Record<string, Interceptable<any, any>>
> extends Entity<TI> {
  modifiers: ModifierManager<this>;

  constructor(id: string, interceptables: TI) {
    super(id, interceptables);
    this.modifiers = new ModifierManager(this);
  }
}
