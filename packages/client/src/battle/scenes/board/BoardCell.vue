<script lang="ts" setup>
import { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import BoardCellSprite from './BoardCellSprite.vue';
import { useGameUi } from '@/battle/composables/useGameClient';
import { config } from '@/utils/config';
import BoardCellHighlight from './BoardCellHighlight.vue';
import MoveIntentPath from './MoveIntentPath.vue';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();

const ui = useGameUi();
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    v-slot="{ zIndex }"
    @pointerenter="ui.hoverAt(cell)"
    @pointerleave="ui.unhover()"
    @pointerup="ui.onCellClick(cell)"
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
</template>
