<script setup lang="ts">
import { useGameUi } from '@/battle/composables/useGameClient';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();

const ui = useGameUi();
const tag = computed(() => {
  return ui.value.getCellHighlight(cell);
});
</script>

<template>
  <UiAnimatedSprite v-if="tag" assetId="cell-highlights" :tag="tag" :anchor="0.5" />
</template>
