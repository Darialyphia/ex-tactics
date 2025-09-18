import { Vec3, type Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedLine = {
  type: 'cone';
  targetingType: TargetingType;
  params: {
    length: number;
    verticalSize: number;
  };
};

export class ConeAOEShape implements AOEShape<SerializedLine> {
  static fromJSON(json: SerializedLine): ConeAOEShape {
    return new ConeAOEShape(
      json.targetingType,
      json.params.length,
      json.params.verticalSize
    );
  }

  readonly type = 'cone' as const;

  constructor(
    readonly targetingType: TargetingType,
    private length: number,
    private verticalSize: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        length: this.length,
        verticalSize: this.verticalSize
      }
    };
  }

  getArea([origin, direction]: [Point3D, Point3D]): Point3D[] {
    const directionVec = Vec3.fromPoint3D(direction).sub(origin).normalize();
    if (directionVec.x !== 0 && directionVec.y !== 0) {
      return [];
    }
    const isHoritzontal = directionVec.x !== 0;
    const points: Point3D[] = [];
    for (let i = 1; i <= this.length; i++) {
      const baseX = origin.x + directionVec.x * i;
      const baseY = origin.y + directionVec.y * i;
      for (let j = -i + 1; j <= i - 1; j++) {
        if (isHoritzontal) {
          for (let k = -this.verticalSize; k <= this.verticalSize; k++) {
            points.push({ x: baseX, y: baseY + j, z: origin.z + k });
          }
        } else {
          for (let k = -this.verticalSize; k <= this.verticalSize; k++) {
            points.push({ x: baseX + j, y: baseY, z: origin.z + k });
          }
        }
      }
    }
    return points;
  }
}
