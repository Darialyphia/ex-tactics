<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useActiveUnit } from '@/battle/composables/useGameClient';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const activeUnit = useActiveUnit();
</script>

<template>
  <pixi-text
    v-if="activeUnit && !activeUnit.equals(unit) && unit.indexInTurnOrder >= 0"
    :style="{
      fill: 'white',
      fontSize: '36px',
      dropShadow: {
        angle: Math.PI / 4,
        color: '#000000',
        distance: 4
      }
    }"
    :scale="0.25"
    :anchor-x="0.5"
    :y="-60"
    :x="20"
  >
    {{ unit.indexInTurnOrder }}
  </pixi-text>
</template>
