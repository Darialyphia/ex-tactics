<script setup lang="ts">
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => obstacle.spriteId);

const textures = useMultiLayerTexture({
  sheet,
  parts: () => obstacle.spriteParts,
  tag: 'idle'
});
</script>

<template>
  <animated-sprite :anchor="{ x: 0.5, y: 1 }" :textures="textures" />
</template>
