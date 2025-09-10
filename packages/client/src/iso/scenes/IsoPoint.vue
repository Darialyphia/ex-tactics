<script setup lang="ts">
import { Container } from 'pixi.js';
import { toRefs } from 'vue';
import { useIsoPoint } from '../composables/useIsoPoint';
import type { Point3D } from '@game/shared';

const props = defineProps<{
  position: Point3D;
  zIndexOffset?: number;
}>();

const { isoPosition, zIndex } = useIsoPoint(toRefs(props));
</script>

<template>
  <container :position="isoPosition" :z-order="zIndex" :pivot="{ x: 0, y: 0 }">
    <slot :isoPosition="isoPosition" :z-index="zIndex" />
  </container>
</template>
