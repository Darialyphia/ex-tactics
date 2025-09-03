import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type {
  inferInterceptorValue,
  inferInterceptorCtx,
  Interceptable
} from '../../utils/interceptable';
import type {
  MinionCard,
  MinionCardInterceptors
} from '../../card/entities/minion.entity';
import type { HeroCard, HeroCardInterceptors } from '../../card/entities/hero.entity';
import type {
  ArtifactCard,
  ArtifactCardInterceptors
} from '../../card/entities/artifact.entity';
import type { SpellCard, SpellCardInterceptors } from '../../card/entities/spell.entity';
import type { MainDeckCard } from '../../board/board.system';
import type { AnyCard, CardInterceptors } from '../../card/entities/card.entity';

type InterceptorMap = Record<string, Interceptable<any, any>>;
export class InterceptorModifierMixin<
  TInterceptorMap extends InterceptorMap,
  TKey extends keyof TInterceptorMap,
  TTarget extends ModifierTarget
> extends ModifierMixin<TTarget> {
  private modifier!: Modifier<TTarget>;

  constructor(
    game: Game,
    private options: {
      key: TKey;
      priority?: number;
      interceptor: (
        value: inferInterceptorValue<TInterceptorMap[TKey]>,
        ctx: inferInterceptorCtx<TInterceptorMap[TKey]>,
        modifier: Modifier<TTarget>
      ) => inferInterceptorValue<TInterceptorMap[TKey]>;
    }
  ) {
    super(game);
    this.interceptor = this.interceptor.bind(this);
  }

  interceptor(
    value: inferInterceptorValue<TInterceptorMap[TKey]>,
    ctx: inferInterceptorCtx<TInterceptorMap[TKey]>
  ) {
    return this.options.interceptor(value, ctx, this.modifier);
  }

  onApplied(target: TTarget, modifier: Modifier<TTarget>): void {
    this.modifier = modifier;
    //@ts-expect-error
    target.addInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.priority
    );
  }

  onRemoved(target: TTarget): void {
    //@ts-expect-error
    target.removeInterceptor(
      this.options.key,
      this.interceptor as any,
      this.options.priority
    );
  }

  onReapplied() {}
}

type MainDeckCardInterceptors =
  | MinionCardInterceptors
  | SpellCardInterceptors
  | ArtifactCardInterceptors;
export class MainDeckCardInterceptorModifierMixin<
  TKey extends keyof MainDeckCardInterceptors
> extends InterceptorModifierMixin<MainDeckCardInterceptors, TKey, MainDeckCard> {}

export class CardInterceptorModifierMixin<
  TKey extends keyof CardInterceptors
> extends InterceptorModifierMixin<MainDeckCardInterceptors, TKey, AnyCard> {}

export class MinionInterceptorModifierMixin<
  TKey extends keyof MinionCardInterceptors
> extends InterceptorModifierMixin<MinionCardInterceptors, TKey, MinionCard> {}

export class HeroInterceptorModifierMixin<
  TKey extends keyof HeroCardInterceptors
> extends InterceptorModifierMixin<HeroCardInterceptors, TKey, HeroCard> {}

export class UnitInterceptorModifierMixin<
  TKey extends keyof MinionCardInterceptors | keyof HeroCardInterceptors
> extends InterceptorModifierMixin<
  MinionCardInterceptors & HeroCardInterceptors,
  TKey,
  MinionCard | HeroCard
> {}

export class ArtifactInterceptorModifierMixin<
  TKey extends keyof ArtifactCardInterceptors
> extends InterceptorModifierMixin<ArtifactCardInterceptors, TKey, ArtifactCard> {}

export class SpellInterceptorModifierMixin<
  TKey extends keyof SpellCardInterceptors
> extends InterceptorModifierMixin<SpellCardInterceptors, TKey, SpellCard> {}
