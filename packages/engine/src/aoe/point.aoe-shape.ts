import type { EmptyObject, Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedPoint = {
  type: 'point';
  targetingType: TargetingType;
  params: EmptyObject;
};

export class PointAOEShape implements AOEShape<SerializedPoint> {
  static fromJSON(json: SerializedPoint): PointAOEShape {
    return new PointAOEShape(json.targetingType, json.params.point);
  }

  readonly type = 'point' as const;

  constructor(
    readonly targetingType: TargetingType,
    private point: Point3D
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {}
    };
  }

  getArea(point: Point3D): Point3D[] {
    return [point];
  }
}
