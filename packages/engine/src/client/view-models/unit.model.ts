import { Vec3, type Nullable, type Point3D } from '@game/shared';
import type { SerializedUnit } from '../../unit/unit.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';
import type { BoardCellViewModel } from './board-cell.model';
import { makeAoeShape } from '../../aoe/aoe-shape.factory';
import { TARGETING_TYPES, type TargetingType } from '../../aoe/aoe.constants';
import { match } from 'ts-pattern';
import type { UnitAction } from '../controllers/ui-controller';
import type { AbilityViewModel } from './ability.model';
import { DeclareAttackUnitClickAction } from '../actions/declare-attack.unit-click-action';
import { CancelMoveIntentkUnitClickAction } from '../actions/cancel-move-intent.unit-click-action';
import { ROUND_PHASES } from '../../game/systems/turn.system';
import { SelectTargetUnitClickAction } from '../actions/select-target.unit-click-action';

type AttackablePoint = {
  point: Point3D;
  origins: Array<{ point: Point3D; path: Point3D[] }>;
};
export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  _cachedAttackablePoints: Nullable<Array<AttackablePoint>> = null;
  _cachedAttackZone: Nullable<Array<AttackablePoint>> = null;

  moveIntent: Nullable<{ point: Point3D; path: Point3D[] }> = null;

  attackIntent: Nullable<Point3D> = null;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedUnit>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new UnitViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get position() {
    return this.data.position;
  }

  // needed for movement animation
  set position(position: Point3D) {
    this.data.position = position;
  }

  get orientation() {
    return this.data.orientation;
  }

  get spriteId() {
    return `unit-${this.data.sprite.id}`;
  }

  get spriteParts() {
    return this.data.sprite.parts;
  }

  get potentialMoves() {
    return this.data.potentialMoves;
  }

  get indexInTurnOrder() {
    return this.getClient().state.turnOrder.indexOf(this.id);
  }

  get name() {
    return this.data.name;
  }

  get hp() {
    return this.data.currentHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get mp() {
    return this.data.currentMp;
  }

  get maxMp() {
    return this.data.maxMp;
  }

  get ap() {
    return this.data.currentAp;
  }

  get maxAp() {
    return this.data.maxAp;
  }

  get attackTargetingShape() {
    return makeAoeShape(
      this.data.attackTargetingShape.type,
      this.data.attackTargetingShape.targetingType,
      this.data.attackTargetingShape.params
    );
  }

  get attackAOEShape() {
    return makeAoeShape(
      this.data.attackAOEShape.type,
      this.data.attackAOEShape.targetingType,
      this.data.attackAOEShape.params
    );
  }

  get cell() {
    const entities = this.getEntities();
    return (entities[`${this.position.x}:${this.position.y}:${this.position.z}`] as
      | BoardCellViewModel
      | undefined)!;
  }

  get portrait() {
    return `/assets/portraits/${this.data.icons.portrait}.png`;
  }

  private isValidTargetType(cell: BoardCellViewModel, type: TargetingType) {
    return match(type)
      .with(TARGETING_TYPES.ANY, () => true)
      .with(TARGETING_TYPES.EMPTY, () => !cell.unit && !cell.obstacle)
      .with(TARGETING_TYPES.OBSTACLE, () => !!cell.obstacle)
      .with(TARGETING_TYPES.UNIT, () => !!cell.unit)
      .with(TARGETING_TYPES.ALLY, () => {
        if (!cell.unit) return false;
        return cell.unit.player.id === this.player.id;
      })
      .with(TARGETING_TYPES.ENEMY, () => {
        if (!cell.unit) return false;
        return cell.unit.player.id !== this.player.id;
      })
      .with(TARGETING_TYPES.NON_ALLY, () => {
        if (!cell.unit && !cell.obstacle) return false;
        if (cell.unit) {
          return !cell.unit.player.equals(this.player);
        }
        if (cell.obstacle?.player) {
          return !cell.obstacle.player.equals(this.player);
        }
        return false;
      })
      .exhaustive();
  }

  get attackZone() {
    if (!this._cachedAttackZone) {
      const targetingShape = this.attackTargetingShape;
      const points = [{ point: this.position, path: [] }, ...this.potentialMoves]
        .map(p => ({
          attackable: targetingShape.getArea([p.point]),
          origin: p
        }))
        .flat();

      const mapByAttackablePoint: Record<string, AttackablePoint> = {};
      points.forEach(({ attackable, origin }) => {
        attackable.forEach(point => {
          const key = `${point.x}:${point.y}:${point.z}`;
          if (!mapByAttackablePoint[key]) {
            mapByAttackablePoint[key] = { point, origins: [origin] };
          } else {
            mapByAttackablePoint[key].origins.push(origin);
          }
        });
      });
      const result = Object.values(mapByAttackablePoint);
      this._cachedAttackZone = result;
    }

    return this._cachedAttackZone!;
  }

  get attackablePoints() {
    if (!this._cachedAttackablePoints) {
      const entities = this.getEntities();

      const result: AttackablePoint[] = this.attackZone.filter(attackablePoint => {
        const key = `${attackablePoint.point.x}:${attackablePoint.point.y}:${attackablePoint.point.z}`;
        const cell = entities[key] as BoardCellViewModel | undefined;
        if (!cell) return false;
        return this.isValidTargetType(cell, this.data.attackTargetingShape.targetingType);
      });

      this._cachedAttackablePoints = result;
    }

    return this._cachedAttackablePoints;
  }

  get abilities() {
    const entities = this.getEntities();
    return this.data.abilities.map(abilityId => entities[abilityId] as AbilityViewModel);
  }

  get actions(): UnitAction[] {
    return [
      { type: 'attack', id: 'attack' } as const,
      ...this.abilities.map(
        ability => ({ type: 'ability', ability, id: ability.id }) as const
      )
    ];
  }

  get isActive() {
    return this.indexInTurnOrder === 0;
  }

  get abilityIntent() {
    if (!this.isActive) return null;
    const client = this.getClient();
    const unitAction = client.ui.selectedUnitAction;
    if (unitAction?.type !== 'ability') {
      return null;
    }
    if (!unitAction.ability.unit.equals(this)) {
      return null;
    }
    if (!unitAction.ability.hasFulfilledTargeting) {
      return null;
    }

    return unitAction.ability;
  }

  isInAttackZone(cell: BoardCellViewModel) {
    return this.attackZone.some(p => Vec3.fromPoint3D(p.point).equals(cell.position));
  }

  canAttackFromCurrentPosition(cell: BoardCellViewModel) {
    const pos = this.moveIntent?.point ?? this.position;
    const targetingShape = this.attackTargetingShape;
    const area = targetingShape.getArea([pos]);
    return area.some(p => Vec3.fromPoint3D(p).equals(cell.position));
  }

  canMoveTo(cell: BoardCellViewModel) {
    const client = this.getClient();
    if (client.state.phase !== ROUND_PHASES.BATTLE) return false;

    return this.data.potentialMoves.some(point =>
      Vec3.fromPoint3D(point.point).equals(cell.position)
    );
  }

  canAttack(cell: BoardCellViewModel) {
    const client = this.getClient();
    if (client.state.phase !== ROUND_PHASES.BATTLE) return false;

    return this.attackablePoints.some(p =>
      Vec3.fromPoint3D(p.point).equals(cell.position)
    );
  }

  private checkAttackIntentValidity() {
    if (!this.attackIntent) return;
    const position = this.moveIntent?.point ?? this.position;

    const canStillAttack = this.attackablePoints
      .find(p => Vec3.fromPoint3D(p.point).equals(this.attackIntent!))
      ?.origins.find(o => Vec3.fromPoint3D(o.point).equals(position));

    if (!canStillAttack) {
      this.cancelAttackIntent();
    }
  }

  moveTowards(point: Point3D) {
    const destination = this.data.potentialMoves.find(p =>
      Vec3.fromPoint3D(p.point).equals(point)
    );
    if (!destination) return;
    this.moveIntent = destination;
    this.checkAttackIntentValidity();
    this.getClient().forceSync();
  }

  attackAt(point: Point3D) {
    const attackable = this.attackablePoints.find(p =>
      Vec3.fromPoint3D(p.point).equals(point)
    );
    if (attackable) {
      this.attackIntent = attackable.point;
      this.getClient().forceSync();
    }
  }

  cancelMoveIntent() {
    this.moveIntent = null;
    this.checkAttackIntentValidity();
    this.getClient().forceSync();
  }

  cancelAttackIntent() {
    this.attackIntent = null;
    this.getClient().forceSync();
  }

  onClick() {
    const client = this.getClient();
    const rules = [
      new DeclareAttackUnitClickAction(client),
      new SelectTargetUnitClickAction(client),
      new CancelMoveIntentkUnitClickAction(client)
    ];

    for (const rule of rules) {
      if (rule.predicate(this)) {
        rule.action(this);
        break;
      }
    }
    client.forceSync();
  }
}
