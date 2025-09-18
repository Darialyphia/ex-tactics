import type { AnyObject } from '@game/shared';
import type { AOEShape, GenericAOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';
import { CircleAOEShape } from './circle.aoe-shape';
import { CrossAOEShape } from './cross.aoe-shape';
import { DiagonalCrossAOEShape } from './diagonal-cross.aoe-shape';
import { LineAOEShape } from './line.aoe-shape';
import { PointAOEShape } from './point.aoe-shape';
import { SquareAOEShape } from './square.aoe-shape';
import { ConeAOEShape } from './cone.aoe-shape';

const dict = {
  circle: CircleAOEShape,
  point: PointAOEShape,
  square: SquareAOEShape,
  line: LineAOEShape,
  cross: CrossAOEShape,
  diagonalCross: DiagonalCrossAOEShape,
  cone: ConeAOEShape
} as const;

export type AOEType = keyof typeof dict;
export const makeAoeShape = (
  type: string,
  targetingType: TargetingType,
  params: AnyObject
): GenericAOEShape => {
  const ctor = dict[type as AOEType];
  if (!ctor) {
    throw new Error(`Unknown AOE shape type: ${type}`);
  }

  return ctor.fromJSON({
    // @ts-expect-error
    type,
    // @ts-expect-error
    targetingType,
    // @ts-expect-error
    params
  });
};
