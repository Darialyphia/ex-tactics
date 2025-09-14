<script setup lang="ts">
import { useClientPlayerId, useGameUi } from '@/battle/composables/useGameClient';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import {
  CELL_HIGHLIGHTS,
  type BoardCellViewModel
} from '@game/engine/src/client/view-models/board-cell.model';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();
const ui = useGameUi();
const clientPlayerId = useClientPlayerId();

const tag = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  clientPlayerId.value; //reference the variable for reactivity reasons

  if (cell.canDeploy) return CELL_HIGHLIGHTS.CYAN;
  if (cell.activeUnitCanMove) {
    return cell.enemiesInAttackRange.length ? CELL_HIGHLIGHTS.PURPLE : CELL_HIGHLIGHTS.BLUE;
  }
  if (cell.activeUnitCanAttack && ui.value.selectedUnitAction?.type === 'attack')
    return CELL_HIGHLIGHTS.RED;

  return null;
});
</script>

<template>
  <UiAnimatedSprite v-if="tag" assetId="cell-highlights" :tag="tag" :anchor="0.5" />
</template>
