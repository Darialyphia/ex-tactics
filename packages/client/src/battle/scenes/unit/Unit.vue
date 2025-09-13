<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import { Container } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';
import LightSource from '@/shared/scenes/LightSource.vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import { useGameState } from '@/battle/composables/useGameClient';
import { useIsoWorld } from '@/iso/composables/useIsoWorld';
import HpBar from '../HpBar.vue';
import MpBar from '../MpBar.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import OrientationArrow from '../OrientationArrow.vue';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const camera = useIsoCamera();
const grid = useIsoWorld();
const state = useGameState();

const isActiveUnit = computed(() => {
  return state.value.activeUnitId === unit.id;
});

watch(isActiveUnit, active => {
  if (!active) return;
  const iso = grid.toIso(unit.position);
  camera.moveTo(iso, 1000);
});
</script>

<template>
  <AnimatedIsoPoint :position="unit.position" :z-index-offset="50">
    <LightSource :id="unit.id">
      <OrientationArrow :orientation="unit.orientation" />

      <container :scale-x="getScaleXForOrientation(unit.orientation, camera.angle.value)">
        <UnitShadow :unit="unit" />
        <UnitSprite :unit="unit" />
      </container>

      <pixi-text
        v-if="!isActiveUnit"
        :style="{
          fill: 'white',
          fontSize: '42px',
          fontWeight: 'bold',
          dropShadow: {
            angle: Math.PI / 4,
            color: '#000000',
            distance: 6
          }
        }"
        :scale="0.25"
        :anchor-x="0.5"
        :y="-61"
        :x="22"
      >
        {{ unit.indexInTurnOrder }}
      </pixi-text>

      <container :y="-60" :x="-12">
        <UiAnimatedSprite asset-id="unit-stat-bars" :anchor="0" />
        <HpBar :value="unit.hp" :max="unit.maxHp" :x="2" :y="2" />
        <MpBar :value="unit.mp" :max="unit.maxMp" :x="2" :y="5" />
      </container>
    </LightSource>
  </AnimatedIsoPoint>
</template>
