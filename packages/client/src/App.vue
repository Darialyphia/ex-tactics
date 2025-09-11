<script setup lang="ts">
import { Application, External } from 'vue3-pixi';
import { useAssets } from './shared/composables/useAssets';
import { TooltipProvider } from 'reka-ui';

const { loaded } = useAssets();

const uiRoot = document.getElementById('#app');
const root = window;
</script>

<template>
  <div v-if="!loaded">Loading...</div>
  <Application v-else :resize-to="root">
    <RouterView name="scene" />

    <External :root="uiRoot!" id="ui-root">
      <TooltipProvider :delay-duration="400">
        <RouterView name="ui" />
      </TooltipProvider>
      <div id="card-portal" />
    </External>
  </Application>
</template>

<style>
:where(#ui-root) {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

:where(#ui-root :is(button, input, a, select, textarea)) {
  pointer-events: auto;
}

#card-portal {
  position: fixed;
  z-index: 10;
}
</style>
