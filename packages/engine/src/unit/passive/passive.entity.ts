import type { EmptyObject } from '@game/shared';
import { Entity } from '../../entity';
import type { Unit } from '../unit.entity';
import type { PassiveBlueprint } from './passive-blueprint';
import type { Game } from '../../game/game';

export class Passive extends Entity<EmptyObject> {
  constructor(game: Game, unit: Unit, blueprint: PassiveBlueprint) {
    super(`passive-${unit.id}-${blueprint.id}`, {});
  }
}
