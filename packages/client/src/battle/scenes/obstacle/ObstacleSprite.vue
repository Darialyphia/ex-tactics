<script setup lang="ts">
import { useActiveUnit, useFxEvent } from '@/battle/composables/useGameClient';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { config } from '@/utils/config';
import { unitHitArea } from '@/utils/sprite';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';
import { Vec3 } from '@game/shared';
import { ColorOverlayFilter, OutlineFilter } from 'pixi-filters';
import type { Filter } from 'pixi.js';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const sheet = useSpritesheet<'', 'base'>(() => obstacle.spriteId);

const textures = useMultiLayerTexture({
  sheet,
  parts: () => obstacle.spriteParts,
  tag: 'idle'
});

const attackIntentFilter = new OutlineFilter({
  color: 0xff0000,
  thickness: 2,
  quality: 0.5
});
const takeDamageFilter = new ColorOverlayFilter({
  color: 0xff0000,
  alpha: 0
});

const activeUnit = useActiveUnit();

const filters = computed(() => {
  const result: Filter[] = [takeDamageFilter];

  if (
    activeUnit.value &&
    activeUnit.value.attackIntent &&
    Vec3.fromPoint3D(activeUnit.value.attackIntent).equals(obstacle.position)
  ) {
    result.push(attackIntentFilter);
  }
  return result;
});

useFxEvent(FX_EVENTS.OBSTACLE_AFTER_TAKE_DAMAGE, async e => {
  if (e.obstacle !== obstacle.id) return;
  gsap.to(takeDamageFilter, {
    alpha: 0.5,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: Power1.easeInOut
  });
});
</script>

<template>
  <container>
    <animated-sprite
      :anchor="config.UNIT_ANCHOR"
      :textures="textures"
      :hit-area="unitHitArea"
      :filters="filters"
    />
    <graphics
      v-if="config.DEBUG"
      :alpha="0.5"
      @effect="
        g => {
          g.clear()
            .roundRect(
              unitHitArea.x,
              unitHitArea.y,
              unitHitArea.width,
              unitHitArea.height,
              unitHitArea.radius
            )
            .fill('red');
        }
      "
    />
  </container>
</template>
