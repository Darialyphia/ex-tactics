import { useIsoWorld } from './useIsoWorld';
import type { Nullable, Point3D } from '@game/shared';
import { useIso } from './useIso';
import type { MaybeRefOrGetter } from 'vue';

export type UseIsoTileOptions = {
  position: MaybeRefOrGetter<Point3D>;
  zIndexOffset?: MaybeRefOrGetter<Nullable<number>>;
};

export const useIsoPoint = ({ position, zIndexOffset }: UseIsoTileOptions) => {
  const grid = useIsoWorld();

  const isoPosition = useIso(
    computed(() => toValue(position)),
    computed(() => ({
      dimensions: {
        columns: grid.columns.value,
        rows: grid.rows.value,
        planes: grid.planes.value
      },
      angle: grid.angle.value,
      scale: grid.scale.value
    }))
  );

  const zIndex = computed(() => {
    return grid.getZIndex(isoPosition.value, toValue(zIndexOffset));
  });

  return { isoPosition, zIndex };
};
