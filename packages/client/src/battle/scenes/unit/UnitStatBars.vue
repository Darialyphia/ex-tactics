<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import HpBar from '../HpBar.vue';
import MpBar from '../MpBar.vue';
import { useLatestSimulationResult } from '@/battle/composables/useGameClient';
import type { SerializedUnit } from '@game/engine/src/unit/unit.entity';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const simulation = useLatestSimulationResult();
const simulatedHp = computed(() => {
  if (!simulation.value) return unit.hp;
  const simUnit = simulation.value.state.entities[unit.id] as SerializedUnit | undefined;
  if (!simUnit) return 0;
  return simUnit.currentHp;
});
</script>

<template>
  <container :y="-60" :x="-12">
    <UiAnimatedSprite asset-id="unit-stat-bars" :anchor="0" />
    <HpBar :value="unit.hp" :simulated-value="simulatedHp" :max="unit.maxHp" :x="2" :y="2" />
    <MpBar :value="unit.mp" :max="unit.maxMp" :x="2" :y="5" />
  </container>
</template>
