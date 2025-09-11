<script lang="ts" setup>
import { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import BoardCellSprite from './BoardCellSprite.vue';
import { useGameUi } from '@/battle/composables/useGameClient';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();

const ui = useGameUi();
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    @pointerenter="ui.hoverAt(cell)"
    @pointerleave="ui.unhover()"
  >
    <BoardCellSprite :cell="cell" />

    <!-- <graphics
      @effect="
        g => {
          g.setStrokeStyle({ width: 2, color: 'red' });
          hitArea.shape.forEach(polygon => {
            g.poly(polygon.points);
          });
          g.stroke();
        }
      "
    /> -->
  </AnimatedIsoPoint>
</template>
