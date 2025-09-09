import type { SerializedBoardCell } from '../../board/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';

export class BoardCellViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedBoardCell,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardCellViewModel | SerializedBoardCell) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new BoardCellViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }
}
