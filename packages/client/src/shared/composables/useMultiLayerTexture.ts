import type { ParsedAsepriteSheet } from '@/utils/aseprite-parser';
import { objectEntries, type Nullable } from '@game/shared';
import { Container, Sprite, Texture, TextureSource, type BLEND_MODES } from 'pixi.js';
import { useApplication } from 'vue3-pixi';

export const useMultiLayerTexture = <
  TGroups extends string,
  TBaseLayers extends string,
  TGroupLayers extends string
>({
  sheet,
  tag,
  parts
}: {
  sheet: MaybeRefOrGetter<Nullable<ParsedAsepriteSheet<TGroups, TBaseLayers, TGroupLayers>>>;
  tag: MaybeRefOrGetter<string>;
  parts: MaybeRefOrGetter<Record<TGroupLayers, TGroups | null>>;
}) => {
  const sheets = computed(() => {
    const _sheet = toValue(sheet);
    if (!_sheet) return [];
    const result = objectEntries(_sheet.sheets.base).map(([, sheet]) => ({
      sheet
    }));
    Object.entries(toValue(parts)).forEach(([part, group]) => {
      if (!group) return;
      result.push({
        //@ts-expect-error sorry I'm not Matt Pocock
        sheet: _sheet.sheets[group][part]
      });
    });
    return result;
  });

  const groups = computed(() => {
    return sheets.value.map(({ sheet }) => {
      return {
        meta: sheet.data.meta as unknown as { opacity: number; blendMode?: BLEND_MODES },
        textures: sheet.animations[toValue(tag)]
      };
    });
  });

  const app = useApplication();

  const textures = shallowRef<Texture<TextureSource<any>>[]>([]);
  watchEffect(() => {
    const _sheet = toValue(sheet);
    if (!_sheet) return;

    const containers: Container[] = [];

    textures.value = [];
    // const graphics: Graphics[] = []; // graphics for all frames of the animation

    groups.value.forEach(group => {
      group.textures.forEach((texture, index) => {
        // if (!graphics[index]) {
        //   graphics[index] = new Graphics();
        // }
        if (!containers[index]) {
          containers[index] = new Container();
        }

        const c = containers[index];
        const sprite = new Sprite(texture);
        if (group.meta.blendMode) {
          sprite.blendMode = group.meta.blendMode;
        }
        sprite.alpha = group.meta.opacity / 255;
        c.addChild(sprite);
        // const g = graphics[index];

        // // @TODO: probable need to cache this
        // const baked = app.value.renderer.generateTexture(new Sprite(texture));

        // g.rect(0, 0, dimensions.width, dimensions.height).fill({
        //   texture: baked,
        //   textureSpace: 'local'
        // });
      });
    });

    containers.forEach(c => {
      const renderTexture = app.value.renderer.generateTexture({
        target: c,
        textureSourceOptions: {
          scaleMode: 'nearest'
        }
      });
      textures.value.push(renderTexture);
    });

    // graphics.forEach(g => {
    //   textures.value.push(app.value.renderer.generateTexture(g));
    // });
  });

  return computed(() => (textures.value.length ? textures.value : [Texture.EMPTY]));
};
