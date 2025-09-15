import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedDiagonalCross = {
  type: 'diagonalCross';
  targetingType: TargetingType;
  params: {
    horizontalSize: number;
    verticalSize: number;
    includeCenter: boolean;
  };
};

export class DiagonalCrossAOEShape implements AOEShape<SerializedDiagonalCross> {
  static fromJSON(json: SerializedDiagonalCross): DiagonalCrossAOEShape {
    return new DiagonalCrossAOEShape(json.targetingType, {
      horizontalSize: json.params.horizontalSize,
      verticalSize: json.params.verticalSize,
      includeCenter: json.params.includeCenter
    });
  }

  readonly type = 'diagonalCross' as const;

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

    // Add center point if includeCenter is true
    if (this.includeCenter) {
      affectedPoints.push(center);
    }

    for (let d = 1; d <= this.horizontalSize; d++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        const candidates = [
          { x: center.x + d, y: center.y + d, z: center.z + z },
          { x: center.x - d, y: center.y + d, z: center.z + z },
          { x: center.x + d, y: center.y - d, z: center.z + z },
          { x: center.x - d, y: center.y - d, z: center.z + z }
        ];
        for (const point of candidates) {
          if (point.x < 0 || point.y < 0 || point.z < 0) continue;
          affectedPoints.push(point);
        }
      }
    }

    return affectedPoints;
  }
}
