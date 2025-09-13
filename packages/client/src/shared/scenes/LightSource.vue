<script setup lang="ts">
import { useLights } from '@/shared/composables/useLightsManager';
import { until } from '@vueuse/core';
import { defineProps } from 'vue';
import type { Container } from 'pixi.js';

const { id } = defineProps<{
  id: string;
}>();

const lights = useLights();

const container = ref<Container>();
until(container)
  .toBeTruthy()
  .then(c => {
    lights.addLightSource(id, c);
  });

onUnmounted(() => {
  lights.removeLightSource(id);
});
</script>

<template>
  <container ref="container">
    <slot />
  </container>
</template>
