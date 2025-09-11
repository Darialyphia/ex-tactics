import { useSafeInject } from '@/shared/composables/useSafeInject';
import { config } from '@/utils/config';
import type { Point } from '@game/shared';
import type { Viewport } from 'pixi-viewport';
import type { InjectionKey, Ref } from 'vue';

export type RotationAngle = 0 | 90 | 180 | 270;

export type IsoCameraContext = {
  angle: Ref<RotationAngle>;
  offset: Ref<{ x: number; y: number }>;
  viewport: Ref<Viewport | null>;
  isDragging: Ref<boolean>;
  provideViewport(viewport: Viewport): void;
  toScreen(point: Point): Point;
  rotateCW(): void;
  rotateCCW(): void;
  getZoom(): number;
};
const ISOCAMERA_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<IsoCameraContext>;

export const useIsoCameraProvider = (angle: Ref<RotationAngle>) => {
  const api: IsoCameraContext = {
    angle,
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
      return api.viewport.value?.scale.x ?? config.CAMERA.INITIAL_ZOOM;
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
      return api.viewport.value.toScreen({
        x: point.x + api.offset.value.x,
        y: point.y + api.offset.value.y
      });
    }
  };

  provide(ISOCAMERA_INJECTION_KEY, api);

  return api;
};

export const useIsoCamera = () => useSafeInject(ISOCAMERA_INJECTION_KEY);
