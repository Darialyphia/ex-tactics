<script setup lang="ts">
import { useGameUi, useMyPlayer } from '@/battle/composables/useGameClient';
import IsoPoint from '@/iso/scenes/IsoPoint.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { GlowFilter } from 'pixi-filters';
import HeroToDeploy from '../unit/HeroToDeploy.vue';

const ui = useGameUi();
const player = useMyPlayer();

const canDeploy = computed(() => {
  const hoveredCell = ui.value.hoveredCell as BoardCellViewModel | null;
  if (!hoveredCell) return false;
  return player.value.deployZone.some(cell => cell.equals(hoveredCell));
});

const glowFilter = new GlowFilter({
  distance: 15,
  outerStrength: 4,
  innerStrength: 0,
  color: 0x00ffff,
  quality: 0.5
});
</script>

<template>
  <IsoPoint
    v-if="ui.hoveredCell"
    :position="ui.hoveredCell.position"
    :z-index-offset="20"
    event-mode="none"
  >
    <UiAnimatedSprite assetId="hovered-cell" />
  </IsoPoint>

  <IsoPoint
    v-if="ui.hoveredCell && ui.selectedHeroToDeploy && canDeploy"
    :position="ui.hoveredCell.position"
    :z-index-offset="50"
    event-mode="none"
  >
    <HeroToDeploy :hero="ui.selectedHeroToDeploy" :filters="[glowFilter]" />
  </IsoPoint>
</template>
