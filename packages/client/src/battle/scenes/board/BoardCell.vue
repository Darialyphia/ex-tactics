<script lang="ts" setup>
import { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import BoardCellSprite from './BoardCellSprite.vue';
import { useActiveUnit, useGameUi } from '@/battle/composables/useGameClient';
import { config } from '@/utils/config';
import BoardCellHighlight from './BoardCellHighlight.vue';
import MoveIntentPath from './MoveIntentPath.vue';
import UnitSprite from '../unit/UnitSprite.vue';
import { Vec3 } from '@game/shared';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();

const ui = useGameUi();
const activeUnit = useActiveUnit();

const isActiveUnitMoveIntentCell = computed(() => {
  const point = activeUnit.value?.moveIntent?.point;
  if (!point) return false;

  return Vec3.fromPoint3D(point).equals(cell.position);
});
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    v-slot="{ zIndex }"
    @pointerenter="ui.hoverAt(cell)"
    @pointerleave="ui.unhover()"
    @pointerup="cell.onClick()"
  >
    <BoardCellSprite :cell="cell" />
    <BoardCellHighlight :cell="cell" />
    <MoveIntentPath :cell="cell" />

    <template v-if="config.DEBUG">
      <text
        :style="{ fill: 'white', fontSize: 30 }"
        :z-index="9999"
        :scale="0.25"
        :y="-12"
        :anchor="{ x: 0.5, y: 0.5 }"
      >
        {{ cell.position.x }}.{{ cell.position.y }}
      </text>
      <text
        :style="{ fill: 'white', fontSize: 20 }"
        :z-index="9999"
        :scale="0.25"
        :y="-4"
        :anchor="{ x: 0.5, y: 0.5 }"
      >
        {{ zIndex }}
      </text>
    </template>
  </AnimatedIsoPoint>

  <AnimatedIsoPoint :position="cell.position" event-mode="none" :z-index-offset="50">
    <UnitSprite v-if="activeUnit && isActiveUnitMoveIntentCell" :unit="activeUnit" />
  </AnimatedIsoPoint>
</template>
