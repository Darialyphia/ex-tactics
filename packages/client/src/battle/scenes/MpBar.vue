<script setup lang="ts">
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
    @effect="
      g => {
        g.clear()
          .rect(0, 0, WIDTH, HEIGHT)
          .fill(0x000000)
          .rect(0, 0, (WIDTH * current) / max, HEIGHT)
          .fill({
            h: 220,
            s: 85,
            l: 55
          })
          .rect(0, 1, WIDTH, HEIGHT / 2)
          .fill({ r: 0, g: 0, b: 0, a: 0.3 });
      }
    "
  />
</template>
