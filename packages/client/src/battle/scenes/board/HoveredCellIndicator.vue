<script setup lang="ts">
import { useGameUi } from '@/battle/composables/useGameClient';
import IsoPoint from '@/iso/scenes/IsoPoint.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';

const ui = useGameUi();
</script>

<template>
  <IsoPoint
    v-if="ui.hoveredCell"
    :position="ui.hoveredCell.position"
    :z-index-offset="20"
    event-mode="none"
  >
    <UiAnimatedSprite assetId="hovered-cell" />
    <!-- <container
        v-if="canDeploy && ui.selectedUnit && state.phase === GAME_PHASES.DEPLOY"
        :alpha="0.5"
        :position="config.UNIT_SPRITE_OFFSET"
      >
        <UnitOrientation :unit="ui.selectedUnit">
          <UnitSprite :unit="ui.selectedUnit" />
        </UnitOrientation>
      </container> -->
  </IsoPoint>
</template>
