import type { SerializedAbility } from '../../card/card-blueprint';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { CardViewModel } from './card.model';

export class AbilityViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedAbility,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: AbilityViewModel | SerializedAbility) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new AbilityViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get abilityId() {
    return this.data.abilityId;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get canUse() {
    return this.data.canUse;
  }

  get manaCost() {
    return this.data.manaCost;
  }

  get targets() {
    return this.data.targets;
  }
}
