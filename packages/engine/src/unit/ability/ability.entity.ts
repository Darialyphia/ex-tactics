import { isDefined, type EmptyObject, type Serializable, type Vec3 } from '@game/shared';
import { Entity } from '../../entity';
import type { Unit } from '../unit.entity';
import type { AbilityBlueprint } from './ability-blueprint';
import { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';
import { UNIT_EVENTS } from '../unit.constants';
import { UnitUseAbilityEvent } from '../unit.events';

export type AbilityInterceptors = {
  manaCost: Interceptable<number>;
  cooldown: Interceptable<number>;
};

export type SerializedAbility = {
  type: 'ability';
  id: string;
  cooldown: number;
  remainingCooldown: number;
  manaCost: number;
  iconId: string;
};

export class Ability
  extends Entity<AbilityInterceptors>
  implements Serializable<SerializedAbility>
{
  private remainingCooldown = 0;

  constructor(
    private game: Game,
    private unit: Unit,
    readonly blueprint: AbilityBlueprint
  ) {
    super(`ability-${unit.id}-${blueprint.id}`, {
      manaCost: new Interceptable(),
      cooldown: new Interceptable()
    });
    this.game.on(UNIT_EVENTS.UNIT_TURN_START, event => {
      if (event.data.unit.equals(this.unit) && this.remainingCooldown > 0) {
        this.remainingCooldown--;
      }
    });
  }

  serialize() {
    return {
      type: 'ability' as const,
      id: this.id,
      iconId: this.blueprint.iconId,
      cooldown: this.cooldown,
      remainingCooldown: this.remainingCooldown,
      manaCost: this.manaCost
    };
  }

  get cooldown() {
    return this.interceptors.cooldown.getValue(0, {});
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(0, {});
  }

  get potentialTargets() {
    const targetingShape = this.blueprint.getAttackTargetingShape(this.game, this);
    return targetingShape.getArea();
  }

  getCellsInAoe(target: Vec3) {
    return this.blueprint
      .getAttackAOEShape(this.game, this, target)
      .getArea()
      .map(p => this.game.board.getCellAt(p))
      .filter(isDefined);
  }

  getUnitsInAoe(target: Vec3) {
    return this.getCellsInAoe(target)
      .map(cell => cell.unit)
      .filter(isDefined);
  }

  get canUse() {
    if (this.remainingCooldown > 0) return false;
    if (this.manaCost > this.unit.currentMp) return false;
    if (this.potentialTargets.length === 0) return false;

    return true;
  }

  use(target: Vec3) {
    this.remainingCooldown = this.cooldown;
    this.unit.currentMp -= this.manaCost;

    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_USE_ABILITY,
      new UnitUseAbilityEvent({
        unit: this.unit,
        ability: this,
        target
      })
    );

    this.blueprint.onUse(this.game, this.unit, target);

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_USE_ABILITY,
      new UnitUseAbilityEvent({
        unit: this.unit,
        ability: this,
        target
      })
    );
  }
}
