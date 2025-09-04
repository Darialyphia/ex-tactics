<script setup lang="ts">
import type { Point3D } from '@game/shared';
import { computed } from 'vue';
import grass from '@/assets/ground.png';
import dirt from '@/assets/dirt.png';
import hoveredCell from '@/assets/hovered-cell.png';

const hoveredCellTexture = `url(${hoveredCell})`;

const rows = 8;
const cols = 8;
const planes = 2;

const cellSize = {
  x: 64,
  y: 32,
  z: 16
};

const padding = 32;
const scale = 2;

const boardDimensions = {
  x: (cols + rows) * (cellSize.x * 0.5) + padding,
  y: (cols + rows) * (cellSize.y * 0.5) + cellSize.z * planes + padding
};

type Cell = {
  x: number;
  y: number;
  z: number;
  isoX: number;
  isoY: number;
  zIndex: number;
  isOpaque: boolean;
  isHalfTile: boolean;
  texture: string;
};

const maxZIndexPerElevation = Math.max(cols * cellSize.x, rows * cellSize.y);

const makePlane = (z: number, texture: string) =>
  Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const isoX = (x - y) * (cellSize.x * 0.5 * scale);
    const isoY = (x + y) * (cellSize.y * 0.5 * scale) - cellSize.z * scale * z;

    return {
      x,
      y,
      z,
      isoX,
      isoY,
      zIndex: isoY + z * maxZIndexPerElevation,
      isOpaque: true,
      isHalfTile: false,
      texture: `url(${texture})`
    };
  });

const cells = Array.from({ length: planes }, (_, z) =>
  makePlane(z, z === planes - 1 ? grass : dirt)
).flat();
const cellMap = new Map<string, Cell>();
const getKey = (cell: Point3D) => `${cell.x}-${cell.y}-${cell.z}`;
cells.forEach(cell => {
  cellMap.set(getKey(cell), cell);
});

const displayedCells = computed(() => {
  const cellMap = new Map<string, Cell>();
  const getKey = (cell: Point3D) => `${cell.x}-${cell.y}-${cell.z}`;
  cells.forEach(cell => {
    cellMap.set(getKey(cell), cell);
  });
  return cells.filter(cell => {
    const inFront = cellMap.get(getKey({ x: cell.x + 1, y: cell.y + 1, z: cell.z + 1 }));
    if (!inFront) return true;

    return !inFront.isOpaque && !inFront.isHalfTile;
  });
});
</script>

<template>
  <main>
    <div class="iso-board">
      <div
        v-for="cell in displayedCells"
        :key="`${cell.x}-${cell.y}`"
        class="iso-cell"
        :style="{
          '--x':
            cell.isoX -
            cellSize.x * 0.5 * scale +
            rows * (cellSize.x * 0.5 * scale) +
            padding * 0.5 * scale,
          '--bg': cell.texture,
          '--y': cell.isoY + planes * (cellSize.z * 0.5 * scale) + padding * 0.5 * scale,
          '--z-index': cell.zIndex
        }"
      />
    </div>
  </main>
</template>

<style scoped>
main {
  display: grid;
  place-content: center;
  height: 100dvh;
  overflow: hidden;
}

.iso-board {
  image-rendering: pixelated;
  position: relative;
  width: calc(1px * v-bind('boardDimensions.x * scale'));
  height: calc(1px * v-bind('boardDimensions.y * scale'));
  /* overflow: hidden; */
  outline: solid 1px white;
}

.iso-cell {
  width: calc(1px * v-bind('cellSize.x') * v-bind('scale'));
  height: calc(1px * (v-bind('cellSize.y') + v-bind('cellSize.z')) * v-bind('scale'));
  background: var(--bg);
  background-size: cover;
  position: absolute;
  translate: calc(1px * var(--x)) calc(1px * var(--y));
  z-index: var(--z-index);
  /* We add a slight offset to the clip path otherwise the sprite get clipped at a half pixel */
  --clip-fix: 3px;
  clip-path: polygon(
    calc(-1 * var(--clip-fix)) 25%,
    50% calc(-1 * var(--clip-fix)),
    calc(100% + var(--clip-fix)) 25%,
    calc(100% + var(--clip-fix)) 75%,
    50% calc(100% + var(--clip-fix)),
    calc(-1 * var(--clip-fix)) 75%
  );

  &:hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(hoveredCellTexture);
    background-size: cover;
    pointer-events: none;
  }
}
</style>
