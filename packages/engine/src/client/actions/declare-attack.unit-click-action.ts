import { Vec3 } from '@game/shared';
import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { UnitViewModel } from '../view-models/unit.model';
import type { UnitClickAction } from './action';

export class DeclareAttackUnitClickAction implements UnitClickAction {
  constructor(private client: GameClient) {}

  predicate(unit: UnitViewModel) {
    const state = this.client.state;
    if (state.phase !== ROUND_PHASES.BATTLE) return false;
    const ui = this.client.ui;
    if (!ui.selectedUnitAction) return false;
    if (ui.selectedUnitAction.type !== 'attack') return false;

    const activeUnit = state.entities[state.activeUnitId!] as UnitViewModel;
    return activeUnit.attackablePoints.some(p =>
      Vec3.fromPoint3D(p.point).equals(unit.position)
    );
  }

  action(unit: UnitViewModel) {
    const state = this.client.state;
    const activeUnit = state.entities[state.activeUnitId!] as UnitViewModel;

    const attackable = activeUnit.attackablePoints.find(p =>
      Vec3.fromPoint3D(p.point).equals(unit.position)
    )!;

    const needsToMove = attackable.origins.every(
      origin => !Vec3.fromPoint3D(origin.point).equals(activeUnit.position)
    );
    if (needsToMove) {
      const closestOrigin = activeUnit.potentialMoves
        .filter(move =>
          attackable.origins.some(origin =>
            Vec3.fromPoint3D(origin.point).equals(move.point)
          )
        )
        .sort((a, b) => a.path.length - b.path.length)[0];
      activeUnit.moveTowards(closestOrigin.point);
    }

    activeUnit.attackAt(unit.position);
  }
}
