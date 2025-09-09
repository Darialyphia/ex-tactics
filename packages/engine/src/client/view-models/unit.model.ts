import type { SerializedUnit } from '../../unit/unit.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';

export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedUnit>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new UnitViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }
}
