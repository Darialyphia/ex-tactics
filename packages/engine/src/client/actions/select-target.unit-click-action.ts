import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { UnitViewModel } from '../view-models/unit.model';
import type { UnitClickAction } from './action';

export class SelectTargetUnitClickAction implements UnitClickAction {
  constructor(private client: GameClient) {}

  predicate(unit: UnitViewModel) {
    const ui = this.client.ui;
    const state = this.client.state;
    if (state.phase !== ROUND_PHASES.BATTLE) return false;
    const action = ui.selectedUnitAction;
    if (!action || action.type !== 'ability') return false;

    return action.ability.canTarget(unit.position);
  }

  action(unit: UnitViewModel) {
    const action = this.client.ui.selectedUnitAction;
    if (action?.type === 'ability') {
      action.ability.targetAt(unit.position);
    }
  }
}
