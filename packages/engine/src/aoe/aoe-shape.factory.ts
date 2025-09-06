import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';
import { CircleAOEShape } from './circle.aoe-shape';
import { CrossAOEShape } from './cross.aoe-shape';
import { DiagonalCrossAOEShape } from './diagonal-cross.aoe-shape';
import { LineAOEShape } from './line.aoe-shape';
import { PointAOEShape } from './point.aoe-shape';
import { SquareAOEShape } from './square.aoe-shape';

const dict = {
  circle: CircleAOEShape,
  point: PointAOEShape,
  square: SquareAOEShape,
  line: LineAOEShape,
  cross: CrossAOEShape,
  diagonalCross: DiagonalCrossAOEShape
} as const;

type AOEType = keyof typeof dict;
export const makeAoeShape = <T extends AOEType>(
  type: T,
  targetingType: TargetingType,
  params: (typeof dict)[T] extends AOEShape<infer U> ? U['params'] : never
): InstanceType<(typeof dict)[T]> => {
  return dict[type].fromJSON({
    // @ts-expect-error
    type,
    // @ts-expect-error
    targetingType,
    // @ts-expect-error
    params
  }) as InstanceType<(typeof dict)[T]>;
};
