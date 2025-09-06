import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedDiagonalCross = {
  type: 'diagonalCross';
  targetingType: TargetingType;
  params: {
    center: Point3D;
    horizontalSize: number;
    verticalSize: number;
  };
};

export class DiagonalCrossAOEShape implements AOEShape<SerializedDiagonalCross> {
  static fromJSON(json: SerializedDiagonalCross): DiagonalCrossAOEShape {
    return new DiagonalCrossAOEShape(
      json.targetingType,
      json.params.center,
      json.params.horizontalSize,
      json.params.verticalSize
    );
  }

  readonly type = 'diagonalCross' as const;

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

  getArea(): Point3D[] {
    const affectedPoints: Point3D[] = [this.center];

    for (let d = 1; d <= this.horizontalSize; d++) {
      for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
        const candidates = [
          { x: this.center.x + d, y: this.center.y + d, z: this.center.z + z },
          { x: this.center.x - d, y: this.center.y + d, z: this.center.z + z },
          { x: this.center.x + d, y: this.center.y - d, z: this.center.z + z },
          { x: this.center.x - d, y: this.center.y - d, z: this.center.z + z }
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
