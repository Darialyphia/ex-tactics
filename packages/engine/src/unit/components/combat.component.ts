import { isDefined, Vec3, type Point3D } from '@game/shared';
import type { Game } from '../../game/game';
import { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.constants';
import {
  UnitAttackEvent,
  UnitDealDamageEvent,
  UnitTakeDamageEvent
} from '../unit.events';
import { Damage, PhysicalDamage } from '../damage';
import { Obstacle } from '../../obstacle/obstacle.entity';

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
    const unitTargets = this.unit.attackAOEShape
      .getArea(target)
      .map(point => this.game.unitManager.getUnitAt(point))

      .filter(isDefined);

    const obstacleTargets = this.unit.attackAOEShape
      .getArea(target)
      .map(point => this.game.obstacleManager.getObstacleAt(point))
      .filter(isDefined)
      .filter(obstacle => obstacle.isAttackable);

    const damage = new PhysicalDamage(this.game, {
      baseAmount: 0,
      pAtkRatio: 1,
      source: this.unit
    });

    this.dealDamage(unitTargets, damage);
    obstacleTargets.forEach(obstacle => {
      obstacle.onAttacked(this.unit, damage);
    });

    this._attacksCount++;

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_ATTACK,
      new UnitAttackEvent({
        unit: this.unit,
        target: Vec3.fromPoint3D(target)
      })
    );
  }

  dealDamage(targets: Array<Unit | Obstacle>, damage: Damage<any>) {
    const unitTargets = targets.filter(t => t instanceof Unit) as Unit[];
    const obstacleTargets = targets.filter(t => t instanceof Obstacle) as Obstacle[];
    if (unitTargets.length) {
      this.dealDamageToUnits(unitTargets, damage);
    }
    if (obstacleTargets.length) {
      this.dealDamageToObstacles(obstacleTargets, damage);
    }
  }

  private dealDamageToUnits(targets: Unit[], damage: Damage<any>) {
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
      new UnitDealDamageEvent({
        unit: this.unit,
        targets,
        damage
      })
    );
  }

  private dealDamageToObstacles(targets: Obstacle[], damage: Damage<any>) {
    targets.forEach(obstacle => {
      obstacle.onAttacked(this.unit, damage);
    });
  }

  takeDamage(from: Unit, damage: Damage<any>) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_TAKE_DAMAGE,
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

    if (this.unit.currentHp === 0) {
      this.unit.destroy(from);
    }

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_TAKE_DAMAGE,
      new UnitTakeDamageEvent({
        unit: this.unit,
        from,
        damage
      })
    );
  }
}
