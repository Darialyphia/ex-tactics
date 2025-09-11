import type { Nullable, Point3D } from '@game/shared';
import type { Ref, ComputedRef, MaybeRefOrGetter } from 'vue';
import { toIso, type Angle } from './useIso';
import { useSafeInject } from '@/shared/composables/useSafeInject';

export type IsoWorldContext = {
  angle: Ref<Angle>;
  scale: ComputedRef<Point3D>;
  columns: ComputedRef<number>;
  rows: ComputedRef<number>;
  planes: ComputedRef<number>;
  toIso(point: Point3D, angle?: Angle, scale?: Point3D): Point3D;
  getZIndex(isoPoint: Point3D, zIndexOffset?: Nullable<number>): number;
};

export const ISO_GRID_INJECTION_KEY = Symbol('iso_grid') as InjectionKey<IsoWorldContext>;

export type UseIsoWorldProviderOptions = {
  angle: MaybeRefOrGetter<Nullable<Angle>>;
  tileSize: MaybeRefOrGetter<Nullable<Point3D>>;
  columns: MaybeRefOrGetter<number>;
  rows: MaybeRefOrGetter<number>;
  planes: MaybeRefOrGetter<number>;
};
export const useIsoWorldProvider = (options: UseIsoWorldProviderOptions) => {
  const angle = ref(toValue(options.angle) ?? 0);
  const ctx: IsoWorldContext = {
    angle,
    columns: computed(() => toValue(options.columns)),
    rows: computed(() => toValue(options.rows)),
    planes: computed(() => toValue(options.planes)),
    scale: computed(() => toValue(options.tileSize) ?? { x: 1, y: 1, z: 1 }),
    toIso(point, angle, scale) {
      return toIso(point, angle ?? ctx.angle.value, scale ?? ctx.scale.value, {
        columns: ctx.columns.value,
        rows: ctx.rows.value,
        planes: ctx.planes.value
      });
    },
    getZIndex(isoPoint, zIndexOffset) {
      const maxZIndexPerElevation = Math.max(
        ctx.columns.value * ctx.scale.value.x,
        ctx.rows.value * ctx.scale.value.y
      );
      return isoPoint.y + isoPoint.z * maxZIndexPerElevation + (zIndexOffset ?? 0);
    }
  };

  provide(ISO_GRID_INJECTION_KEY, ctx);

  return ctx;
};

export const useIsoWorld = () => useSafeInject(ISO_GRID_INJECTION_KEY);
