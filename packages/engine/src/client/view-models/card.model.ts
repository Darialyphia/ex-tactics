import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { SerializedPreResponseTarget } from '../../card/card-blueprint';
import type { PlayerViewModel } from './player.model';
import type { ModifierViewModel } from './modifier.model';
import type { GameClientState } from '../controllers/state-controller';
import { PlayCardAction } from '../actions/play-card';
import { DeclareAttackAction } from '../actions/declare-attack';
import {
  CARD_KINDS,
  type Affinity,
  type ArtifactKind,
  type CardKind,
  type SpellKind
} from '../../card/card.enums';
import { DeclareBlockerAction } from '../actions/declare-blocker';
import { UseAbilityAction } from '../actions/use-ability';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import { GAME_PHASES } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';
import { AbilityViewModel } from './ability.model';

type CardData =
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedHeroCard
  | SerializedMinionCard;

export type CardActionRule = {
  id: string;
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  getLabel: (card: CardViewModel) => string;
  handler: (card: CardViewModel) => void;
};

export class CardViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCard,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: CardViewModel | SerializedCard) {
    return this.id === unit.id;
  }

  update<T extends CardKind>(data: Partial<CardData & { kind: T }>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new CardViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get imagePath() {
    return `/assets/icons/${this.data.cardIconId}.png`;
  }

  get kind() {
    return this.data.kind;
  }

  get rarity() {
    return this.data.rarity;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
    }
    return null;
  }

  get baseManaCost() {
    if ('baseManaCost' in this.data) {
      return this.data.baseManaCost as number;
    }
    return null;
  }

  get destinyCost() {
    if ('destinyCost' in this.data) {
      return this.data.destinyCost as number;
    }

    return null;
  }

  get baseDestinyCost() {
    if ('baseDestinyCost' in this.data) {
      return this.data.baseDestinyCost as number;
    }

    return null;
  }

  get canBeUsedAsManaCost() {
    return this.data.canBeUsedAsManaCost;
  }

  get source() {
    return this.data.source;
  }

  get position() {
    if ('position' in this.data) {
      return this.data.position as SerializedMinionCard['position'];
    }

    return null;
  }

  get location() {
    return this.data.location;
  }

  get atk() {
    if ('atk' in this.data) {
      return this.data.atk as number;
    }

    return null;
  }

  get baseAtk() {
    if ('baseAtk' in this.data) {
      return this.data.baseAtk as number;
    }
    return null;
  }

  get maxHp() {
    if ('maxHp' in this.data) {
      return this.data.maxHp as number;
    }

    return null;
  }

  get baseMaxHp() {
    if ('baseMaxHp' in this.data) {
      return this.data.baseMaxHp as number;
    }

    return null;
  }

  get hp() {
    if ('remainingHp' in this.data) {
      return this.data.remainingHp as number;
    }

    return null;
  }

  get subKind() {
    if ('subKind' in this.data) {
      return this.data.subKind as SpellKind | ArtifactKind;
    }

    return null;
  }

  get unlockableAffinities() {
    if ('unlockableAffinities' in this.data) {
      return this.data.unlockableAffinities as Affinity[];
    }
    return [];
  }

  get level() {
    if ('level' in this.data) {
      return this.data.level as number;
    }
    if ('minLevel' in this.data) {
      return this.data.minLevel as number;
    }

    return null;
  }

  get spellpower() {
    if ('spellPower' in this.data) {
      return this.data.spellPower as number;
    }

    return null;
  }

  get baseSpellpower() {
    if ('baseSpellPower' in this.data) {
      return this.data.baseSpellPower as number;
    }
    return null;
  }

  get durability() {
    if ('durability' in this.data) {
      return this.data.durability as number;
    }

    return null;
  }

  get affinity() {
    return this.data.affinity;
  }

  get canPlay() {
    return this.data.canPlay;
  }

  get potentialAttackTargets() {
    if ('potentialAttackTargets' in this.data) {
      return (
        this.data.potentialAttackTargets as SerializedMinionCard['potentialAttackTargets']
      ).map(targetId => {
        return this.getEntities()[targetId] as CardViewModel;
      });
    }

    return [];
  }

  get canAttack() {
    return (
      this.player.id === this.getClient().state.currentPlayer &&
      this.potentialAttackTargets.length > 0
    );
  }

  get canBeTargeted() {
    const client = this.getClient();
    const state = client.stateManager.state;
    const canSelect =
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.elligibleCards.some(id => id === this.id);

    const canAttack =
      state.interaction.state === INTERACTION_STATES.IDLE &&
      state.phase.state === GAME_PHASES.ATTACK &&
      state.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET &&
      state.phase.ctx.potentialTargets.some(id => id === this.id);

    return canSelect || canAttack;
  }

  get isExhausted() {
    return this.data.isExhausted;
  }

  get indexInHand() {
    if (this.data.location !== 'hand') {
      return null;
    }

    return this.player.hand.findIndex(card => card.equals(this));
  }

  get preResponseTargets() {
    if ('preResponseTargets' in this.data) {
      return this.data.preResponseTargets as SerializedPreResponseTarget[];
    }

    return null;
  }

  get isAttacking() {
    const relevantKinds: CardKind[] = [CARD_KINDS.MINION, CARD_KINDS.HERO];
    if (!relevantKinds.includes(this.kind)) {
      return false;
    }
    const state = this.getClient().state;

    return (
      state.phase.state === GAME_PHASES.ATTACK && state.phase.ctx.attacker === this.id
    );
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get modifiers() {
    return this.data.modifiers.map(modifierId => {
      return this.getEntities()[modifierId] as ModifierViewModel;
    });
  }

  play() {
    const hand = this.player.hand;

    const index = hand.findIndex(card => card.equals(this));
    if (index === -1) return;

    this.player.playCard(index);
  }

  get actions(): CardActionRule[] {
    const actions = [
      new PlayCardAction(this.getClient()),
      new DeclareAttackAction(this.getClient()),
      new DeclareBlockerAction(this.getClient()),
      ...this.abilities.map(ability => new UseAbilityAction(this.getClient(), ability))
    ].filter(rule => rule.predicate(this));

    return actions;
  }

  get abilities() {
    if ('abilities' in this.data) {
      return (this.data.abilities as string[]).map(
        ability => this.getEntities()[ability] as AbilityViewModel
      );
    }

    return [];
  }
}
