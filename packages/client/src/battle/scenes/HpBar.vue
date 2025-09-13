<script setup lang="ts">
import { mapRange } from '@game/shared';

const { value, max } = defineProps<{ value: number; max: number }>();

const current = ref(value);
watch(
  () => value,
  () => {
    gsap.to(current, { value, duration: 0.5 });
  }
);

const WIDTH = 24;
const HEIGHT = 2.15; // Slight overlap to prevent gaps
</script>

<template>
  <graphics
    @render="
      g => {
        g.clear()
          .rect(0, 0, WIDTH, HEIGHT)
          .fill(0x000000)
          .rect(0, 0, (WIDTH * current) / max, HEIGHT)
          .fill({
            h: mapRange(current, [0, max], [0, 110]),
            s: 75,
            l: 45
          })
          .rect(0, 1, WIDTH, HEIGHT / 2)
          .fill({ r: 0, g: 0, b: 0, a: 0.3 });
      }
    "
  />
</template>
