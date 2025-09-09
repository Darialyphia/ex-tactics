<script setup lang="ts">
import { RouterLink } from 'vue-router';
definePage({
  name: 'Home',
  path: '/'
});
</script>

<template>
  <h1>Home Page</h1>
  <nav class="pointer-events-auto">
    <ul class="flex gap-4">
      <li>
        <!-- <RouterLink :to="{ name: 'Settings' }">Settings</RouterLink> -->
      </li>
      <!-- <li>
        <RouterLink :to="{ name: 'HowToPlay' }">How to play</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
      </li> -->
    </ul>
  </nav>
</template>

<style scoped lang="postcss"></style>
