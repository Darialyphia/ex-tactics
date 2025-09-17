import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { CellClickAction } from './action';

export class SelectTargetCellClickAction implements CellClickAction {
  constructor(private client: GameClient) {}

  predicate(cell: BoardCellViewModel) {
    const ui = this.client.ui;
    const state = this.client.state;
    if (state.phase !== ROUND_PHASES.BATTLE) return false;
    const action = ui.selectedUnitAction;
    if (!action || action.type !== 'ability') return false;

    return action.ability.canTarget(cell.position);
  }

  action(cell: BoardCellViewModel) {
    const action = this.client.ui.selectedUnitAction;
    if (action?.type === 'ability') {
      action.ability.targetAt(cell.position);
    }
  }
}
