<script setup lang="ts">
import { Container } from 'pixi.js';
import { useLayers, type LayerName } from '../composables/useLayers';

const { layer } = defineProps<{
  layer: LayerName;
}>();

const { layers } = useLayers();

const containerRef = shallowRef<Container | null>(null);

watch([containerRef, () => layer], ([container, layer], [, prevLayer]) => {
  if (container) {
    if (prevLayer) {
      layers[prevLayer].detach(container);
    }
    layers[layer].attach(container);
  }
});
</script>

<template>
  <container ref="containerRef">
    <slot />
  </container>
</template>
