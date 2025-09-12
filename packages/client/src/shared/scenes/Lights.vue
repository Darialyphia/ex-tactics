<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import { useLights } from '../composables/useLightsManager';
import { AlphaFilter, Container, Texture } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';

const lights = useLights();

const ambientLightAlpha = new AlphaFilter();
ambientLightAlpha.blendMode = 'multiply';

onTick(lights.onTick);

const lightsContainer = computed({
  get: () => lights.container,
  set: val => {
    lights.container = val;
  }
});
const ambientLight = computed({
  get: () => lights.ambientLightContainer,
  set: val => {
    lights.ambientLightContainer = val;
  }
});

const camera = useIsoCamera();
</script>

<template>
  <container
    event-mode="none"
    :filters="[ambientLightAlpha]"
    ref="lightsContainer"
    :z-index="999999"
  >
    <Sprite
      :x="-camera.offset.value.x"
      :y="-camera.offset.value.y"
      :texture="Texture.WHITE"
      :scale="{
        x: camera.viewport.value?.worldWidth ?? 1,
        y: camera.viewport.value?.worldHeight ?? 1
      }"
      ref="ambientLight"
    />
    <!-- <graphics
      :alpha="0.55"
      @effect="
        g => {
          g.clear().rect(0, 0, screen.width, screen.height).fill(lights.ambientLightColor);
        }
      "
    /> -->
  </container>
</template>
