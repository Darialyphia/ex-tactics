import type { Board } from '../../board/board';
import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { PlayerViewModel } from '../view-models/player.model';
import type { CellClickAction } from './action';

export class DeployCellClickAction implements CellClickAction {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel) {
    const ui = this.client.ui;
    const state = this.client.state;
    if (state.phase !== GAME_PHASES.DEPLOY) return false;
    const player = state.entities[this.client.playerId] as PlayerViewModel;
    return !!ui.selectedHeroToDeploy && player.deployZone.some(p => p.equals(cell));
  }

  action(cell: BoardCellViewModel) {
    this.client.ui.deployAt(cell.position);
  }
}
