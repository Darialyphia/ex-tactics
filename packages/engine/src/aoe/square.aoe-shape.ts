import type { Point3D } from '@game/shared';
import type { AOEShape } from './aoe-shape';
import type { TargetingType } from './aoe.constants';

type SerializedSquare = {
  type: 'square';
  targetingType: TargetingType;
  params: {
    topLeft: Point3D;
    horizontalSize: number;
    verticalSize: number;
  };
};

export class SquareAOEShape implements AOEShape<SerializedSquare> {
  static fromJSON(json: SerializedSquare): SquareAOEShape {
    return new SquareAOEShape(
      json.targetingType,
      json.params.topLeft,
      json.params.horizontalSize,
      json.params.verticalSize
    );
  }

  readonly type = 'square' as const;

  constructor(
    readonly targetingType: TargetingType,
    private topLeft: Point3D,
    private horizontalSize: number,
    private verticalSize: number
  ) {}

  serialize() {
    return {
      type: this.type,
      targetingType: this.targetingType,
      params: {
        topLeft: this.topLeft,
        horizontalSize: this.horizontalSize,
        verticalSize: this.verticalSize
      }
    };
  }

  getAffectedPoints(): Point3D[] {
    const affectedPoints: Point3D[] = [];
    for (let x = 0; x < this.horizontalSize; x++) {
      for (let y = 0; y < this.horizontalSize; y++) {
        for (let z = -this.verticalSize; z <= this.verticalSize; z++) {
          const point = {
            x: this.topLeft.x + x,
            y: this.topLeft.y + y,
            z: this.topLeft.z
          };
          if (point.x < 0 || point.y < 0 || point.z < 0) continue;
          affectedPoints.push(point);
        }
      }
    }
    return affectedPoints;
  }
}
