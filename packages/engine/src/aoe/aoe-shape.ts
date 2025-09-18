import type { JSONObject, Point3D, Serializable } from '@game/shared';
import type { TargetingType } from './aoe.constants';
import type { AOEType } from './aoe-shape.factory';
import type { AbilityAOEPoint } from '../unit/ability/ability-blueprint';
import { match } from 'ts-pattern';
import type { Unit } from '../unit/unit.entity';

export type SerializedAOE = {
  type: AOEType;
  targetingType: TargetingType;
  params: JSONObject;
};

export type AOEShape<T extends SerializedAOE> = {
  type: string;
  targetingType: TargetingType;
  getArea(points: Point3D[]): Point3D[];
} & Serializable<T>;

export type GenericAOEShape = AOEShape<SerializedAOE>;

export const parseAOEPoint = (
  point: AbilityAOEPoint,
  targets: Point3D[],
  ctx: { unit: { position: Point3D } }
) => {
  return match(point)
    .with({ type: 'self' }, () => ctx.unit.position)
    .with({ type: 'target' }, point => targets[point.index])
    .exhaustive();
};
