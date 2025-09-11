import { deg2Rad, Vec2, type Point3D } from '@game/shared';

export type Angle = 0 | 90 | 180 | 270;

export interface TransformOptions {
  rotation: boolean;
  isometric: boolean;
  scale: boolean;
}

export const rotateCartesian = (
  { x, y, z }: Point3D,
  { columns, rows }: { columns: number; rows: number },
  rot: Angle
) => {
  const center = { x: (columns - 1) / 2, y: (rows - 1) / 2 };
  const vec = new Vec2(x, y).sub(center).rotate(deg2Rad(rot)).add(center);
  return { ...vec, z };
};

export function applyTransforms(
  { x, y, z }: Point3D,
  angle: Angle,
  scale: Point3D,
  dimensions: { columns: number; rows: number; planes: number }
): Point3D {
  const rotated = rotateCartesian({ x, y, z }, dimensions, angle);
  console.log();
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
