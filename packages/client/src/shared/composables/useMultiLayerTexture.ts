import type { AsepriteSheetData, ParsedAsepriteSheet } from '@/utils/aseprite-parser';
import { objectEntries, type Nullable } from '@game/shared';
import {
  Container,
  Sprite,
  Spritesheet,
  Texture,
  TextureSource,
  type BLEND_MODES,
  type FrameObject
} from 'pixi.js';
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

  const frameDurations = computed(() => {
    const _sheet = toValue(sheet);
    const _tag = toValue(tag);

    if (!_sheet) return [];
    const s = Object.values(_sheet.sheets.base)[0] as Spritesheet<AsepriteSheetData>;
    const frameNames = s.data.animations![_tag]!;
    const frames = frameNames.map(name => s.data.frames[name]);

    return frames.map(f => f.duration);
  });
  const app = useApplication();

  const textures = shallowRef<Texture<TextureSource<any>>[]>([]);
  watchEffect(() => {
    const _sheet = toValue(sheet);
    if (!_sheet) return;
    const containers: Container[] = [];

    textures.value = [];

    groups.value.forEach(group => {
      group.textures.forEach((texture, index) => {
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

  return computed<Array<Texture | FrameObject>>(() => {
    const res = textures.value.length
      ? textures.value.map((texture, index) => ({
          texture,
          time: frameDurations.value[index]
        }))
      : [Texture.EMPTY];

    return res;
  });
};
