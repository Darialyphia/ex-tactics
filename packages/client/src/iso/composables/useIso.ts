import { type Point3D } from '@game/shared';

export type Angle = 0 | 90 | 180 | 270;

export interface TransformOptions {
  rotation: boolean;
  isometric: boolean;
  scale: boolean;
}

const rotateCartesian = (
  { x, y, z }: Point3D,
  { columns, rows }: { columns: number; rows: number },
  rot: Angle
) => {
  switch (rot) {
    case 0:
      return { x, y, z };
    case 90:
      return { x: rows - 1 - y, y: x, z };
    case 180:
      return { x: columns - 1 - x, y: rows - 1 - y, z };
    case 270:
      return { x: y, y: columns - 1 - x, z };
  }
};

export function applyTransforms(
  { x, y, z }: Point3D,
  angle: Angle,
  scale: Point3D,
  dimensions: { columns: number; rows: number; planes: number }
): Point3D {
  const rotated = rotateCartesian({ x, y, z }, dimensions, angle);
  const isoX = (rotated.x - rotated.y) * (scale.x * 0.5);
  const isoY = (rotated.x + rotated.y) * (scale.y * 0.5) - scale.z * z;

  return { x: isoX, y: isoY, z: rotated.z };
}

export const toIso = (
  point: Point3D,
  angle: Angle,
  scale: Point3D,
  dimensions: { columns: number; rows: number; planes: number }
): Point3D => {
  const transformed = applyTransforms(point, angle, scale, dimensions);
  return transformed;
};

export type UseIsoOptions = {
  dimensions: { columns: number; rows: number; planes: number };
  angle?: Angle;
  scale?: Point3D;
};
export const useIso = (
  point: MaybeRefOrGetter<Point3D>,
  options: MaybeRefOrGetter<UseIsoOptions>
) => {
  return computed(() => {
    const _options = toValue(options);
    return toIso(
      toValue(point),
      _options.angle ?? 0,
      _options.scale ?? { x: 1, y: 1, z: 1 },
      _options.dimensions
    );
  });
};
