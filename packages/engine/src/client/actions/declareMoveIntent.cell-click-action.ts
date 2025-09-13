import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { UnitViewModel } from '../view-models/unit.model';
import type { CellClickAction } from './action';

export class DeclareMoveIntentCellClickAction implements CellClickAction {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel) {
    const state = this.client.state;
    if (state.phase !== GAME_PHASES.BATTLE) return false;
    if (!state.activeUnitId) return false;
    const activeUnit = state.entities[state.activeUnitId] as UnitViewModel;
    if (activeUnit.player.id !== this.client.playerId) return false;

    return activeUnit.canMoveTo(cell);
  }

  action(cell: BoardCellViewModel) {
    const state = this.client.state;
    if (!state.activeUnitId) return false;
    const activeUnit = state.entities[state.activeUnitId] as UnitViewModel;

    activeUnit.moveTowards(cell.position);
  }
}
