import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { ObstacleViewModel } from '../view-models/obstacle.model';
import type { ObstacleClickAction } from './action';

export class SelectTargetObstacleClickAction implements ObstacleClickAction {
  constructor(private client: GameClient) {}

  predicate(obstacle: ObstacleViewModel) {
    const ui = this.client.ui;
    const state = this.client.state;
    if (state.phase !== ROUND_PHASES.BATTLE) return false;
    const action = ui.selectedUnitAction;
    if (!action || action.type !== 'ability') return false;

    return action.ability.canTarget(obstacle.position);
  }

  action(obstacle: ObstacleViewModel) {
    const action = this.client.ui.selectedUnitAction;
    if (action?.type === 'ability') {
      action.ability.targetAt(obstacle.position);
    }
  }
}
