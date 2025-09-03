import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { AnyCard } from '../../card/entities/card.entity';
import { GAME_EVENTS } from '../../game/game.events';
import type { MaybePromise } from '@game/shared';

export type AuraOptions = {
  isElligible(candidate: AnyCard): boolean;
  onGainAura(candidate: AnyCard): MaybePromise<void>;
  onLoseAura(candidate: AnyCard): MaybePromise<void>;
  canSelfApply: boolean;
};

export class AuraModifierMixin extends ModifierMixin<AnyCard> {
  protected modifier!: Modifier<AnyCard>;

  private affectedCardIds = new Set<string>();

  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private options: AuraOptions
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private async checkAura() {
    if (!this.isApplied) return;

    for (const card of this.game.cardSystem.cards) {
      if (!this.options.canSelfApply && card.equals(this.modifier.target)) continue;
      const shouldGetAura = this.options.isElligible(card);

      const hasAura = this.affectedCardIds.has(card.id);

      if (!shouldGetAura && hasAura) {
        this.affectedCardIds.delete(card.id);
        await this.options.onLoseAura(card);
        continue;
      }

      if (shouldGetAura && !hasAura) {
        this.affectedCardIds.add(card.id);
        await this.options.onGainAura(card);
        continue;
      }
    }
  }

  private async cleanup() {
    this.game.off('*', this.checkAura);

    for (const id of this.affectedCardIds) {
      const card = this.game.cardSystem.getCardById(id);
      if (!card) return;

      this.affectedCardIds.delete(id);
      await this.options.onLoseAura(card);
    }
  }

  onApplied(card: AnyCard, modifier: Modifier<AnyCard>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
  }

  async onRemoved() {
    this.isApplied = false;
    await this.cleanup();
  }

  onReapplied() {}
}
