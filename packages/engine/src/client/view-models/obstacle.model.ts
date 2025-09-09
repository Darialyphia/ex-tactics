import type { SerializedObstacle } from '../../obstacle/obstacle.entity';
import type { GameClient, GameStateEntities } from '../client';

export class ObstacleViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedObstacle,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(Obstacle: ObstacleViewModel | SerializedObstacle) {
    return this.id === Obstacle.id;
  }

  update(data: Partial<SerializedObstacle>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new ObstacleViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }
}
