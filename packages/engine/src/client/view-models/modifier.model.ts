import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { CardViewModel } from './card.model';

export class ModifierViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedModifier,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: ModifierViewModel | SerializedModifier) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new ModifierViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get modifierType() {
    return this.data.modifierType;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get icon() {
    return this.data.icon;
  }

  get stacks() {
    return this.data.stacks;
  }

  get targetAsCard() {
    return this.getEntities()[this.data.target] as CardViewModel;
  }
}
