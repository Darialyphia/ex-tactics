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
    v-if="activeUnit && !activeUnit.equals(unit)"
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
</template>
