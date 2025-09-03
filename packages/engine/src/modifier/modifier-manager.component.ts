import { isString, type Constructor, type Nullable } from '@game/shared';
import { Modifier, type ModifierTarget } from './modifier.entity';

export class ModifierManager<T extends ModifierTarget> {
  private _modifiers: Modifier<T>[] = [];

  constructor(private target: T) {}

  has(modifierOrId: string | Modifier<T, any> | Constructor<Modifier<T>>) {
    if (modifierOrId instanceof Modifier) {
      return this._modifiers.some(
        modifier =>
          modifier.modifierType === modifierOrId.modifierType && modifier.isUnique
      );
    } else if (isString(modifierOrId)) {
      return this._modifiers.some(modifier => modifier.modifierType === modifierOrId);
    } else {
      return this._modifiers.some(modifier => modifier.constructor === modifierOrId);
    }
  }

  get<TArg extends string | Modifier<T, any> | Constructor<Modifier<T>>>(
    modifierOrType: TArg
  ): TArg extends Constructor<Modifier<T>>
    ? Nullable<InstanceType<TArg>>
    : Nullable<Modifier<T>> {
    if (modifierOrType instanceof Modifier) {
      return this._modifiers.find(modifier => modifier.equals(modifierOrType)) as any;
    } else if (isString(modifierOrType)) {
      return this._modifiers.find(
        modifier => modifier.modifierType === modifierOrType
      ) as any;
    } else {
      return this._modifiers.find(
        modifier => modifier.constructor === modifierOrType
      ) as any;
    }
  }

  async add(modifier: Modifier<T>) {
    if (this.has(modifier)) {
      const mod = this.get(modifier.modifierType)!;
      await mod!.reapplyTo(this.target, modifier.stacks);
      return mod;
    } else {
      this._modifiers.push(modifier);
      await modifier.applyTo(this.target);
      return modifier;
    }
  }

  async remove(modifierOrType: string | Modifier<T> | Constructor<Modifier<T>>) {
    const idx = this._modifiers.findIndex(mod => {
      if (modifierOrType instanceof Modifier) {
        return mod.equals(modifierOrType);
      } else if (isString(modifierOrType)) {
        return modifierOrType === mod.modifierType || modifierOrType === mod.id;
      } else {
        return mod.constructor === modifierOrType;
      }
    });
    if (idx < 0) return;

    const modifier = this._modifiers[idx];

    this._modifiers.splice(idx, 1);
    await modifier.remove();
  }

  get list() {
    return [...this._modifiers];
  }
}
