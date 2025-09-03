import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import {
  IllegalAbilityError,
  UnknownAbilityError,
  UnknownCardError
} from '../input-errors';
import { ArtifactCard } from '../../card/entities/artifact.entity';
import { HeroCard } from '../../card/entities/hero.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import { DestinyCard } from '../../card/entities/destiny.entity';
import { match, P } from 'ts-pattern';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  abilityId: z.string()
});

export class DeclareUseCardAbilityInput extends Input<typeof schema> {
  readonly name = 'declareUseCardAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  private get card() {
    return this.player.cardManager.findCard(this.payload.cardId)?.card;
  }

  private get ability() {
    if (!this.card) return null;
    return match(this.card)
      .with(
        P.instanceOf(MinionCard),
        P.instanceOf(HeroCard),
        P.instanceOf(ArtifactCard),
        P.instanceOf(DestinyCard),
        card =>
          card.abilities.find(ability => ability.abilityId === this.payload.abilityId) ||
          null
      )
      .otherwise(() => null);
  }

  async impl() {
    assert(
      isDefined(this.ability),
      new UnknownAbilityError(this.payload.cardId, this.payload.abilityId)
    );

    assert(
      this.ability.card.canUseAbility(this.payload.abilityId),
      new IllegalAbilityError()
    );

    await this.game.interaction.declareUseAbilityIntent(
      this.ability as Ability<AbilityOwner>,
      this.player
    );
  }
}
