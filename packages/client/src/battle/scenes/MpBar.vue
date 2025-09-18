<script setup lang="ts">
const { value, max, simulatedValue } = defineProps<{
  value: number;
  max: number;
  simulatedValue: number;
}>();

const current = ref(value);
watch(
  () => value,
  () => {
    gsap.to(current, { value, duration: 0.5 });
  }
);

const WIDTH = 24;
const HEIGHT = 2.15; // Slight overlap to prevent gaps

const diff = computed(() => simulatedValue - current.value);
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
          .rect(
            diff < 0 ? (WIDTH * simulatedValue) / max : (WIDTH * current) / max,
            0,
            (WIDTH * Math.abs(diff)) / max,
            HEIGHT
          )
          .fill(diff > 0 ? 0x00ffff : 0xff00ff)
          .rect(0, 1, WIDTH, HEIGHT / 2)
          .fill({ r: 0, g: 0, b: 0, a: 0.3 });
      }
    "
  />
</template>
