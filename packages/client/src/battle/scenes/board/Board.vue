<script lang="ts" setup>
import { useBoard } from '@/battle/composables/useGameClient';
import BoardCell from './BoardCell.vue';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import type { Point3D } from '@game/shared';
import { rotateCartesian } from '@/iso/composables/useIso';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';

const board = useBoard();
const camera = useIsoCamera();

const displayedCells = computed(() => {
  const cellMap = new Map<string, BoardCellViewModel>();
  const getKey = (cell: Point3D) => `${cell.x}-${cell.y}-${cell.z}`;

  board.value.cells.forEach(cell => {
    cellMap.set(getKey(cell.position), cell);
  });
  return board.value.cells.filter(cell => {
    const rotated = rotateCartesian(
      cell.position,
      { columns: board.value.cols, rows: board.value.rows },
      camera.angle.value
    );

    const result = !(
      cellMap.get(getKey({ x: rotated.x + 1, y: rotated.y, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x, y: rotated.y + 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x - 1, y: rotated.y + 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: rotated.x, y: rotated.y - 1, z: rotated.z })) &&
      cellMap.get(getKey({ x: cell.position.x, y: cell.position.y, z: cell.position.z + 1 }))
    );

    return result;
  });
});
</script>

<template>
  <BoardCell v-for="cell in displayedCells" :key="cell.id" :cell="cell" />
</template>
