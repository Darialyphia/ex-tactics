<script lang="ts" setup>
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { DIRECTION, type Direction } from '@game/engine/src/board/board.utils';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
const { orientation } = defineProps<{
  orientation: Direction;
}>();

const camera = useIsoCamera();

const DIRECTION_TO_ANGLE = {
  [DIRECTION.EAST]: 0,
  [DIRECTION.SOUTH]: 90,
  [DIRECTION.WEST]: 180,
  [DIRECTION.NORTH]: 270
};

const tag = computed(() => {
  const base = DIRECTION_TO_ANGLE[orientation];

  return '' + ((base + camera.angle.value) % 360);
});
</script>

<template>
  <UiAnimatedSprite assetId="orientation-arrow" :tag="tag" />
</template>
