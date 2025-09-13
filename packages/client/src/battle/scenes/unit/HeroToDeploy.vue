<script setup lang="ts">
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import type { HeroToDeploy } from '@game/engine/src/client/controllers/ui-controller';
import { UNITS_DICTIONARY } from '@game/engine/src/unit/units';

const { hero } = defineProps<{
  hero: HeroToDeploy;
}>();
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
    event-mode="none"
    v-if="textures.length"
    :anchor="{ x: 0.5, y: 1 }"
    :textures="textures"
    :alpha="0.6"
  />
</template>
