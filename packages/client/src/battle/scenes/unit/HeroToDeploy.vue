<script setup lang="ts">
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { config } from '@/utils/config';
import { getScaleXForOrientation, unitHitArea } from '@/utils/sprite';
import type { Direction } from '@game/engine/src/board/board.utils';
import type { HeroToDeploy } from '@game/engine/src/client/controllers/ui-controller';
import { UNITS_DICTIONARY } from '@game/engine/src/unit/units';

const { hero, direction } = defineProps<{
  hero: HeroToDeploy;
  direction?: Direction;
}>();

const camera = useIsoCamera();
const sheet = useSpritesheet<'', 'base'>(() => {
  const key = UNITS_DICTIONARY[hero.blueprintId].sprite.id;

  return `unit-${key}`;
});

const textures = useMultiLayerTexture({
  sheet: sheet,
  parts: {},
  tag: 'idle'
});
</script>

<template>
  <animated-sprite
    v-if="textures.length"
    :anchor="config.UNIT_ANCHOR"
    :textures="textures"
    :alpha="0.6"
    :hit-area="unitHitArea"
    :scaleX="direction ? getScaleXForOrientation(direction, camera.angle.value) : 1"
  />
</template>
