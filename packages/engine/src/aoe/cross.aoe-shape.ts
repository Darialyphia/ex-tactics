import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedCross = {
  type: 'cross';
  targetingType: TargetingType;
  params: {
    center: Point3D;
    horizontalSize: number;
    verticalSize: number;
  };
};

export class CrossAOEShape implements AOEShape<SerializedCross> {
  static fromJSON(json: SerializedCross): CrossAOEShape {
    return new CrossAOEShape(
      json.targetingType,
      json.params.center,
      json.params.horizontalSize,
      json.params.verticalSize
    );
  }

  readonly type = 'cross' as const;

  constructor(
    readonly targetingType: TargetingType,
    private center: Point3D,
    private horizontalSize: number,
    private verticalSize: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        center: this.center,
        horizontalSize: this.horizontalSize,
        verticalSize: this.verticalSize
      }
    };
  }

  getAffectedPoints(): Point3D[] {
    const affectedPoints: Point3D[] = [];

    for (let x = -this.horizontalSize; x <= this.horizontalSize; x++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        const point = {
          x: this.center.x + x,
          y: this.center.y,
          z: this.center.z + z
        };
        if (point.x < 0 || point.y < 0 || point.z < 0) continue;
        affectedPoints.push(point);
      }
    }

    for (let y = -this.horizontalSize; y <= this.horizontalSize; y++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        if (y === 0) continue; // center already added in x-axis branch
        const point = {
          x: this.center.x,
          y: this.center.y + y,
          z: this.center.z + z
        };
        if (point.x < 0 || point.y < 0 || point.z < 0) continue;
        affectedPoints.push(point);
      }
    }

    return affectedPoints;
  }
}
