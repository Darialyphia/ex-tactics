import type { GenericAOEShape } from '../aoe/aoe-shape';
import type { Modifier } from '../modifier/modifier.entity';
import { Interceptable } from '../utils/interceptable';
import type { Ability } from './ability/ability.entity';
import type { Unit } from './unit.entity';

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { unit: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeAbilityTarget: Interceptable<boolean, { ability: Ability }>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;
  canUseAbility: Interceptable<boolean, { ability: Ability }>;

  maxHp: Interceptable<number>;
  maxMp: Interceptable<number>;
  maxAp: Interceptable<number>;
  pAtk: Interceptable<number>;
  mAtk: Interceptable<number>;
  pDef: Interceptable<number>;
  mDef: Interceptable<number>;
  initiative: Interceptable<number>;
  movementRange: Interceptable<number>;

  flatPhysicalDamageIncrease: Interceptable<number>;
  percentPhysicalDamageIncrease: Interceptable<number>;
  flatPhysicalDamageMitigation: Interceptable<number>;
  percentPhysicalDamageMitigation: Interceptable<number>;
  flatPhysicalDefShred: Interceptable<number>;
  percentPhysicalDefShred: Interceptable<number>;

  flatMagicalDamageIncrease: Interceptable<number>;
  percentMagicalDamageIncrease: Interceptable<number>;
  flatMagicalDefShred: Interceptable<number>;
  percentMagicalDefShred: Interceptable<number>;
  flatMagicalDamageMitigation: Interceptable<number>;
  percentMagicalDamageMitigation: Interceptable<number>;

  maxMovementsPerTurn: Interceptable<number>;

  attackTargetingShape: Interceptable<GenericAOEShape>;
  attackAOEShape: Interceptable<GenericAOEShape>;

  apCostPerAttack: Interceptable<number>;
  apCostPerAbility: Interceptable<number>;

  apRegenPerTurn: Interceptable<number>;
  mpRegenPerTurn: Interceptable<number>;
};

export const makeUnitInterceptors = (): UnitInterceptors => {
  return {
    canMove: new Interceptable(),
    canMoveAfterAttacking: new Interceptable(),
    canMoveThrough: new Interceptable(),
    canAttack: new Interceptable(),
    canBeAttackTarget: new Interceptable(),
    canBeAbilityTarget: new Interceptable(),
    canReceiveModifier: new Interceptable(),
    canUseAbility: new Interceptable(),

    maxHp: new Interceptable(),
    maxMp: new Interceptable(),
    maxAp: new Interceptable(),
    pAtk: new Interceptable(),
    mAtk: new Interceptable(),
    pDef: new Interceptable(),
    mDef: new Interceptable(),
    initiative: new Interceptable(),
    movementRange: new Interceptable(),

    flatPhysicalDamageIncrease: new Interceptable(),
    percentPhysicalDamageIncrease: new Interceptable(),
    flatPhysicalDamageMitigation: new Interceptable(),
    percentPhysicalDamageMitigation: new Interceptable(),
    flatPhysicalDefShred: new Interceptable(),
    percentPhysicalDefShred: new Interceptable(),

    flatMagicalDamageIncrease: new Interceptable(),
    percentMagicalDamageIncrease: new Interceptable(),
    flatMagicalDefShred: new Interceptable(),
    percentMagicalDefShred: new Interceptable(),
    flatMagicalDamageMitigation: new Interceptable(),
    percentMagicalDamageMitigation: new Interceptable(),

    maxMovementsPerTurn: new Interceptable(),

    attackTargetingShape: new Interceptable(),
    attackAOEShape: new Interceptable(),

    apCostPerAttack: new Interceptable(),
    apCostPerAbility: new Interceptable(),

    apRegenPerTurn: new Interceptable(),
    mpRegenPerTurn: new Interceptable()
  };
};
