import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type {
  inferInterceptorValue,
  inferInterceptorCtx,
  Interceptable
} from '../../utils/interceptable';

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
