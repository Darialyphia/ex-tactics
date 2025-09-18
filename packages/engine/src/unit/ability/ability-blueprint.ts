import type { AnyObject, EmptyObject, Values, Vec3 } from '@game/shared';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import type { Game } from '../../game/game';
import type { Ability } from './ability.entity';

export const ABILITY_TARGET_KINDS = {
  UNIT: 'unit',
  CELL: 'cell'
} as const;
export type AbilityTargetKind = Values<typeof ABILITY_TARGET_KINDS>;

export type AbilityAOEPoint = { type: 'self' } | { type: 'target'; index: number };

export type AbilityBlueprint<TMeta extends AnyObject = AnyObject> = {
  id: string;
  name: string;
  description: string;
  dynamicDescription: (game: Game, ability: Ability<TMeta>) => string;
  iconId: string;
  meta: TMeta;
  manaCost: number;
  cooldown: number;
  shouldAlterOrientation: boolean; // if true, unit will face first target when using ability
  getTargetingShapes(
    game: Game,
    ability: Ability<TMeta>
  ): Array<{ shape: GenericAOEShape; points: AbilityAOEPoint[] }>;
  getImpactAOEShape(
    game: Game,
    ability: Ability<TMeta>
  ): { shape: GenericAOEShape; points: AbilityAOEPoint[] };
  onUse(game: Game, ability: Ability<TMeta>, targets: Vec3[]): void;
};
