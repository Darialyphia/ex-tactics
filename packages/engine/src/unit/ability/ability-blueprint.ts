import type { Values, Vec3 } from '@game/shared';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import type { Game } from '../../game/game';
import type { Ability } from './ability.entity';

export const ABILITY_TARGET_KINDS = {
  UNIT: 'unit',
  CELL: 'cell'
} as const;
export type AbilityTargetKind = Values<typeof ABILITY_TARGET_KINDS>;

export type AbilityBlueprint = {
  id: string;
  iconId: string;
  name: string;
  description: string;
  dynamicDescription: (game: Game, ability: Ability) => string;
  manaCost: number;
  cooldown: number;
  shouldAlterOrientation: boolean; // if true, unit will face first target when using ability
  getTargetingShapes(
    game: Game,
    ability: Ability
  ): Array<{ shape: GenericAOEShape; origin: number | null }>; // null = origin means unit position, number = index of the ability target shapes
  getImpactAOEShape(
    game: Game,
    ability: Ability
  ): { shape: GenericAOEShape; origin: number | null };
  onUse(game: Game, ability: Ability, targets: Vec3[]): void;
};
