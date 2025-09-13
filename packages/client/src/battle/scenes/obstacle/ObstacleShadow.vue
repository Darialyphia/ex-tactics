<script setup lang="ts">
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { getScaleXForOrientation } from '@/utils/sprite';
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

const camera = useIsoCamera();
const isFlipped = computed(
  () => getScaleXForOrientation(obstacle.orientation, camera.angle.value) === -1
);
</script>

<template>
  <animated-sprite
    :anchor="{ x: 0.5, y: 1 }"
    :textures="textures"
    :tint="0x000000"
    :alpha="0.5"
    :scale-y="0.8"
    :skew-x="isFlipped ? -0.5 : 0.5"
    :y="-5"
    event-mode="none"
  >
    <blur-filter :strength="5" />
  </animated-sprite>
</template>
