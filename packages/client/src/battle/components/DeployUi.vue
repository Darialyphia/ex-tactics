<script setup lang="ts">
import { useGameState, useGameUi, useMyPlayer } from '../composables/useGameClient';
import { UNITS_DICTIONARY } from '@game/engine/src/unit/units';

const player = useMyPlayer();
const state = useGameState();
const ui = useGameUi();
</script>

<template>
  <div v-if="state.phase === 'deploy'" class="deploy-ui">
    <div>
      Deploy your heroes ({{
        player.heroesToDeploy.length - Object.values(ui.deployment).length
      }}/{{ player.heroesToDeploy.length }}
      remaining)
    </div>
    <button
      v-for="(hero, index) in player.heroesToDeploy"
      :key="index"
      :style="{
        '--bg': `url(/assets/portraits/${UNITS_DICTIONARY[hero.blueprintId].icons.portrait}.png)`
      }"
      class="portrait"
      :class="{ selected: ui.selectedHeroToDeploy === hero }"
      @click="
        () => {
          if (ui.selectedHeroToDeploy === hero) {
            ui.selectedHeroToDeploy = null;
          } else {
            ui.selectedHeroToDeploy = hero;
          }
        }
      "
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
  width: calc(48px * var(--pixel-art-scale));
  aspect-ratio: 1;
  border-radius: var(--radius-2);
  background: var(--bg) no-repeat center/cover;
  border: 2px solid var(--color-border);
  box-shadow: 0 0 0 2px var(--color-bg);
  cursor: pointer;

  &.selected {
    outline: solid var(--border-size-2) var(--yellow-6);
  }
}
</style>
