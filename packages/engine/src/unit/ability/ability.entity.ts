import type { EmptyObject } from '@game/shared';
import { Entity } from '../../entity';
import type { Unit } from '../unit.entity';
import type { AbilityBlueprint } from './ability-blueprint';
import type { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';

export type AbilityInterceptors = {
  manaCost: Interceptable<number>;
  cooldown: Interceptable<number>;
};

export class Ability extends Entity<EmptyObject> {
  constructor(game: Game, unit: Unit, blueprint: AbilityBlueprint) {
    super(`ability-${unit.id}-${blueprint.id}`, {});
  }
}
