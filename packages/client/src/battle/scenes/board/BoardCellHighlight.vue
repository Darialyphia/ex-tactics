<script setup lang="ts">
import {
  useActiveUnit,
  useBoard,
  useClientPlayerId,
  useGameUi,
  useIsPlayingFX
} from '@/battle/composables/useGameClient';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import {
  CELL_HIGHLIGHTS,
  type BoardCellViewModel
} from '@game/engine/src/client/view-models/board-cell.model';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();
const ui = useGameUi();
const clientPlayerId = useClientPlayerId();
const activeUnit = useActiveUnit();
const isPlayingFX = useIsPlayingFX();

const tag = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  clientPlayerId.value; //reference the variable for reactivity reasons

  if (isPlayingFX.value) return CELL_HIGHLIGHTS.EMPTY;
  const selectedAction = ui.value.selectedUnitAction;
  const isAttacking = selectedAction?.type === 'attack';
  const isCastingAbility = selectedAction?.type === 'ability';

  if (cell.canDeploy) return CELL_HIGHLIGHTS.CYAN;
  if (activeUnit.value?.canAttack(cell) && isAttacking) {
    return CELL_HIGHLIGHTS.RED;
  }
  if (isCastingAbility && selectedAction.ability.canTarget(cell.position)) {
    return CELL_HIGHLIGHTS.RED;
  }

  if (isAttacking && activeUnit.value?.canAttackFromCurrentPosition(cell)) {
    return CELL_HIGHLIGHTS.YELLOW;
  }

  if (isCastingAbility && selectedAction.ability.isInImpactZone(cell.position)) {
    return CELL_HIGHLIGHTS.ORANGE;
  }

  if (isCastingAbility && selectedAction.ability.canTargetFromCurrentPosition(cell)) {
    return CELL_HIGHLIGHTS.YELLOW;
  }
  if (activeUnit.value?.canMoveTo(cell)) {
    return cell.enemiesInAttackRange.length ? CELL_HIGHLIGHTS.PURPLE : CELL_HIGHLIGHTS.BLUE;
  }

  return null;
});

const board = useBoard();
const isTopMost = computed(() => {
  return !board.value.cells.some(
    c =>
      c.position.x === cell.position.x &&
      c.position.y === cell.position.y &&
      c.position.z > cell.position.z
  );
});
</script>

<template>
  <UiAnimatedSprite
    v-if="isTopMost && tag"
    assetId="cell-highlights"
    :tag="tag"
    :anchor="0.5"
    event-mode="static"
  />
</template>
