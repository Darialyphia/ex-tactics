import { isDefined, Vec3, type Nullable, type Point, type Point3D } from '@game/shared';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedAbility } from '../../unit/ability/ability.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { UnitViewModel } from './unit.model';
import type { BoardCellViewModel } from './board-cell.model';
import { match } from 'ts-pattern';
import { TARGETING_TYPES, type TargetingType } from '../../aoe/aoe.constants';
import { makeAoeShape } from '../../aoe/aoe-shape.factory';
import { ROUND_PHASES } from '../../game/systems/turn.system';

type TargetablePoint = {
  point: Point3D;
  origins: Array<{ point: Point3D; path: Point3D[] }>;
};
export class AbilityViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  _selectedTargets: Point3D[] = [];

  constructor(
    private data: SerializedAbility,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(ability: AbilityViewModel | SerializedAbility) {
    return this.id === ability.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new AbilityViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get icon() {
    return `/assets/icons/${this.data.iconId}.png`;
  }

  get unit() {
    return this.getEntities()[this.data.unit] as UnitViewModel;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get dynamicDescription() {
    return this.data.dynamicDescription;
  }

  get manaCost() {
    return this.data.manaCost;
  }

  get cooldown() {
    return this.data.cooldown;
  }

  get remainingCooldown() {
    return this.data.remainingCooldown;
  }

  get canUse() {
    return this.data.canUse;
  }

  get nextTargetIndex() {
    return this._selectedTargets.length;
  }

  get maxTargets() {
    return this.data.targetingShapes.length;
  }

  get selectedTargets() {
    return this._selectedTargets;
  }

  get targetingShape() {
    const shape = this.data.targetingShapes[this.nextTargetIndex];
    if (!shape) return null;
    return {
      shape: makeAoeShape(
        shape.shape.type,
        shape.shape.targetingType,
        shape.shape.params
      ),
      origin: shape.origin
    };
  }

  get targetZone() {
    const targetingShape = this.targetingShape;
    if (!targetingShape) return [];
    const origin = isDefined(targetingShape.origin)
      ? this._selectedTargets![targetingShape.origin!]
      : (this.unit.moveIntent?.point ?? this.unit.position);

    const pointToTest = [{ point: origin, path: [] as Point3D[] }];

    const points = pointToTest
      .map(p => ({
        area: targetingShape.shape.getArea(p.point),
        origin: p
      }))
      .flat();

    const mapByArea: Record<string, TargetablePoint> = {};
    points.forEach(({ area, origin }) => {
      area.forEach(point => {
        const key = `${point.x}:${point.y}:${point.z}`;
        if (!mapByArea[key]) {
          mapByArea[key] = { point, origins: [origin] };
        } else {
          mapByArea[key].origins.push(origin);
        }
      });
    });
    const result = Object.values(mapByArea);

    return result;
  }

  get targetablePoints() {
    const entities = this.getEntities();

    const result: TargetablePoint[] = this.targetZone.filter(targetablePoint => {
      const key = `${targetablePoint.point.x}:${targetablePoint.point.y}:${targetablePoint.point.z}`;
      const cell = entities[key] as BoardCellViewModel | undefined;
      if (!cell) return false;
      return this.isValidTargetType(
        cell,
        this.data.targetingShapes[this.nextTargetIndex].shape.targetingType
      );
    });
    return result;
  }

  get impactZone() {
    const shapeData = this.data.impactAOEShape;
    const shape = makeAoeShape(
      shapeData.shape.type,
      shapeData.shape.targetingType,
      shapeData.shape.params
    );
    const origin = isDefined(shapeData.origin)
      ? this._selectedTargets![shapeData.origin!]
      : (this.unit.moveIntent?.point ?? this.unit.position);
    if (!origin) return [];

    return shape.getArea(origin);
  }

  get impactedePoints() {
    const entities = this.getEntities();

    const result: Point3D[] = this.impactZone.filter(point => {
      const key = `${point.x}:${point.y}:${point.z}`;
      const cell = entities[key] as BoardCellViewModel | undefined;
      if (!cell) return false;
      return this.isValidTargetType(cell, this.data.impactAOEShape.shape.targetingType);
    });
    return result;
  }

  isInImpactZone(point: Point3D) {
    return this.impactZone.some(p => Vec3.fromPoint3D(p).equals(point));
  }

  private isValidTargetType(cell: BoardCellViewModel, type: TargetingType) {
    const player = this.unit.player;
    return match(type)
      .with(TARGETING_TYPES.ANY, () => true)
      .with(TARGETING_TYPES.EMPTY, () => !cell.unit && !cell.obstacle)
      .with(TARGETING_TYPES.OBSTACLE, () => !!cell.obstacle)
      .with(TARGETING_TYPES.UNIT, () => !!cell.unit)
      .with(TARGETING_TYPES.ALLY, () => {
        if (!cell.unit) return false;
        return cell.unit.player.id === player.id;
      })
      .with(TARGETING_TYPES.ENEMY, () => {
        if (!cell.unit) return false;
        return cell.unit.player.id !== player.id;
      })
      .with(TARGETING_TYPES.NON_ALLY, () => {
        if (!cell.unit && !cell.obstacle) return false;
        if (cell.unit) {
          return !cell.unit.player.equals(player);
        }
        if (cell.obstacle?.player) {
          return !cell.obstacle.player.equals(player);
        }
        return false;
      })
      .exhaustive();
  }

  canTargetFromCurrentPosition(cell: BoardCellViewModel) {
    if (this.selectedTargets.length >= this.maxTargets) return false;

    const pos = this.unit.moveIntent?.point ?? this.unit.position;
    const targetingShape = this.targetingShape;
    const area = targetingShape?.shape.getArea(pos);
    return area?.some(p => Vec3.fromPoint3D(p).equals(cell.position));
  }

  canTarget(point: Point3D) {
    if (this.selectedTargets.length >= this.maxTargets) return false;

    const client = this.getClient();
    if (client.state.phase !== ROUND_PHASES.BATTLE) return false;

    return this.targetablePoints.some(p => Vec3.fromPoint3D(p.point).equals(point));
  }

  clearTargets() {
    this._selectedTargets = [];
  }

  targetAt(point: Point3D) {
    this._selectedTargets.push(point);
  }
}
