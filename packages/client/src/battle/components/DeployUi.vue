<script setup lang="ts">
import type { HeroToDeploy } from '@game/engine/src/client/controllers/ui-controller';
import { useGameClient, useGameState, useGameUi, useMyPlayer } from '../composables/useGameClient';
import { UNITS_DICTIONARY } from '@game/engine/src/unit/units';

const player = useMyPlayer();
const state = useGameState();
const ui = useGameUi();

const toggleHero = (hero: HeroToDeploy) => {
  if (ui.value.selectedHeroToDeploy === hero) {
    ui.value.selectedHeroToDeploy = null;
  } else {
    ui.value.selectedHeroToDeploy = hero;
  }
};

const client = useGameClient();
watch(
  () => client.playerId,
  () => {
    ui.value.clearDeployment();
    ui.value.selectedHeroToDeploy = null;
  }
);
</script>

<template>
  <div v-if="state.phase === 'deploy'" class="deploy-ui">
    <button
      v-for="(hero, index) in player.heroesToDeploy"
      :key="index"
      :style="{
        '--bg': `url(/assets/portraits/${UNITS_DICTIONARY[hero.blueprintId].icons.portrait}.png)`
      }"
      class="portrait"
      :class="{
        selected: ui.selectedHeroToDeploy === hero,
        deployed: Object.values(ui.deployment).some(h => h.hero === hero)
      }"
      @click="toggleHero(hero)"
      @mouseenter="ui.hoveredHeroInDeployActionBar = hero"
      @mouseleave="ui.hoveredHeroInDeployActionBar = null"
    />
  </div>
</template>

<style scoped lang="postcss">
.deploy-ui {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: var(--size-3);
  color: white;
}

.portrait {
  position: relative;
  width: calc(48px * var(--pixel-art-scale));
  aspect-ratio: 1;
  border-radius: var(--radius-2);
  background: var(--bg) no-repeat center/cover;
  border: 2px solid var(--color-border);
  box-shadow: 0 0 0 2px var(--color-bg);
  cursor: pointer;

  &:hover {
    filter: brightness(1.2);
  }

  &.selected {
    outline: solid var(--border-size-2) var(--yellow-6);
  }

  &.deployed::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: calc(12px * var(--pixel-art-scale));
    aspect-ratio: 1;
    background: url('/assets/ui/check-icon.png') no-repeat center/cover;
  }
}
</style>
