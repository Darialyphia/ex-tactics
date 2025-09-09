import type { GameClient, GameStateEntities } from '../client';
import type { SerializedPlayer } from '../../player/player.entity';

export class PlayerViewModel {
  private getEntities: () => GameStateEntities;
  private getClient: () => GameClient;

  constructor(
    private data: SerializedPlayer,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: PlayerViewModel | SerializedPlayer) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedPlayer>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new PlayerViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }
}
