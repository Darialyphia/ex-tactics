import { Vec3, type Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import { bresenham3D } from '../utils/bresenham';
import type { TargetingType } from './aoe.constants';

type SerializedLine = {
  type: 'line';
  targetingType: TargetingType;
  params: {
    length: number;
  };
};

export class LineAOEShape implements AOEShape<SerializedLine> {
  static fromJSON(json: SerializedLine): LineAOEShape {
    return new LineAOEShape(json.targetingType, json.params.length);
  }

  readonly type = 'line' as const;

  constructor(
    readonly targetingType: TargetingType,

    private length: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        length: this.length
      }
    };
  }

  getArea([start, end]: [Point3D, Point3D]): Point3D[] {
    const vec = Vec3.fromPoint3D(start);
    const normalizedEnd = Vec3.fromPoint3D(end)
      .sub(vec)
      .normalize()
      .scale({ x: this.length, y: this.length, z: this.length });

    return bresenham3D(start, normalizedEnd).filter(
      point => point.x >= 0 && point.y >= 0 && point.z >= 0
    );
  }
}
