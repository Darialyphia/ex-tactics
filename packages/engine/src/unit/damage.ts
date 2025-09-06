import { clamp, type BetterOmit, type Values } from '@game/shared';
import type { Unit } from './unit.entity';
import type { Game } from '../game/game';

export const DAMAGE_TYPES = {
  PHYSICAL: 'PHYSICAL',
  MAGICAL: 'MAGICAL',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  PURE: 'PURE'
} as const;

export type DamageType = Values<typeof DAMAGE_TYPES>;

export type DamageOptions<T> = {
  source: T;
  baseAmount: number;
  type: DamageType;
};

export abstract class Damage<T> {
  protected _source: T;

  protected _baseAmount: number;

  readonly type: DamageType;

  constructor(
    protected game: Game,
    options: DamageOptions<T>
  ) {
    this._source = options.source;
    this._baseAmount = options.baseAmount;
    this.type = options.type;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  get source() {
    return this._source;
  }

  abstract getFinalAmount(target: Unit): number;
}

export class PhysicalDamage extends Damage<Unit> {
  private pAtkRatio: number;

  constructor(
    game: Game,
    options: BetterOmit<DamageOptions<Unit>, 'type'> & { pAtkRatio: number }
  ) {
    super(game, { ...options, type: DAMAGE_TYPES.PHYSICAL });
    this.pAtkRatio = options.pAtkRatio;
  }

  private getScaledAmount() {
    const pAtkIncrease = this.source.pAtk * this.pAtkRatio;
    const percentIncrease = clamp(
      this.source.percentPhysicalDamageIncrease,
      -1,
      Number.POSITIVE_INFINITY
    );
    const flatIncrease = Math.max(0, this.source.flatPhysicalDamageIncrease);

    return (this.baseAmount + pAtkIncrease) * (1 + percentIncrease) + flatIncrease;
  }

  private scaleMitigation(mitigation: number) {
    return (
      1 - mitigation / (mitigation + this.game.config.HALF_DAMAGE_MITIGATION_THRESHOLD)
    );
  }

  private getPDefMultiplier(target: Unit) {
    const percentMitigation = clamp(1 - this.source.percentPhysicalDefShred, 0, 1);
    const flatMitigation = Math.max(0, this.source.flatPhysicalDefShred);

    const pDefMitigation = Math.max(
      0,
      (target.pDef - flatMitigation) * percentMitigation
    );

    return this.scaleMitigation(pDefMitigation);
  }

  getFinalAmount(target: Unit) {
    const percentMitigation = clamp(1 - target.percentPhysicalDamageMitigation, 0, 1);
    const flatMitigation = Math.min(0, target.flatPhysicalDamageMitigation);
    const finalAmount =
      this.getScaledAmount() * this.getPDefMultiplier(target) * percentMitigation -
      flatMitigation;

    return Math.round(Math.max(0, finalAmount));
  }
}

export class MagicalDamage extends Damage<Unit> {
  private mAtkRatio: number;

  constructor(
    game: Game,
    options: BetterOmit<DamageOptions<Unit>, 'type'> & { mAtkRatio: number }
  ) {
    super(game, { ...options, type: DAMAGE_TYPES.MAGICAL });
    this.mAtkRatio = options.mAtkRatio;
  }

  private getScaledAmount() {
    const mAtkIncrease = this.source.mAtk * this.mAtkRatio;
    const percentIncrease = clamp(
      this.source.percentMagicalDamageIncrease,
      -1,
      Number.POSITIVE_INFINITY
    );
    const flatIncrease = Math.max(0, this.source.flatMagicalDamageIncrease);

    return (this.baseAmount + mAtkIncrease) * (1 + percentIncrease) + flatIncrease;
  }

  private scaleMitigation(mitigation: number) {
    return (
      1 - mitigation / (mitigation + this.game.config.HALF_DAMAGE_MITIGATION_THRESHOLD)
    );
  }

  private getPDefMultiplier(target: Unit) {
    const percentMitigation = clamp(1 - this.source.percentMagicalDefShred, 0, 1);
    const flatMitigation = Math.max(0, this.source.flatMagicalDefShred);

    const pDefMitigation = Math.max(
      0,
      (target.pDef - flatMitigation) * percentMitigation
    );

    return this.scaleMitigation(pDefMitigation);
  }

  getFinalAmount(target: Unit) {
    const percentMitigation = clamp(1 - target.percentMagicalDamageMitigation, 0, 1);
    const flatMitigation = Math.min(0, target.flatMagicalDamageMitigation);

    const finalAmount =
      this.getScaledAmount() * this.getPDefMultiplier(target) * percentMitigation -
      flatMitigation;

    return Math.round(Math.max(0, finalAmount));
  }
}

export class TrueDamage extends Damage<any> {
  constructor(game: Game, options: BetterOmit<DamageOptions<any>, 'type'>) {
    super(game, { ...options, type: DAMAGE_TYPES.PURE });
  }

  getFinalAmount() {
    return this.baseAmount;
  }
}
