<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import { Container } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';
import LightSource from '@/shared/scenes/LightSource.vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import { useActiveUnit } from '@/battle/composables/useGameClient';
import { useIsoWorld } from '@/iso/composables/useIsoWorld';
import OrientationArrow from '../OrientationArrow.vue';
import Layer from '@/shared/scenes/Layer.vue';
import UnitStatBars from './UnitStatBars.vue';
import UnitTurnOrderIndicator from './UnitTurnOrderIndicator.vue';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const camera = useIsoCamera();
const grid = useIsoWorld();

const activeUnit = useActiveUnit();

const isActiveUnit = computed(() => {
  return activeUnit.value?.equals(unit);
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

      <container
        :scale-x="getScaleXForOrientation(unit.orientation, camera.angle.value)"
        :alpha="isActiveUnit && activeUnit?.moveIntent ? 0.7 : 1"
        event-mode="static"
        @click="unit.onClick()"
      >
        <UnitShadow :unit="unit" />
        <UnitSprite :unit="unit" />
      </container>

      <Layer layer="ui">
        <UnitTurnOrderIndicator :unit="unit" />
        <UnitStatBars :unit="unit" />
      </Layer>
    </LightSource>
  </AnimatedIsoPoint>
</template>
