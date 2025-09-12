import { RenderLayer, type IRenderLayer } from 'pixi.js';
import type { InjectionKey } from 'vue';
import { useStage } from 'vue3-pixi';
import { useSafeInject } from './useSafeInject';
import type { Values } from '@game/shared';

export const LAYERS = {
  SCENE: 'scene',
  FX: 'fx',
  UI: 'ui'
} as const;
export type LayerName = Values<typeof LAYERS>;

export type LayersContext = {
  layers: Record<LayerName, IRenderLayer>;
};

export const LAYERS_INJECTION_KEY = Symbol('layers') as InjectionKey<LayersContext>;

export const provideLayers = () => {
  const layers: Record<LayerName, IRenderLayer> = {
    [LAYERS.SCENE]: new RenderLayer(),
    [LAYERS.FX]: new RenderLayer(),
    [LAYERS.UI]: new RenderLayer()
  };

  const stage = useStage();
  stage.value.addChild(layers.scene);
  stage.value.addChild(layers.fx);
  stage.value.addChild(layers.ui);

  provide(LAYERS_INJECTION_KEY, { layers });
};

export const useLayers = () => useSafeInject(LAYERS_INJECTION_KEY);
