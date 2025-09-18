import {
  isDefined,
  type AnyObject,
  type EmptyObject,
  type Point3D,
  type Serializable,
  type Vec3
} from '@game/shared';
import { Entity } from '../../entity';
import type { Unit } from '../unit.entity';
import type { AbilityBlueprint, AbilityAOEPoint } from './ability-blueprint';
import { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';
import { UNIT_EVENTS } from '../unit.constants';
import { UnitUseAbilityEvent } from '../unit.events';
import { parseAOEPoint, type SerializedAOE } from '../../aoe/aoe-shape';
import { match } from 'ts-pattern';

export type AbilityInterceptors<TMeta> = {
  manaCost: Interceptable<number>;
  cooldown: Interceptable<number>;
  meta: Interceptable<TMeta>;
};

export type SerializedAbility = {
  entityType: 'ability';
  id: string;
  unit: string;
  name: string;
  description: string;
  dynamicDescription: string;
  cooldown: number;
  remainingCooldown: number;
  manaCost: number;
  iconId: string;
  canUse: boolean;
  targetingShapes: Array<{ shape: SerializedAOE; points: AbilityAOEPoint[] }>;
  impactAOEShape: {
    shape: SerializedAOE;
    points: AbilityAOEPoint[];
  };
};

export class Ability<TMeta extends AnyObject>
  extends Entity<AbilityInterceptors<TMeta>>
  implements Serializable<SerializedAbility>
{
  private remainingCooldown = 0;

  constructor(
    private game: Game,
    readonly unit: Unit,
    readonly blueprint: AbilityBlueprint<TMeta>
  ) {
    super(`ability-${unit.id}-${blueprint.id}`, {
      manaCost: new Interceptable(),
      cooldown: new Interceptable(),
      meta: new Interceptable()
    });
    this.game.on(UNIT_EVENTS.UNIT_TURN_START, event => {
      if (event.data.unit.equals(this.unit) && this.remainingCooldown > 0) {
        this.remainingCooldown--;
      }
    });
  }

  serialize() {
    const targetingShapes = this.blueprint.getTargetingShapes(this.game, this);
    const aoe = this.blueprint.getImpactAOEShape(this.game, this);
    return {
      entityType: 'ability' as const,
      id: this.id,
      name: this.blueprint.name,
      unit: this.unit.id,
      description: this.blueprint.description,
      dynamicDescription: this.blueprint.dynamicDescription(this.game, this),
      iconId: this.blueprint.iconId,
      cooldown: this.cooldown,
      remainingCooldown: this.remainingCooldown,
      manaCost: this.manaCost,
      canUse: this.canUse,
      targetingShapes: targetingShapes.map(t => ({
        shape: t.shape.serialize(),
        points: t.points
      })),
      impactAOEShape: {
        shape: aoe.shape.serialize(),
        points: aoe.points
      }
    };
  }

  get cooldown() {
    return this.interceptors.cooldown.getValue(this.blueprint.cooldown, {});
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {});
  }

  get shouldAlterOrientation() {
    return this.blueprint.shouldAlterOrientation;
  }

  get meta() {
    return this.interceptors.meta.getValue(this.blueprint.meta, {});
  }

  getPotentialTargets(shapeIndex: number, targets: Point3D[]) {
    const targetingShapes = this.blueprint.getTargetingShapes(this.game, this);
    const target = targetingShapes[shapeIndex];

    if (!target) return [];
    return target.shape.getArea(
      target.points.map(p => parseAOEPoint(p, targets, { unit: this.unit }))
    );
  }

  getCellsInAoe(targets: Vec3[]) {
    const aoe = this.blueprint.getImpactAOEShape(this.game, this);
    return (
      aoe?.shape
        .getArea(aoe.points.map(p => parseAOEPoint(p, targets, { unit: this.unit })))
        .map(p => this.game.board.getCellAt(p))
        .filter(isDefined) ?? []
    );
  }

  getUnitsInAoe(targets: Vec3[]) {
    return this.getCellsInAoe(targets)
      .map(cell => cell.unit)
      .filter(isDefined);
  }

  getObstaclesInAoe(targets: Vec3[]) {
    return this.getCellsInAoe(targets)
      .map(cell => cell.obstacle)
      .filter(isDefined);
  }

  getUnitOrObstacleInAoe(targets: Vec3[]) {
    return this.getCellsInAoe(targets)
      .map(cell => cell.unit ?? cell.obstacle)
      .filter(isDefined);
  }

  get canUse() {
    if (this.remainingCooldown > 0) return false;
    if (this.manaCost > this.unit.currentMp) return false;

    return true;
  }

  canUseAt(targets: Vec3[]) {
    if (!this.canUse) return false;
    return targets.every((target, index) =>
      this.getPotentialTargets(index, targets).some(p => target.equals(p))
    );
  }

  use(targets: Vec3[]) {
    this.remainingCooldown = this.cooldown;
    this.unit.currentMp -= this.manaCost;

    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_USE_ABILITY,
      new UnitUseAbilityEvent({
        unit: this.unit,
        ability: this,
        targets
      })
    );

    this.blueprint.onUse(this.game, this, targets);

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_USE_ABILITY,
      new UnitUseAbilityEvent({
        unit: this.unit,
        ability: this,
        targets
      })
    );
  }
}
