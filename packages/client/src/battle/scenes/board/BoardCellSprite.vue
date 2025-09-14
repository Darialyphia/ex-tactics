<script lang="ts" setup>
import { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { Hitbox } from '@/utils/hitbox';
import { config } from '@/utils/config';

const { cell } = defineProps<{ cell: BoardCellViewModel }>();

const sheet = useSpritesheet<'', 'tile'>(() => cell.spriteId);

const { offsetW, offsetH } = {
  offsetW: -config.TILE_SIZE.x / 2,
  offsetH: -config.TILE_SIZE.z * 1.25
};

const hitArea = Hitbox.from(
  [
    [
      offsetW + 0,
      offsetH + config.TILE_SIZE.y / 2,

      offsetW + config.TILE_SIZE.x / 2,
      offsetH + 0,

      offsetW + config.TILE_SIZE.x,
      offsetH + config.TILE_SIZE.y / 2,

      offsetW + config.TILE_SIZE.x,
      offsetH + config.TILE_SIZE.y / 2 + config.TILE_SIZE.z,

      offsetW + config.TILE_SIZE.x / 2,
      offsetH + config.TILE_SPRITE_SIZE.height,

      offsetW + 0,
      offsetH + config.TILE_SIZE.y / 2 + config.TILE_SIZE.z
    ]
  ],
  { width: config.TILE_SPRITE_SIZE.width, height: config.TILE_SPRITE_SIZE.height },
  {
    x: 0,
    y: 0
  }
);
</script>

<template>
  <animated-sprite
    v-if="sheet && !config.DEBUG"
    :anchor="0.5"
    :textures="sheet.sheets.base.tile.animations[0]"
    :hit-area="hitArea"
  />
  <graphics
    v-if="config.DEBUG"
    @effect="
      g => {
        g.setStrokeStyle({ width: 2, color: 'red' });
        hitArea.shape.forEach(polygon => {
          g.poly(polygon.points);
        });
        g.stroke().fill(0x770000);
      }
    "
  />
</template>
