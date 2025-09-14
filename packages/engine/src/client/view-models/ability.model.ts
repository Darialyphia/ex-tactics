import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedAbility } from '../../unit/ability/ability.entity';
import type { GameClient, GameStateEntities } from '../client';

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

  get icon() {
    return `/assets/icons/${this.data.iconId}.png`;
  }
}
