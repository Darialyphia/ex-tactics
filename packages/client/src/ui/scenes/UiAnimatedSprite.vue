<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { createSpritesheetFrameObject } from '@/utils/sprite';

const {
  assetId,
  tag = 'idle',
  layer = 'base',
  eventMode = 'none'
} = defineProps<{
  assetId: string;
  tag?: string;
  layer?: string;
  eventMode?: 'none' | 'static' | 'passive' | 'dynamic';
}>();

const sheet = useSpritesheet<'', string>(() => assetId);
const textures = computed(() => {
  if (!sheet.value) return null;
  return createSpritesheetFrameObject(tag, sheet.value.sheets.base[layer]);
});
</script>

<template>
  <animated-sprite
    v-if="textures"
    :x="0"
    :event-mode="eventMode"
    playing
    :anchor="0.5"
    :textures="textures"
  />
</template>
