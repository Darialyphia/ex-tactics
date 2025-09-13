<script setup lang="ts">
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { config } from '@/utils/config';
import { unitHitArea } from '@/utils/sprite';
import type { ObstacleViewModel } from '@game/engine/src/client/view-models/obstacle.model';

const { obstacle } = defineProps<{
  obstacle: ObstacleViewModel;
}>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => obstacle.spriteId);

const textures = useMultiLayerTexture({
  sheet,
  parts: () => obstacle.spriteParts,
  tag: 'idle'
});
</script>

<template>
  <container>
    <animated-sprite
      :anchor="config.UNIT_ANCHOR"
      :textures="textures"
      :hit-area="unitHitArea"
      event-mode="none"
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
