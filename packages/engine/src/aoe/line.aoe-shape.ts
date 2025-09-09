import { Vec3, type Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import { bresenham3D } from '../utils/bresenham';
import type { TargetingType } from './aoe.constants';

type SerializedLine = {
  type: 'line';
  targetingType: TargetingType;
  params: {
    direction: Point3D;
    length: number;
  };
};

export class LineAOEShape implements AOEShape<SerializedLine> {
  static fromJSON(json: SerializedLine): LineAOEShape {
    return new LineAOEShape(
      json.targetingType,
      json.params.direction,
      json.params.length
    );
  }

  readonly type = 'line' as const;

  constructor(
    readonly targetingType: TargetingType,

    private direction: Point3D,
    private length: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        direction: this.direction,
        length: this.length
      }
    };
  }

  getArea(origin: Point3D): Point3D[] {
    const vec = Vec3.fromPoint3D(origin);

    if (vec.magnitude === 0) {
      if (origin.x >= 0 && origin.y >= 0 && origin.z >= 0) {
        return [origin];
      }
      return [];
    }

    const normalizedDirection = vec.normalize();

    const end: Point3D = {
      x: origin.x + normalizedDirection.x * this.length,
      y: origin.y + normalizedDirection.y * this.length,
      z: origin.z + normalizedDirection.z * this.length
    };

    return bresenham3D(origin, end).filter(
      point => point.x >= 0 && point.y >= 0 && point.z >= 0
    );
  }
}
