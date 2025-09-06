import { Vec3, type Point3D } from '@game/shared';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.constants';
import { UnitAttackEvent } from '../unit.events';

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
    const targets = this.unit.attackAOEShape.getUnits([target]);
    const damage = new CombatDamage({
      baseAmount: 0,
      source: this.unit.card
    });

    this.dealDamage(targets, damage);
    this._attacksCount++;

    const unit = this.game.unitSystem.getUnitAt(target)!;
    if (!unit) return; // means unit died from attack
    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.unit
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return (
          unit.canCounterAttackAt(this.unit.position) &&
          this.unit.canBeCounterattackedBy(unit)
        );
      });

    this.emitter.emit(
      COMBAT_EVENTS.AFTER_ATTACK,
      new AttackEvent({
        target: Vec2.fromPoint(target)
      })
    );

    counterAttackParticipants.forEach(unit => {
      unit.counterAttack(this.unit);
    });
  }

  dealDamage(targets: Unit[], damage: Damage<AnyCard>) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_DEAL_DAMAGE,
      new DealDamageEvent({ targets, damage })
    );
    targets.forEach(target => {
      target.takeDamage(this.unit.card, damage);
    });
    this.emitter.emit(
      COMBAT_EVENTS.AFTER_DEAL_DAMAGE,
      new DealDamageEvent({ targets, damage })
    );
  }

  takeDamage(from: AnyCard, damage: Damage<AnyCard>) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_RECEIVE_DAMAGE,
      new ReceiveDamageEvent({
        from,
        damage
      })
    );

    this.unit.hp.remove(damage.getFinalAmount(this.unit));
    this.emitter.emit(
      COMBAT_EVENTS.AFTER_RECEIVE_DAMAGE,
      new ReceiveDamageEvent({
        from,
        damage
      })
    );
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
