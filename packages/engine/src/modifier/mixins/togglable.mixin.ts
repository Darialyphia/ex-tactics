import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierTarget } from '../modifier.entity';

export class TogglableModifierMixin<T extends ModifierTarget> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  constructor(
    game: Game,
    private predicate: () => boolean
  ) {
    super(game);
    this.check = this.check.bind(this);
  }

  check(val: boolean) {
    if (!val) return val;

    return this.predicate();
  }

  async onApplied(target: T, modifier: Modifier<T>) {
    this.modifier = modifier;
    await this.modifier.addInterceptor('isEnabled', this.check);
  }

  async onRemoved() {
    // only remove the interceptor if the modifier is being remove, not disabled
    // otherwise it'd cause an infinite loop
    if (!this.modifier.isApplied) {
      await this.modifier.removeInterceptor('isEnabled', this.check);
    }
  }

  onReapplied() {}
}
