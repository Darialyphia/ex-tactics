<script setup lang="ts">
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import { Container } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { getScaleXForOrientation } from '@/utils/sprite';
import LightSource from '@/shared/scenes/LightSource.vue';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import { useActiveUnit, useFxEvent, useGameUi } from '@/battle/composables/useGameClient';
import { useIsoWorld } from '@/iso/composables/useIsoWorld';
import OrientationArrow from '../OrientationArrow.vue';
import Layer from '@/shared/scenes/Layer.vue';
import UnitStatBars from './UnitStatBars.vue';
import UnitTurnOrderIndicator from './UnitTurnOrderIndicator.vue';
import { useUnitAnimations } from '@/battle/composables/useUnitAnimations';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const camera = useIsoCamera();
const grid = useIsoWorld();
const ui = useGameUi();
const activeUnit = useActiveUnit();
const isPositionAnimated = ref(true);

const isActiveUnit = computed(() => {
  return activeUnit.value?.equals(unit);
});

watch(isActiveUnit, active => {
  if (!active) return;
  const iso = grid.toIso(unit.position);
  camera.moveTo(iso, 1000);
});

const spriteContainer = shallowRef<Container>();
const animations = useUnitAnimations(
  computed(() => unit),
  spriteContainer
);

useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async e => {
  isPositionAnimated.value = false;
  await animations.move(e);
  isPositionAnimated.value = true;
});

useFxEvent(FX_EVENTS.UNIT_BEFORE_ATTACK, async e => {
  isPositionAnimated.value = false;
  await animations.attack(e);
  isPositionAnimated.value = true;
});

useFxEvent(FX_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE, async e => {
  await animations.takeDamage(e);
});
</script>

<template>
  <AnimatedIsoPoint
    :position="unit.position"
    :z-index-offset="50"
    :is-animated="isPositionAnimated"
  >
    <LightSource :id="unit.id">
      <OrientationArrow :orientation="unit.orientation" />

      <container
        ref="spriteContainer"
        :scale-x="getScaleXForOrientation(unit.orientation, camera.angle.value)"
        :alpha="isActiveUnit && activeUnit?.moveIntent ? 0.7 : 1"
        event-mode="static"
        @pointerenter="ui.hoverAt(unit.cell)"
        @pointerleave="ui.unhover()"
        @pointerup="unit.onClick()"
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
