import type { ParsedAsepriteSheet } from '@/utils/aseprite-parser';
import { useAssets } from './useAssets';
import type { Nullable } from '@game/shared';

export const useSpritesheet = <
  TGroups extends string = string,
  TBaseLayers extends string = string,
  TGroupLayers extends string = string
>(
  assetId: MaybeRefOrGetter<Nullable<string>>
) => {
  const sheet = shallowRef<ParsedAsepriteSheet<TGroups, TBaseLayers, TGroupLayers>>();

  const assets = useAssets();

  watchEffect(() => {
    const _assetId = toValue(assetId);
    if (!_assetId) {
      sheet.value = undefined;
      return;
    }

    assets.loadSpritesheet<TGroups, TBaseLayers, TGroupLayers>(_assetId).then(result => {
      sheet.value = result;
    });
  });

  return sheet;
};
