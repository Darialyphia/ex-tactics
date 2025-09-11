import { useSafeInject } from '@/shared/composables/useSafeInject';
import { radialGradient } from '@/utils/sprite';
import { Container, Sprite, Point as PixiPoint } from 'pixi.js';
import type { ComputedRef } from 'vue';
import { onTick } from 'vue3-pixi';
import { useGameUi } from './useGameClient';
import { config } from '@/utils/config';

export type LightManagerContext = {
  isReady: ComputedRef<boolean>;
  addLightSource(id: string, object: Container): void;
};

export const LIGHTS_MANAGER_INJECTION_KEY = Symbol(
  'lights_manager'
) as InjectionKey<LightManagerContext>;

export const provideLightsManager = (container: Ref<Container | null>) => {
  const lightTexture = radialGradient(32, 32, [
    [0, 'rgba(255,255,255,1)'],
    [0.5, 'rgba(255,255,255,1)'],
    [1, 'rgba(255,255,255,0)']
  ]);

  const ui = useGameUi();

  const lights = new Map<
    string,
    {
      sprite: Sprite;
      reference: Container;
    }
  >();

  const createLightSprite = () => {
    const zoom = ui.value.camera?.getZoom() ?? config.CAMERA.INITIAL_ZOOM;
    const sprite = new Sprite(lightTexture);
    sprite.anchor.set(0.5, 0.6);
    sprite.scale.set(zoom * 5, zoom * 5 * 0.75);
    sprite.tint = 0xffeebb;
    return sprite;
  };

  const ctx: LightManagerContext = {
    isReady: computed(() => !!container.value),
    addLightSource(id, object) {
      const newLight = createLightSprite();
      lights.set(id, { sprite: newLight, reference: object });
    }
  };

  onTick(() => {
    const c = container.value;
    if (!c) return;
    const zoom = ui.value.camera?.getZoom() ?? config.CAMERA.INITIAL_ZOOM;

    lights.forEach(light => {
      if (!light.sprite.parent) {
        c.addChild(light.sprite);
      }

      const tmp = new PixiPoint();
      light.reference.getGlobalPosition(tmp);
      light.sprite.position.copyFrom(c.toLocal(tmp));
      light.sprite.scale.set(zoom * 5, zoom * 5 * 0.75);
    });
  });

  provide(LIGHTS_MANAGER_INJECTION_KEY, ctx);

  return ctx;
};

export const useLightsManager = () => useSafeInject(LIGHTS_MANAGER_INJECTION_KEY);
