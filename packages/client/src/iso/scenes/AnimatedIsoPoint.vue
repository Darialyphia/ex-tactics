<script setup lang="ts">
import { deg2Rad, isDefined, Vec2, type Point3D } from '@game/shared';
import { Container } from 'pixi.js';
import { useIsoPoint } from '../composables/useIsoPoint';
import { config } from '@/utils/config';
import { useIsoWorld } from '../composables/useIsoWorld';
import { rotateCartesian } from '../composables/useIso';

const {
  position,
  zIndexOffset,
  isAnimated = true
} = defineProps<{
  position: Point3D;
  zIndexOffset?: number;
  isAnimated?: boolean;
}>();

const emit = defineEmits<{
  update: [Point3D];
}>();

const { isoPosition, zIndex } = useIsoPoint({
  position: computed(() => position),
  zIndexOffset: computed(() => zIndexOffset)
});

const containerRef = ref<Container>();

const grid = useIsoWorld();

watch(
  [isoPosition, zIndex, grid.angle, containerRef],
  ([pos, zIndex, angle, container], [oldPos, , oldAngle, prevContainer]) => {
    if (!container) return;
    if (!isAnimated || !prevContainer || !isDefined(oldAngle) || !oldPos) {
      container.position.set(pos.x, pos.y);
      emit('update', pos);
      container.zIndex = zIndex;
      return;
    }

    if (angle !== oldAngle) {
      const center = { x: (grid.columns.value - 1) / 2, y: (grid.rows.value - 1) / 2 };

      const rotatedOldCartesianPos = rotateCartesian(
        position,
        { columns: grid.columns.value, rows: grid.rows.value },
        oldAngle
      );

      const startVector = {
        x: rotatedOldCartesianPos.x - center.x,
        y: rotatedOldCartesianPos.y - center.y
      };

      const start = deg2Rad(oldAngle === 0 && angle === 270 ? 360 : oldAngle);
      const end = deg2Rad(oldAngle === 270 && angle === 0 ? 360 : angle);
      const delta = end - start;

      const state = { angle: 0 };

      gsap.to(state, {
        angle: delta,
        duration: config.ISO_TILES_ROTATION_SPEED,
        ease: Power1.easeInOut,
        onUpdate: () => {
          const newVector = Vec2.fromPoint(startVector).rotate(state.angle).add(center);

          const point = { x: newVector.x, y: newVector.y, z: oldPos.z };
          const iso = grid.toIso(point, 0); // angle-agnostic projection
          containerRef.value?.position.set(iso.x, iso.y);
          containerRef.value!.zIndex = grid.getZIndex(iso, zIndexOffset);
          emit('update', { x: iso.x, y: iso.y, z: pos.z });
        },
        onComplete: () => {
          containerRef.value!.position.set(isoPosition.value.x, isoPosition.value.y);
          containerRef.value!.zIndex = zIndex;
        }
      });

      // const center = {
      //   x: (grid.columns.value - 1) / 2,
      //   y: (grid.rows.value - 1) / 2
      // };

      // const oldVector = {
      //   x: oldPos.x - center.x,
      //   y: oldPos.y - center.y
      // };

      // if (!containerRef.value) return;

      // const rotationState = { angle: deg2Rad(oldAngle) };

      // gsap.to(rotationState, {
      //   duration: config.ISO_TILES_ROTATION_SPEED,
      //   angle: deg2Rad(grid.angle.value),
      //   ease: Power1.easeInOut,
      //   onUpdate: () => {
      //     const vec = Vec2.fromPoint(oldVector).rotate(rotationState.angle - deg2Rad(oldAngle));
      //     const iso = grid.toIso({ x: vec.x + center.x, y: vec.y + center.y, z: position.z }, 0); // 0 angle to avoid double rotation
      //     containerRef.value!.position.set(iso.x, iso.y);
      //   }
      // });
    } else {
      gsap.killTweensOf(container);

      gsap.to(container, {
        duration: config.ISO_TILES_ROTATION_SPEED,
        pixi: {
          x: pos.x,
          y: pos.y
        },
        zIndex: zIndex,
        ease: Power1.easeInOut,
        onUpdate: () => {
          emit('update', { x: container.x, y: container.y, z: pos.z });
        }
      });
    }
  },
  { immediate: true }
);

defineExpose({ container: containerRef });
</script>

<template>
  <container ref="containerRef" :pivot="{ x: 0, y: 0 }" sortable-children>
    <slot :isoPosition="isoPosition" :z-index="zIndex" :container="containerRef" />
  </container>
</template>
