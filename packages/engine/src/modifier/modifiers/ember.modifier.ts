import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';

export class EmberModifier extends Modifier<HeroCard> {
  constructor(game: Game, source: AnyCard, stacks = 1) {
    super('embers', game, source, {
      name: 'Embers',
      description: 'Consumed by other cards.',
      icon: 'keyword-ember',
      isUnique: true,
      mixins: [],
      stacks
    });
  }
}
