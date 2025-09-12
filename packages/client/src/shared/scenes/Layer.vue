<script setup lang="ts">
import { Container } from 'pixi.js';
import { useLayers, type LayerName } from '../composables/useLayers';

const { layer } = defineProps<{
  layer: LayerName;
}>();

const { layers } = useLayers();
</script>

<template>
  <container
    :ref="
      (container: Container) => {
        layers[layer].attach(container);
      }
    "
  >
    <slot />
  </container>
</template>
