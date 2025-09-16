<script setup lang="ts">
import { useActiveUnit, useFxEvent, useGameState } from '@/battle/composables/useGameClient';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { config } from '@/utils/config';
import { unitHitArea } from '@/utils/sprite';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { Vec3 } from '@game/shared';
import { ColorOverlayFilter, OutlineFilter } from 'pixi-filters';
import type { Filter } from 'pixi.js';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const sheet = useSpritesheet<'', 'base'>(() => unit.spriteId);

const textures = useMultiLayerTexture({
  sheet,
  parts: () => unit.spriteParts,
  tag: 'idle'
});

const outlineFilter = new OutlineFilter({
  color: 0xffffff,
  thickness: 2,
  quality: 0.5
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

const state = useGameState();
const isActiveUnit = computed(() => {
  return state.value.activeUnitId === unit.id;
});

const activeUnit = useActiveUnit();
const filters = computed(() => {
  const result: Filter[] = [takeDamageFilter];

  if (isActiveUnit.value) {
    result.push(outlineFilter);
  }
  if (
    activeUnit.value &&
    activeUnit.value.attackIntent &&
    Vec3.fromPoint3D(activeUnit.value.attackIntent).equals(unit.position)
  ) {
    result.push(attackIntentFilter);
  }
  return result;
});

useFxEvent(FX_EVENTS.UNIT_AFTER_TAKE_DAMAGE, async e => {
  const damagedUnit = state.value.entities[e.unit] as UnitViewModel;
  if (!damagedUnit.equals(unit)) return;

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
