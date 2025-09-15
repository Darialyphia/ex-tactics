import { useSafeInject } from '@/shared/composables/useSafeInject';
import { config } from '@/utils/config';
import { Vec2, type Point, type Point3D } from '@game/shared';
import type { Viewport } from 'pixi-viewport';
import type { InjectionKey, Ref } from 'vue';
import type { IsoWorldContext } from './useIsoWorld';
import { useMediaQuery } from '@vueuse/core';

export type RotationAngle = 0 | 90 | 180 | 270;

export type IsoCameraContext = {
  angle: Ref<RotationAngle>;
  offset: Ref<{ x: number; y: number }>;
  viewport: Ref<Viewport | null>;
  isDragging: Ref<boolean>;
  provideViewport(viewport: Viewport): void;
  toScreen(point: Point3D): Point;
  rotateCW(): void;
  rotateCCW(): void;
  getZoom(): number;
  moveTo(point: Point, duration: number): void;
};
const ISOCAMERA_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<IsoCameraContext>;

export const useIsoCameraProvider = (isoWorld: IsoWorldContext) => {
  const isMobile = useMediaQuery(`(width <= ${config.MOBILE_MAX_WIDTH}px)`);
  const defaultZoom = isMobile.value
    ? config.CAMERA.INITIAL_MOBILE_ZOOM
    : config.CAMERA.INITIAL_ZOOM;

  const api: IsoCameraContext = {
    angle: isoWorld.angle as Ref<RotationAngle>,
    offset: ref({ x: 0, y: 0 }),
    viewport: ref(null),
    isDragging: ref(false),
    rotateCW() {
      api.angle.value = ((api.angle.value + 360 + 90) % 360) as RotationAngle;
    },
    rotateCCW() {
      api.angle.value = ((api.angle.value + 360 - 90) % 360) as RotationAngle;
    },
    getZoom() {
      return api.viewport.value?.scale.x ?? defaultZoom;
    },
    moveTo(point, duration) {
      if (!api.viewport.value) return;
      api.viewport.value?.animate({
        position: Vec2.fromPoint(point).add(api.offset.value),
        scale: defaultZoom,
        time: duration,
        ease: 'easeOutQuad'
      });
    },
    provideViewport(viewport) {
      api.viewport.value = viewport;
      viewport.on('drag-start', () => {
        api.isDragging.value = true;
      });
      viewport.on('drag-end', () => {
        api.isDragging.value = false;
      });
    },
    toScreen(point) {
      if (!api.viewport.value) return { x: 0, y: 0 };
      const iso = isoWorld.toIso(point);
      return api.viewport.value.toScreen({
        x: iso.x + api.offset.value.x,
        y: iso.y + api.offset.value.y
      });
    }
  };

  provide(ISOCAMERA_INJECTION_KEY, api);

  return api;
};

export const useIsoCamera = () => useSafeInject(ISOCAMERA_INJECTION_KEY);
