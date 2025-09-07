import { isDefined, Vec3, type Point3D } from '@game/shared';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.constants';
import {
  UnitAttackEvent,
  UnitDealDamageEvent,
  UnitTakeDamageEvent
} from '../unit.events';
import { Damage, PhysicalDamage } from '../damage';

export class CombatComponent {
  private _attacksCount = 0;
  private _counterAttacksCount = 0;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  setAttackCount(count: number) {
    this._attacksCount = count;
  }

  resetAttackCount() {
    this._attacksCount = 0;
    this._counterAttacksCount = 0;
  }

  resetCounterAttackCount() {
    this._counterAttacksCount = 0;
  }

  attack(target: Point3D) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_ATTACK,
      new UnitAttackEvent({
        target: Vec3.fromPoint3D(target),
        unit: this.unit
      })
    );
    const targets = this.unit.attackAOEShape
      .getArea(this.unit.position)
      .map(point => this.game.unitManager.getUnitAt(point)!)
      .filter(isDefined);

    const damage = new PhysicalDamage(this.game, {
      baseAmount: 0,
      pAtkRatio: 1,
      source: this.unit
    });

    this.dealDamage(targets, damage);
    this._attacksCount++;

    const unit = this.game.unitManager.getUnitAt(target)!;
    if (!unit) return; // means unit died from attack

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_ATTACK,
      new UnitAttackEvent({
        unit: this.unit,
        target: Vec3.fromPoint3D(target)
      })
    );
  }

  dealDamage(targets: Unit[], damage: Damage<any>) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DEAL_DAMAGE,
      new UnitDealDamageEvent({
        unit: this.unit,
        targets,
        damage
      })
    );
    targets.forEach(target => {
      target.combat.takeDamage(this.unit, damage);
    });
    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
      new UnitDealDamageEvent({ unit: this.unit, targets, damage })
    );
  }

  takeDamage(from: Unit, damage: Damage<any>) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE,
      new UnitTakeDamageEvent({
        unit: this.unit,
        from,
        damage
      })
    );

    this.unit.currentHp = Math.max(
      this.unit.currentHp - damage.getFinalAmount(this.unit),
      0
    );

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_RECEIVE_DAMAGE,
      new UnitTakeDamageEvent({
        unit: this.unit,
        from,
        damage
      })
    );
  }
}
