import { type EmptyObject, type Serializable, type Values } from '@game/shared';
import type { ModifierMixin } from './modifier-mixin';
import { Entity, type AnyEntity } from '../entity';
import type { Game } from '../game/game';
import type { ModifierManager } from './modifier-manager.component';
import { Interceptable } from '../utils/interceptable';
import { TypedSerializableEvent } from '../utils/typed-emitter';

export type ModifierInfos<TCustomEvents extends Record<string, any>> =
  TCustomEvents extends EmptyObject
    ? {
        name?: string;
        description?: string;
        icon?: string;
        isUnique?: boolean;
        customEventNames?: never;
      }
    : {
        name?: string;
        description?: string;
        isUnique?: boolean;
        icon?: string;
        customEventNames: TCustomEvents;
      };

export type ModifierOptions<
  T extends ModifierTarget,
  TCustomEvents extends Record<string, any>
> = ModifierInfos<TCustomEvents> & {
  mixins: ModifierMixin<T>[];
  stacks?: number;
};

class ModifierLifecycleEvent extends TypedSerializableEvent<
  Modifier<any>,
  SerializedModifier
> {
  serialize() {
    return this.data.serialize();
  }
}

export const MODIFIER_EVENTS = {
  BEFORE_APPLIED: 'modifier.before_applied',
  AFTER_APPLIED: 'modifier.after_applied',
  BEFORE_REMOVED: 'modifier.before_removed',
  AFTER_REMOVED: 'modifier.after_removed',
  BEFORE_REAPPLIED: 'before_reapplied',
  AFTER_REAPPLIED: 'after_reapplied'
} as const;

export type ModifierEventMap = {
  [MODIFIER_EVENTS.BEFORE_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REAPPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REAPPLIED]: ModifierLifecycleEvent;
};

export type ModifierEvent = Values<typeof MODIFIER_EVENTS>;

export type ModifierTarget = {
  id: string;
  modifiers: ModifierManager<any>;
};

export type SerializedModifier = {
  id: string;
  modifierType: string;
  entityType: 'modifier';
  name?: string;
  description?: string;
  icon?: string;
  target: string;
  source: string;
  stacks: number;
  isEnabled: boolean;
};

export type ModifierInterceptors = {
  isEnabled: Interceptable<boolean>;
};

export class Modifier<
    T extends ModifierTarget,
    TEventsMap extends ModifierEventMap = ModifierEventMap
  >
  extends Entity<ModifierInterceptors>
  implements Serializable<SerializedModifier>
{
  private mixins: ModifierMixin<T>[];

  protected game: Game;

  readonly source: AnyEntity;

  protected _target!: T;

  private _isApplied = false;

  readonly infos: { name?: string; description?: string; icon?: string };

  readonly modifierType: string;

  protected _stacks = 1;

  private _isUnique: boolean;

  private _prevEnabled = true;

  constructor(
    modifierType: string,
    game: Game,
    source: AnyEntity,
    options: ModifierOptions<
      T,
      Record<Exclude<keyof TEventsMap, keyof ModifierEventMap>, boolean>
    >
  ) {
    super(game.modifierIdFactory(modifierType), {
      isEnabled: new Interceptable()
    });
    this.game = game;
    this.modifierType = modifierType;
    this.source = source;
    this.mixins = options.mixins;
    this.infos = {
      description: options.description,
      name: options.name,
      icon: options.icon
    };
    this._isUnique = options.isUnique ?? false;
    if (options.stacks) {
      this._stacks = options.stacks;
    }
    this.game.on('*', this.checkEnabled.bind(this));
  }

  get isUnique() {
    return this._isUnique;
  }

  get isApplied() {
    return this._isApplied;
  }

  get isEnabled() {
    return this.interceptors.isEnabled.getValue(true, {});
  }

  get stacks() {
    return this._stacks;
  }

  checkEnabled() {
    if (!this._isApplied) return;
    if (this.isEnabled !== this._prevEnabled) {
      if (this.isEnabled) {
        this.mixins.forEach(mixin => mixin.onApplied(this._target, this));
      } else {
        this.mixins.forEach(mixin => mixin.onRemoved(this._target, this));
      }
    }
    this._prevEnabled = this.isEnabled;
  }

  addMixin(mixin: ModifierMixin<T>) {
    this.mixins.push(mixin);
    if (this._isApplied) {
      mixin.onApplied(this._target, this);
    }
  }

  removeMixin(mixin: ModifierMixin<T>) {
    const index = this.mixins.indexOf(mixin);
    if (index !== -1) {
      this.mixins.splice(index, 1);
      if (this._isApplied) {
        mixin.onRemoved(this._target, this);
      }
    }
  }

  get target() {
    return this._target;
  }

  applyTo(target: T) {
    this.game.emit(MODIFIER_EVENTS.BEFORE_APPLIED, new ModifierLifecycleEvent(this));
    this._target = target;
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onApplied(target, this);
      });
    }
    this._isApplied = true;
    this.game.emit(MODIFIER_EVENTS.AFTER_APPLIED, new ModifierLifecycleEvent(this));
  }

  reapplyTo(target: T, stacks = 1) {
    this.game.emit(MODIFIER_EVENTS.BEFORE_REAPPLIED, new ModifierLifecycleEvent(this));
    this._stacks += stacks;
    console.log('added stacks:', stacks, 'new total:', this._stacks);
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onReapplied(target, this);
      });
    }

    this.game.emit(MODIFIER_EVENTS.AFTER_REAPPLIED, new ModifierLifecycleEvent(this));
  }

  remove() {
    this.game.emit(MODIFIER_EVENTS.BEFORE_REMOVED, new ModifierLifecycleEvent(this));
    this._isApplied = false;
    this.mixins.forEach(mixin => {
      mixin.onRemoved(this._target, this);
    });
    this.game.emit(MODIFIER_EVENTS.AFTER_REMOVED, new ModifierLifecycleEvent(this));
  }

  addStacks(count: number) {
    this._stacks += count;
  }

  async removeStacks(count: number) {
    this._stacks = Math.max(0, this._stacks - count);
    if (this._stacks <= 0) {
      await this.remove();
    }
  }

  async setStacks(count: number) {
    this._stacks = count;
    if (this._stacks <= 0) {
      await this.remove();
    }
  }

  serialize(): SerializedModifier {
    return {
      id: this.id,
      modifierType: this.modifierType,
      entityType: 'modifier' as const,
      name: this.infos.name,
      description: this.infos.description,
      icon: this.infos.icon,
      target: this._target.id,
      source: this.source.id,
      stacks: this._stacks,
      isEnabled: this.isEnabled
    };
  }
}

export const modifierIdFactory = () => {
  let nextId = 0;
  return (id: string) => `modifier_${id}_${nextId++}`;
};
