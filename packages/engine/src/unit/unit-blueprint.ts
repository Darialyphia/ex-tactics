import type { AOEShape } from '../aoe/aoe-shape';
import type { Game } from '../game/game';
import type { AbilityBlueprint } from './ability/ability-blueprint';
import type { PassiveBlueprint } from './passive/passive-blueprint';
import type { Unit } from './unit.entity';

export type UnitBlueprint = {
  id: string;
  name: string;
  isHero: boolean;
  baseStats: {
    maxHp: number;
    pAtk: number;
    mAtk: number;
    pDef: number;
    mDef: number;
    initiative: number;
    movementRange: number;
  };
  getAttackTargetingShape(game: Game, unit: Unit): AOEShape<any>;
  getAttackAOEShape(game: Game, unit: Unit): AOEShape<any>;
  sprite: {
    id: string;
    defaultParts: Record<string, string>;
  };
  icons: {
    portrait: string;
  };
  defaultAbilities: AbilityBlueprint[];
  defaultPassives: PassiveBlueprint[];
  talentTree: (AbilityBlueprint | PassiveBlueprint)[][];
};
