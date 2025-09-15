import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedCross = {
  type: 'cross';
  targetingType: TargetingType;
  params: {
    horizontalSize: number;
    verticalSize: number;
    includeCenter: boolean;
  };
};

export class CrossAOEShape implements AOEShape<SerializedCross> {
  static fromJSON(json: SerializedCross): CrossAOEShape {
    return new CrossAOEShape(json.targetingType, {
      horizontalSize: json.params.horizontalSize,
      verticalSize: json.params.verticalSize,
      includeCenter: json.params.includeCenter
    });
  }

  readonly type = 'cross' as const;

  private horizontalSize: number;
  private verticalSize: number;
  private includeCenter: boolean;

  constructor(
    readonly targetingType: TargetingType,
    options: {
      includeCenter: boolean;
      horizontalSize: number;
      verticalSize: number;
    }
  ) {
    this.horizontalSize = options.horizontalSize;
    this.verticalSize = options.verticalSize;
    this.includeCenter = options.includeCenter ?? true;
  }

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        horizontalSize: this.horizontalSize,
        verticalSize: this.verticalSize,
        includeCenter: this.includeCenter
      }
    };
  }

  getArea(center: Point3D): Point3D[] {
    const affectedPoints: Point3D[] = [];

    // X-axis branch (horizontal)
    for (let x = -this.horizontalSize; x <= this.horizontalSize; x++) {
      if (x === 0 && !this.includeCenter) continue; // skip center if not included
      const point = {
        x: center.x + x,
        y: center.y,
        z: center.z
      };
      if (point.x < 0 || point.y < 0 || point.z < 0) continue;
      affectedPoints.push(point);
    }

    // Y-axis branch (horizontal)
    for (let y = -this.horizontalSize; y <= this.horizontalSize; y++) {
      if (y === 0) continue; // center already handled in x-axis branch
      const point = {
        x: center.x,
        y: center.y + y,
        z: center.z
      };
      if (point.x < 0 || point.y < 0 || point.z < 0) continue;
      affectedPoints.push(point);
    }

    // Z-axis branch (vertical)
    for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
      if (z === 0) continue; // center already handled in x-axis branch
      const point = {
        x: center.x,
        y: center.y,
        z: center.z + z
      };
      if (point.x < 0 || point.y < 0 || point.z < 0) continue;
      affectedPoints.push(point);
    }

    return affectedPoints;
  }
}
