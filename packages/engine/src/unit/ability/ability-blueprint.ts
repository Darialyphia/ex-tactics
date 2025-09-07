import type { Vec3 } from '@game/shared';
import type { GenericAOEShape } from '../../aoe/aoe-shape';
import type { Game } from '../../game/game';
import type { Unit } from '../unit.entity';
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
  getAttackTargetingShape(game: Game, ability: Ability): GenericAOEShape;
  getAttackAOEShape(game: Game, ability: Ability, target: Vec3): GenericAOEShape;
  onUse(game: Game, unit: Unit, target: Vec3): void;
};
