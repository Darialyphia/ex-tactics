<script lang="ts" setup>
import { useScreen } from 'vue3-pixi';

definePage({
  name: 'Home',
  path: '/'
});
const screen = useScreen();
</script>

<template>
  <container>
    <graphics
      @effect="
        g => {
          g.rect(50, 50, 100, 100).fill(0xff0000);
        }
      "
    />
  </container>
</template>
