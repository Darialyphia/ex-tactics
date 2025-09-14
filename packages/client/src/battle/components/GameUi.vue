<script setup lang="ts">
import { useLights } from '@/shared/composables/useLightsManager';
import {
  useClientPlayerId,
  useGameClient,
  useGameState,
  useGameUi,
  usePlayers
} from '../composables/useGameClient';
import FPS from '@/shared/components/FPS.vue';
import DeployUi from './DeployUi.vue';
import { ROUND_PHASES } from '@game/engine/src/game/systems/turn.system';
import BattleUi from './BattleUi.vue';

const state = useGameState();
const ui = useGameUi();
const players = usePlayers();
const client = useGameClient();
const lights = useLights();

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
    ambientColor: 0x343162,
    ambientAlpha: 0.95,
    lightIntensity: 7,
    lightColor: 0xf29668,
    lightAlpha: 1
  }
];

const selectedPreset = ref(lightPresets[0]);
const updateLight = () => {
  lights.ambientLightAlpha = selectedPreset.value.ambientAlpha;
  lights.ambientLightColor = selectedPreset.value.ambientColor;
  lights.lightColor = selectedPreset.value.lightColor;
  lights.lightIntensity = selectedPreset.value.lightIntensity;
  lights.lightAlpha = selectedPreset.value.lightAlpha;
};
updateLight();

const autoDeploy = () => {
  players.value.forEach(player => {
    client.switchPlayerId(player.id);
    player.heroesToDeploy.forEach(hero => {
      const idx = Math.floor(Math.random() * player.deployZone.length);
      ui.value.selectedHeroToDeploy = hero;
      ui.value.deployAt(player.deployZone[idx].position);
    });
    client.deploy();
  });
};

const clientPlayerId = useClientPlayerId();
</script>

<template>
  <header class="flex items-center gap-3">
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
              updateLight();
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
        :class="{ active: clientPlayerId === player.id }"
        @click="client.switchPlayerId(player.id)"
      >
        Player {{ player.name }} view
      </button>
      <button v-if="state.phase === ROUND_PHASES.DEPLOY" @click="autoDeploy">Auto deploy</button>
    </div>
  </header>
  <FPS />
  <DeployUi />
  <BattleUi />
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
