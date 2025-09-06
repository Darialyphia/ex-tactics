import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedCircle = {
  type: 'circle';
  targetingType: TargetingType;
  params: {
    point: Point3D;
    horizontalRadius: number;
    verticalRadius: number;
  };
};

export class CircleAOEShape implements AOEShape<SerializedCircle> {
  static fromJSON(json: SerializedCircle): CircleAOEShape {
    return new CircleAOEShape(
      json.targetingType,
      json.params.point,
      json.params.horizontalRadius,
      json.params.verticalRadius
    );
  }

  readonly type = 'circle' as const;

  constructor(
    readonly targetingType: TargetingType,
    private center: Point3D,
    private horizontalRadius: number,
    private verticalRadius: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        point: this.center,
        horizontalRadius: this.horizontalRadius,
        verticalRadius: this.verticalRadius
      }
    };
  }

  getAffectedPoints(): Point3D[] {
    const affectedPoints: Point3D[] = [];
    for (let x = -this.horizontalRadius; x <= this.horizontalRadius; x++) {
      for (let y = -this.horizontalRadius; y <= this.horizontalRadius; y++) {
        for (let z = -this.verticalRadius; z <= this.verticalRadius; z++) {
          if (
            x * x + y * y <= this.horizontalRadius * this.horizontalRadius &&
            z * z <= this.verticalRadius * this.verticalRadius
          ) {
            const point = {
              x: this.center.x + x,
              y: this.center.y + y,
              z: this.center.z + z
            };
            if (point.x < 0 || point.y < 0 || point.z < 0) continue;
            affectedPoints.push(point);
          }
        }
      }
    }
    return affectedPoints;
  }
}
