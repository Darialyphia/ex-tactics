import type { SerializedPassive } from '../../unit/passive/passive.entity';
import type { GameClient, GameStateEntities } from '../client';

export class PassiveViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedPassive,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(Passive: PassiveViewModel | SerializedPassive) {
    return this.id === Passive.id;
  }

  update(data: Partial<SerializedPassive>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new PassiveViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }
}
