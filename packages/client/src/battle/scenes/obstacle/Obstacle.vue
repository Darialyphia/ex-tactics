<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import ObstacleSprite from './ObstacleSprite.vue';
import ObstacleShadow from './ObstacleShadow.vue';
import { Container } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';
import LightSource from '@/shared/scenes/LightSource.vue';
import {
  useGameState,
  useGameUi,
  useLatestSimulationResult
} from '@/battle/composables/useGameClient';
import { ROUND_PHASES } from '@game/engine/src/game/systems/turn.system';
import Layer from '@/shared/scenes/Layer.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import HpBar from '../HpBar.vue';
import type { SerializedObstacle } from '@game/engine/src/obstacle/obstacle.entity';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const ui = useGameUi();
const camera = useIsoCamera();
const scaleX = computed(() => getScaleXForOrientation(obstacle.orientation, camera.angle.value));
const state = useGameState();

const simulation = useLatestSimulationResult();
const simulatedHp = computed(() => {
  if (!simulation.value) return obstacle.hp;
  const simObstacle = simulation.value.state.entities[obstacle.id] as
    | SerializedObstacle
    | undefined;
  if (!simObstacle) return 0;
  return simObstacle.currentHp;
});
</script>

<template>
  <AnimatedIsoPoint :position="obstacle.position" :z-index-offset="50">
    <LightSource :id="obstacle.id">
      <container
        :scale-x="scaleX"
        :event-mode="state.phase === ROUND_PHASES.DEPLOY ? 'none' : 'static'"
        @pointerenter="ui.hoverAt(obstacle.cell)"
        @pointerleave="ui.unhover()"
        @pointerup="obstacle.onClick()"
      >
        <ObstacleShadow :obstacle="obstacle" />
        <ObstacleSprite :obstacle="obstacle" />
      </container>

      <Layer layer="ui" v-if="obstacle.maxHP && obstacle.hp && simulatedHp">
        <container :y="-56" :x="-12">
          <UiAnimatedSprite asset-id="obstacle-stat-bars" :anchor="0" />
          <HpBar
            :value="obstacle.hp"
            :simulated-value="simulatedHp"
            :max="obstacle.maxHP"
            :x="2"
            :y="2"
          />
        </container>
      </Layer>
    </LightSource>
  </AnimatedIsoPoint>
</template>
