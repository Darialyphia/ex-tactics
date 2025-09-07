import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedCross = {
  type: 'cross';
  targetingType: TargetingType;
  params: {
    horizontalSize: number;
    verticalSize: number;
  };
};

export class CrossAOEShape implements AOEShape<SerializedCross> {
  static fromJSON(json: SerializedCross): CrossAOEShape {
    return new CrossAOEShape(
      json.targetingType,
      json.params.horizontalSize,
      json.params.verticalSize
    );
  }

  readonly type = 'cross' as const;

  constructor(
    readonly targetingType: TargetingType,
    private horizontalSize: number,
    private verticalSize: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        horizontalSize: this.horizontalSize,
        verticalSize: this.verticalSize
      }
    };
  }

  getArea(center: Point3D): Point3D[] {
    const affectedPoints: Point3D[] = [];

    for (let x = -this.horizontalSize; x <= this.horizontalSize; x++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        const point = {
          x: center.x + x,
          y: center.y,
          z: center.z + z
        };
        if (point.x < 0 || point.y < 0 || point.z < 0) continue;
        affectedPoints.push(point);
      }
    }

    for (let y = -this.horizontalSize; y <= this.horizontalSize; y++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        if (y === 0) continue; // center already added in x-axis branch
        const point = {
          x: center.x,
          y: center.y + y,
          z: center.z + z
        };
        if (point.x < 0 || point.y < 0 || point.z < 0) continue;
        affectedPoints.push(point);
      }
    }

    return affectedPoints;
  }
}
