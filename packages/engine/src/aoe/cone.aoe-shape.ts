import { Vec3, type Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedLine = {
  type: 'cone';
  targetingType: TargetingType;
  params: {
    origin: Point3D;
    length: number;
    verticalSize: number;
  };
};

export class ConeAOEShape implements AOEShape<SerializedLine> {
  static fromJSON(json: SerializedLine): ConeAOEShape {
    return new ConeAOEShape(
      json.targetingType,
      json.params.origin,
      json.params.length,
      json.params.verticalSize
    );
  }

  readonly type = 'cone' as const;

  constructor(
    readonly targetingType: TargetingType,
    private origin: Point3D,
    private length: number,
    private verticalSize: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        origin: this.origin,
        length: this.length,
        verticalSize: this.verticalSize
      }
    };
  }

  getArea(direction: Point3D): Point3D[] {
    const directionVec = Vec3.fromPoint3D(direction).sub(this.origin).normalize();
    if (directionVec.x !== 0 && directionVec.y !== 0) {
      return [];
    }
    const isHoritzontal = directionVec.x !== 0;
    const points: Point3D[] = [];
    for (let i = 1; i <= this.length; i++) {
      const baseX = this.origin.x + directionVec.x * i;
      const baseY = this.origin.y + directionVec.y * i;
      for (let j = -i + 1; j <= i - 1; j++) {
        if (isHoritzontal) {
          for (let k = -this.verticalSize; k <= this.verticalSize; k++) {
            points.push({ x: baseX, y: baseY + j, z: this.origin.z + k });
          }
        } else {
          for (let k = -this.verticalSize; k <= this.verticalSize; k++) {
            points.push({ x: baseX + j, y: baseY, z: this.origin.z + k });
          }
        }
      }
    }
    console.log(points);
    return points;
  }
}
