import { Vec3, type Point3D, type Serializable } from '@game/shared';
import { EntityWithModifiers } from '../entity';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { UnitBlueprint } from './unit-blueprint';
import { Ability } from './ability/ability.entity';
import { Passive } from './passive/passive.entity';
import type { AbilityBlueprint } from './ability/ability-blueprint';
import type { PassiveBlueprint } from './passive/passive-blueprint';
import { makeUnitInterceptors, type UnitInterceptors } from './unit-interceptors';
import { MovementComponent } from './components/movement.component';
import { PathfinderComponent } from './pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from './pathfinding/strategies/solid-body.strategy';
import { CombatComponent } from './components/combat.component';
import { UNIT_EVENTS } from './unit.constants';
import {
  UnitAfterDestroyEvent,
  UnitBeforeDestroyEvent,
  UnitReceiveHealEvent,
  UnitTurnEvent
} from './unit.events';
import { getDirectionFromDiff, type Direction } from '../board/board.utils';
import type { SerializedAOE } from '../aoe/aoe-shape';
import { Obstacle } from '../obstacle/obstacle.entity';

export type SerializedUnit = {
  entityType: 'unit';
  id: string;
  name: string;
  position: Point3D;
  orientation: Direction;
  player: string;
  pAtk: number;
  mAtk: number;
  pDef: number;
  mDef: number;
  maxHp: number;
  currentHp: number;
  maxMp: number;
  currentMp: number;
  maxAp: number;
  currentAp: number;
  initiative: number;
  abilities: string[];
  passives: string[];
  potentialMoves: Array<{ point: Point3D; path: Point3D[] }>;
  sprite: {
    id: string;
    parts: Record<string, string>;
  };
  icons: {
    portrait: string;
  };
  attackTargetingShape: SerializedAOE;
  attackAOEShape: SerializedAOE;
};

export type UnitOptions = {
  id: number;
  position: Point3D;
  orientation: Direction;
  player: Player;
  blueprint: UnitBlueprint;
  selectedTalents: string[];
};

