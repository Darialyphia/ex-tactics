import { radialGradient } from '@/utils/sprite';
import { Container, Sprite, Point as PixiPoint } from 'pixi.js';
import { defineStore } from 'pinia';

const smoothNoise = (t: number) => {
  return (
    0.5 + 0.3 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 0.97 + 1.3) + 0.1 * Math.sin(t * 2.23 + 0.7)
  );
};

export const useLights = defineStore('lights', () => {
  const container = shallowRef<Container | null>(null);
  const ambientLightContainer = shallowRef<Container | null>(null);

  const lightTexture = radialGradient(32, 32, [
    [0, 'rgba(255,255,255,1)'],
    [0.5, 'rgba(255,255,255,1)'],
    [1, 'rgba(255,255,255,0)']
  ]);

  const lights = new Map<
    string,
    {
      id: number;
      container: Container;
      sprite: Sprite;
      reference: Container;
      flickerSeed: number;
    }
  >();
  let nextLightId = 1;

  const lightsSettings = reactive({
    ambientColor: 0x222222,
    ambientAlpha: 0.65,
    lightIntensity: 5,
    lightAlpha: 0.5,
    lightColor: 0xffeebb
  });

  const createLightSprite = () => {
    const lightContainer = new Container();

    const sprite = new Sprite(lightTexture);
    lightContainer.addChild(sprite);

    sprite.anchor.set(0.5, 0.6);
    sprite.scale.set(lightsSettings.lightIntensity, lightsSettings.lightIntensity * 0.75);
    sprite.tint = lightsSettings.lightColor;
    sprite.alpha = lightsSettings.lightAlpha;

    return { sprite, container: lightContainer, flickerSeed: Math.random() };
  };

  return {
    isReady: computed(() => !!container.value),
    ambientLightColor: computed({
      get: () => lightsSettings.ambientColor,
      set: (val: number) => {
        lightsSettings.ambientColor = val;
        if (!ambientLightContainer.value) return;
        gsap.to(ambientLightContainer.value, {
          duration: 0.5,
          pixi: {
            tint: val
          },
          easing: Power2.easeOut
        });
      }
    }),
    ambientLightAlpha: computed({
      get: () => lightsSettings.ambientAlpha,
      set: (val: number) => {
        lightsSettings.ambientAlpha = val;
        if (!ambientLightContainer.value) return;
        gsap.to(ambientLightContainer.value, {
          duration: 0.5,
          alpha: val,
          easing: Power2.easeOut
        });
      }
    }),
    lightIntensity: computed({
      get: () => lightsSettings.lightIntensity,
      set: (val: number) => {
        lightsSettings.lightIntensity = val;
        lights.forEach(light => {
          gsap.to(light.sprite, {
            duration: 0.5,
            pixi: {
              scaleX: val,
              scaleY: val * 0.75
            },
            easing: Power2.easeOut
          });
        });
      }
    }),
    lightColor: computed({
      get: () => lightsSettings.lightColor,
      set: (val: number) => {
        lightsSettings.lightColor = val;
        lights.forEach(light => {
          gsap.to(light.sprite, {
            duration: 0.5,
            pixi: {
              tint: val
            },
            easing: Power2.easeOut
          });
        });
      }
    }),
    lightAlpha: computed({
      get: () => lightsSettings.lightAlpha,
      set: (val: number) => {
        lightsSettings.lightAlpha = val;
        lights.forEach(light => {
          gsap.to(light.sprite, {
            duration: 0.5,
            pixi: {
              alpha: val
            },
            easing: Power2.easeOut
          });
        });
      }
    }),
    addLightSource(id: string, object: Container) {
      const newLight = createLightSprite();
      lights.set(id, { ...newLight, reference: object, id: nextLightId++ });
    },
    removeLightSource(id: string) {
      const light = lights.get(id);
      if (!light) return;
      if (light.container.parent) {
        light.container.parent.removeChild(light.container);
      }
      lights.delete(id);
    },
    container,
    ambientLightContainer: computed({
      get() {
        return ambientLightContainer.value;
      },
      set(val) {
        if (val) {
          ambientLightContainer.value = val;
          ambientLightContainer.value.tint = lightsSettings.ambientColor;
          ambientLightContainer.value.alpha = lightsSettings.ambientAlpha;
        }
      }
    }),
    onTick: ({ lastTime }: { lastTime: number }) => {
      const c = container.value;
      if (!c) return;

      const t = lastTime / 1000;

      lights.forEach(light => {
        if (!light.container.parent) {
          c.addChild(light.container);
        }

        const base = 0.7;
        const n = smoothNoise(t + light.flickerSeed);
        light.container.alpha = base * (0.8 + n * 0.8);

        const tmp = new PixiPoint();
        light.reference.getGlobalPosition(tmp);
        light.sprite.position.copyFrom(c.toLocal(tmp));
      });
    }
  };
});
