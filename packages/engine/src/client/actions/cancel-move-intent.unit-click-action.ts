import { Vec3 } from '@game/shared';
import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { UnitViewModel } from '../view-models/unit.model';
import type { UnitClickAction } from './action';

export class CancelMoveIntentkUnitClickAction implements UnitClickAction {
  constructor(private client: GameClient) {}

  predicate(unit: UnitViewModel) {
    const state = this.client.state;
    if (state.phase !== ROUND_PHASES.BATTLE) return false;
    const activeUnit = state.entities[state.activeUnitId!] as UnitViewModel;
    if (!activeUnit.equals(unit)) return false;
    const ui = this.client.ui;

    return !!activeUnit.moveIntent && !ui.selectedUnitAction;
  }

  action(unit: UnitViewModel) {
    const state = this.client.state;
    const activeUnit = state.entities[state.activeUnitId!] as UnitViewModel;

    activeUnit.cancelMoveIntent();
  }
}
