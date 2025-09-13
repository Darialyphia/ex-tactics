<script setup lang="ts">
import { useGameUi } from '@/battle/composables/useGameClient';
import AnimatedIsoPoint from '@/iso/scenes/AnimatedIsoPoint.vue';
import HeroToDeploy from './HeroToDeploy.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import Layer from '@/shared/scenes/Layer.vue';
import OrientationArrow from '../OrientationArrow.vue';
import { config } from '@/utils/config';
import { DIRECTION } from '@game/engine/src/board/board.utils';

const ui = useGameUi();

const DIRECTION_ROTATION_CW = {
  [DIRECTION.NORTH]: DIRECTION.EAST,
  [DIRECTION.EAST]: DIRECTION.SOUTH,
  [DIRECTION.SOUTH]: DIRECTION.WEST,
  [DIRECTION.WEST]: DIRECTION.NORTH
};
</script>

<template>
  <AnimatedIsoPoint
    v-for="hero in ui.deployment"
    :key="hero.hero.blueprintId"
    :position="hero.position"
    :z-index-offset="50"
  >
    <container>
      <Layer layer="ui">
        <UiAnimatedSprite
          v-if="ui.hoveredHeroInDeployActionBar?.blueprintId === hero.hero.blueprintId"
          asset-id="ui-arrow-down"
          event-mode="none"
          :y="-55"
        />
      </Layer>
      <OrientationArrow :orientation="hero.orientation" />
      <HeroToDeploy
        :hero="hero.hero"
        :direction="hero.orientation"
        :y="ui.selectedHeroToDeploy?.blueprintId === hero.hero.blueprintId ? -6 : 0"
        :event-mode="ui.selectedHeroToDeploy ? 'none' : 'static'"
        @pointerup="ui.selectedHeroToDeploy = hero.hero"
      />
      <UiAnimatedSprite
        v-if="!ui.selectedHeroToDeploy"
        asset-id="orientation-icon"
        :y="-config.UNIT_SPRITE_SIZE.height + config.UNIT_HITBOX.offset"
        event-mode="static"
        @pointerup="hero.orientation = DIRECTION_ROTATION_CW[hero.orientation]"
      />
    </container>
  </AnimatedIsoPoint>
</template>
