import type { Vec3 } from '@game/shared';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import type { Game } from '../../game/game';
import type { Ability } from './ability.entity';

export type AbilityBlueprint = {
  id: string;
  iconId: string;
  name: string;
  description: string;
  dynamicDescription: (game: Game, ability: Ability) => string;
  manaCost: number;
  cooldown: number;
  targetType: 'unit' | 'cell';
  shouldAlterOrientation: boolean; // if true, unit will face first target when using ability
  getAttackTargetingShapes(
    game: Game,
    ability: Ability
  ): Array<{ shape: GenericAOEShape; origin: number | null }>; // null = origin means unit position, number = index of the ability target shapes
  getAttackAOEShape(
    game: Game,
    ability: Ability
  ): { shape: GenericAOEShape; origin: number };
  onUse(game: Game, ability: Ability, targets: Vec3[]): void;
};
