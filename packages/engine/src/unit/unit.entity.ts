import type { Point3D, Serializable } from '@game/shared';
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

export type SerializedUnit = {
  type: 'unit';
  id: string;
  position: Point3D;
  player: string;
  pAtk: number;
  mAtk: number;
  pDef: number;
  mDef: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  abilities: string[];
  passives: string[];
};

export type UnitOptions = {
  id: number;
  position: Point3D;
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

  currentHp: number;
  currentMp: number;
  currentAp: number;

  constructor(
    private game: Game,
    options: UnitOptions
  ) {
    super(`unit-${options.id}`, makeUnitInterceptors());
    this.movement = new MovementComponent(this.game, this, {
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.combat = new CombatComponent(this.game, this);
    this.currentHp = this.maxHp;
    this.currentMp = this.game.config.STARTING_MANA;
    this.currentAp = this.game.config.DEFAULT_AP_PER_TURN;
    this.player = options.player;
    this.blueprint = options.blueprint;
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

  get position() {
    return this.movement.position;
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.baseStats.maxHp, {});
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

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
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
      this.movementsMadeThisTurn < this.movementRange && this.canMoveAfterAttacking
        ? this.actionsTakenThisTurn === 0
        : true,
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

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.currentAp > this.game.config.DEFAULT_ATTACK_AP_COST,
      {
        unit
      }
    );
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(unit.isAlly(this), { unit });
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(true, { attacker: unit });
  }

  serialize() {
    return {
      type: 'unit' as const,
      id: this.id,
      position: this.position.serialize(),
      player: this.player.id,
      pAtk: this.pAtk,
      mAtk: this.mAtk,
      pDef: this.pDef,
      mDef: this.mDef,
      maxHp: this.maxHp,
      currentHp: this.maxHp, // TODO: currentHp
      initiative: this.initiative,
      abilities: this.abilities.map(a => a.id),
      passives: this.passives.map(p => p.id)
    };
  }

  startTurn() {
    console.log('todo unit start turn');
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
    const path = this.movement.move(to);
    if (path) {
      this.movementsMadeThisTurn += path.distance;
    }
  }

  teleport(to: Point3D) {
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;
    this.movement.position.z = to.z;
  }

  getPossibleMoves() {
    if (!this.canMove) return [];
    return this.movement.getAllPossibleMoves(this.remainingMovement);
  }
}
