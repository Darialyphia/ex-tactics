import type { JSONObject, Point3D, Serializable } from '@game/shared';
import type { TargetingType } from './aoe.constants';

export type SerializedAOE = {
  type: string;
  targetingType: TargetingType;
  params: JSONObject;
};

export type AOEShape<T extends SerializedAOE> = {
  type: string;
  targetingType: TargetingType;
  getArea(origin: Point3D): Point3D[];
} & Serializable<T>;

export type GenericAOEShape = AOEShape<SerializedAOE>;