export class Unit
  extends EntityWithModifiers<UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  readonly movement: MovementComponent;

  readonly combat: CombatComponent;

  readonly player: Player;

  readonly abilities: Ability[];

  readonly passives: Passive[];

  private blueprint: UnitBlueprint;

  private movementsMadeThisTurn = 0;

  private actionsTakenThisTurn = 0;

  orientation: Direction;

  currentHp: number;
  currentMp: number;
  currentAp: number;

  initiativeSeed: number;

  constructor(
    private game: Game,
    private options: UnitOptions
  ) {
    super(`unit-${options.id}`, makeUnitInterceptors());
    this.blueprint = options.blueprint;
    this.initiativeSeed = game.rngSystem.next() / 100;
    this.movement = new MovementComponent(this.game, this, {
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.orientation = options.orientation;
    this.combat = new CombatComponent(this.game, this);
    this.currentHp = this.maxHp;
    this.currentMp = this.game.config.STARTING_MANA;
    this.currentAp = this.game.config.STARTING_AP;
    this.player = options.player;
    this.abilities = [
      ...options.blueprint.defaultAbilities,
      ...options.selectedTalents.map(
        (talentId, index) =>
          options.blueprint.talentTree[index].find(
            t => t.id === talentId
          ) as AbilityBlueprint
      )
    ].map(abilityBlueprint => new Ability(game, this, abilityBlueprint));

    this.passives = [
      ...options.blueprint.defaultPassives,
      ...options.selectedTalents.map(
        (talentId, index) =>
          options.blueprint.talentTree[index].find(
            t => t.id === talentId
          ) as PassiveBlueprint
      )
    ].map(passiveBlueprint => new Passive(game, this, passiveBlueprint));
  }

  serialize() {
    return {
      entityType: 'unit' as const,
      id: this.id,
      name: this.blueprint.name,
      position: this.position.serialize(),
      orientation: this.orientation,
      player: this.player.id,
      pAtk: this.pAtk,
      mAtk: this.mAtk,
      pDef: this.pDef,
      mDef: this.mDef,
      maxHp: this.maxHp,
      currentHp: this.currentHp,
      maxMp: this.maxMp,
      currentMp: this.currentMp,
      maxAp: this.maxAp,
      currentAp: this.currentAp,
      initiative: this.initiative,
      abilities: this.abilities.map(a => a.id),
      passives: this.passives.map(p => p.id),
      potentialMoves: this.getPotentialMoves(),
      sprite: {
        id: this.blueprint.sprite.id,
        parts: { ...this.blueprint.sprite.defaultParts }
      },
      icons: {
        portrait: this.blueprint.icons.portrait
      },
      attackTargetingShape: this.attackTargetingShape.serialize(),
      attackAOEShape: this.attackAOEShape.serialize()
    };
  }

  get blueprintId() {
    return this.options.blueprint.id;
  }

  get selectedTalents() {
    return this.options.selectedTalents;
  }

  get position() {
    return this.movement.position;
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.baseStats.maxHp, {});
  }

  get maxMp() {
    return this.interceptors.maxMp.getValue(this.game.config.DEFAULT_MAX_MANA, {});
  }

  get maxAp() {
    return this.interceptors.maxAp.getValue(this.game.config.DEFAULT_MAX_AP, {});
  }

  get pAtk() {
    return this.interceptors.pAtk.getValue(this.blueprint.baseStats.pAtk, {});
  }

  get mAtk() {
    return this.interceptors.mAtk.getValue(this.blueprint.baseStats.mAtk, {});
  }

  get pDef() {
    return this.interceptors.pDef.getValue(this.blueprint.baseStats.pDef, {});
  }

  get mDef() {
    return this.interceptors.mDef.getValue(this.blueprint.baseStats.mDef, {});
  }

  get initiative() {
    return this.interceptors.initiative.getValue(this.blueprint.baseStats.initiative, {});
  }

  get apRegenPerTurn() {
    return this.interceptors.apRegenPerTurn.getValue(
      this.game.config.DEFAULT_AP_REGEN_PER_TURN,
      {}
    );
  }

  get mpRegenPerTurn() {
    return this.interceptors.mpRegenPerTurn.getValue(
      this.game.config.DEFAULT_MANA_REGEN_PER_TURN ?? 0,
      {}
    );
  }

  get movementRange() {
    return this.interceptors.movementRange.getValue(
      this.blueprint.baseStats.movementRange,
      {}
    );
  }

  get flatPhysicalDamageIncrease() {
    return this.interceptors.flatPhysicalDamageIncrease.getValue(0, {});
  }

  get percentPhysicalDamageIncrease() {
    return this.interceptors.percentPhysicalDamageIncrease.getValue(0, {});
  }

  get flatPhysicalDamageMitigation() {
    return this.interceptors.flatPhysicalDamageMitigation.getValue(0, {});
  }

  get percentPhysicalDamageMitigation() {
    return this.interceptors.percentPhysicalDamageMitigation.getValue(0, {});
  }

  get flatPhysicalDefShred() {
    return this.interceptors.flatPhysicalDefShred.getValue(0, {});
  }

  get percentPhysicalDefShred() {
    return this.interceptors.percentPhysicalDefShred.getValue(0, {});
  }

  get flatMagicalDamageIncrease() {
    return this.interceptors.flatMagicalDamageIncrease.getValue(0, {});
  }

  get percentMagicalDamageIncrease() {
    return this.interceptors.percentMagicalDamageIncrease.getValue(0, {});
  }

  get flatMagicalDamageMitigation() {
    return this.interceptors.flatMagicalDamageMitigation.getValue(0, {});
  }

  get percentMagicalDamageMitigation() {
    return this.interceptors.percentMagicalDamageMitigation.getValue(0, {});
  }

  get flatMagicalDefShred() {
    return this.interceptors.flatMagicalDefShred.getValue(0, {});
  }

  get percentMagicalDefShred() {
    return this.interceptors.percentMagicalDefShred.getValue(0, {});
  }

  get maxMovementsPerTurn() {
    return this.interceptors.maxMovementsPerTurn.getValue(
      this.game.config.DEFAULT_MAX_MOVEMENTS_PER_TURN,
      {}
    );
  }

  get canMoveAfterAttacking(): boolean {
    return this.interceptors.canMoveAfterAttacking.getValue(false, {});
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.movementsMadeThisTurn < this.movementRange &&
        (this.canMoveAfterAttacking ? true : this.actionsTakenThisTurn === 0),
      {}
    );
  }

  get remainingMovement() {
    return this.movementRange - this.movementsMadeThisTurn;
  }

  get attackTargetingShape() {
    return this.interceptors.attackTargetingShape.getValue(
      this.blueprint.getAttackTargetingShape(this.game, this),
      {}
    );
  }

  get attackAOEShape() {
    return this.interceptors.attackAOEShape.getValue(
      this.blueprint.getAttackAOEShape(this.game, this),
      {}
    );
  }

  get apCostPerAttack() {
    return this.interceptors.apCostPerAttack.getValue(
      this.game.config.DEFAULT_ATTACK_AP_COST,
      {}
    );
  }

  get apCostPerAbility() {
    return this.interceptors.apCostPerAbility.getValue(
      this.game.config.DEFAULT_ABILITY_AP_COST,
      {}
    );
  }

  canAttack(target: Unit | Obstacle): boolean {
    return this.interceptors.canAttack.getValue(this.currentAp >= this.apCostPerAttack, {
      target
    });
  }

  canUseAbility(ability: Ability): boolean {
    return this.interceptors.canUseAbility.getValue(
      ability.canUse && this.currentAp >= this.apCostPerAbility,
      { ability }
    );
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(unit.isAlly(this), { unit });
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(true, { attacker: unit });
  }

  canAttackAt(point: Point3D) {
    if (this.position.equals(point)) {
      console.warn('cannot attack self');
      return false;
    }

    const target =
      this.game.unitManager.getUnitAt(point) ??
      this.game.obstacleManager.getObstacleAt(point);

    if (!target) {
      console.warn('no target at point', point);
      return false;
    }

    if (!this.canAttack(target) || !target.canBeAttackedBy(this)) {
      console.warn('cannot attack target');
      return false;
    }

    if (!target.canBeAttackedBy(this)) {
      console.warn('target cannot be attacked by this unit');
      return false;
    }

    const area = this.attackTargetingShape.getArea(this.position);

    const isInArea = area.some(p => Vec3.fromPoint3D(p).equals(point));
    if (!isInArea) {
      console.warn('target not in targeting area');
      return false;
    }

    return true;
  }

  attack(target: Vec3) {
    this.currentAp -= this.apCostPerAttack;
    this.actionsTakenThisTurn += 1;
    this.orientation = getDirectionFromDiff(this.position, target)!;
    this.combat.attack(target);
  }

  useAbility(abilityId: string, targets: Vec3[]) {
    const ability = this.abilities.find(a => a.id === abilityId);
    if (!ability) throw new Error(`Ability ${abilityId} not found on unit ${this.id}`);
    this.currentAp -= this.apCostPerAbility;
    this.actionsTakenThisTurn += 1;
    if (ability.shouldAlterOrientation && targets.length) {
      this.orientation = getDirectionFromDiff(this.position, targets[0])!;
    }

    ability.use(targets);
  }

  get takeDamage() {
    return this.combat.takeDamage.bind(this.combat);
  }

  heal(from: Unit, amount: number) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_RECEIVE_HEAL,
      new UnitReceiveHealEvent({
        unit: this,
        from,
        amount
      })
    );
    this.currentHp = Math.min(this.currentHp + amount, this.maxHp);
    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_RECEIVE_HEAL,
      new UnitReceiveHealEvent({
        unit: this,
        from,
        amount
      })
    );
  }

  startTurn() {
    this.currentMp = Math.min(
      this.currentMp + this.mpRegenPerTurn,
      this.game.config.DEFAULT_MAX_MANA
    );
    this.currentAp = Math.min(
      this.currentAp + this.apRegenPerTurn,
      this.game.config.DEFAULT_MAX_AP
    );
    this.movementsMadeThisTurn = 0;
    this.actionsTakenThisTurn = 0;

    this.game.emit(
      UNIT_EVENTS.UNIT_TURN_START,
      new UnitTurnEvent({
        unit: this
      })
    );
  }

  endTurn() {
    this.game.emit(
      UNIT_EVENTS.UNIT_TURN_END,
      new UnitTurnEvent({
        unit: this
      })
    );
  }

  isAlly(unit: Unit) {
    return this.player.equals(unit.player);
  }

  isEnemy(unit: Unit) {
    return !this.isAlly(unit);
  }

  canMoveTo(point: Point3D) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.remainingMovement);
  }

  move(to: Point3D) {
    const prevPos = this.position.clone();
    const path = this.movement.move(to);
    if (path) {
      this.movementsMadeThisTurn += path.distance;
      let [secondToLast, last] = path.path.slice(-2);
      if (!last) {
        last = secondToLast;
        secondToLast = prevPos;
      }
      this.orientation = getDirectionFromDiff(secondToLast, last)!;
    }
  }

  teleport(to: Point3D) {
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;
    this.movement.position.z = to.z;
  }

  getPotentialMoves() {
    if (!this.canMove) return [];
    return this.movement
      .getAllPossibleMoves(this.remainingMovement)
      .filter(p => this.canMoveTo(p.point));
  }

  destroy(source: Unit) {
    this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_DESTROY,
      new UnitBeforeDestroyEvent({
        unit: this,
        source
      })
    );

    const position = this.position.clone();
    this.game.unitManager.removeUnit(this);

    this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_DESTROY,
      new UnitAfterDestroyEvent({
        unit: this,
        source,
        destroyedAt: position
      })
    );
  }
}
