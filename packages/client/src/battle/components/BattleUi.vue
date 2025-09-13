<script setup lang="ts">
import { useLights } from '@/shared/composables/useLightsManager';
import { useGameClient, useGameState, useGameUi, usePlayers } from '../composables/useGameClient';
import FPS from '@/shared/components/FPS.vue';
import DeployUi from './DeployUi.vue';

const state = useGameState();

const ui = useGameUi();

const players = usePlayers();

const client = useGameClient();

const lightPresets = [
  {
    name: 'Day',
    ambientColor: 0x998648,
    ambientAlpha: 0,
    lightIntensity: 3,
    lightColor: 0xffffdd,
    lightAlpha: 0.5
  },
  {
    name: 'Dusk',
    ambientColor: 0x222222,
    ambientAlpha: 0.65,
    lightIntensity: 5,
    lightAlpha: 0.5,
    lightColor: 0xffeebb
  },
  {
    name: 'Night',
    ambientColor: 0x343182,
    ambientAlpha: 0.95,
    lightIntensity: 7,
    lightColor: 0xf29668,
    lightAlpha: 1
  }
];

const selectedPreset = ref(lightPresets[1]);

const lights = useLights();
</script>

<template>
  <header class="flex gap-3">
    phase: {{ state.phase }}

    <div class="flex gap-2">
      <div>
        CAMERA
        <button @click="ui.camera?.rotateCW()">Rotate CW</button>
        <button @click="ui.camera?.rotateCCW()">Rotate CCW</button>
      </div>
      <div>
        LIGHTS
        <button
          v-for="preset in lightPresets"
          :key="preset.name"
          :class="{ active: selectedPreset.name === preset.name }"
          @click="
            () => {
              selectedPreset = preset;
              lights.ambientLightAlpha = preset.ambientAlpha;
              lights.ambientLightColor = preset.ambientColor;
              lights.lightColor = preset.lightColor;
              lights.lightIntensity = preset.lightIntensity;
              lights.lightAlpha = preset.lightAlpha;
            }
          "
        >
          {{ preset.name }}
        </button>
      </div>
    </div>
    <div>
      DEBUG
      <button
        @click="
          () => {
            console.log(state);
          }
        "
      >
        Debug Game State
      </button>
      <button
        v-for="player in players"
        :key="player.id"
        :class="{ active: client.playerId === player.id }"
        @click="client.playerId = player.id"
      >
        Player {{ player.name }} view
      </button>
    </div>
  </header>
  <FPS />
  <DeployUi />
</template>

<style lang="postcss" scoped>
header {
  padding: var(--size-2);
  font-size: var(--font-size-0);
}

button {
  background-color: var(--gray-10);
  color: white;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  margin: var(--size-2);
  cursor: pointer;

  &.active {
    outline: solid var(--border-size-2) var(--yellow-6);
  }
}
</style>
