import { Vec3, type Point3D } from '@game/shared';
import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { GameClient } from '../client';
import type { UnitViewModel } from '../view-models/unit.model';
import type { UnitClickAction } from './action';
import type { SerializedInput } from '../../input/input-system';

export class DeclareAttackUnitClickAction implements UnitClickAction {
  constructor(private client: GameClient) {}

  private simulateAttack(activeUnit: UnitViewModel, unit: UnitViewModel) {
    const eventsToDispatch: SerializedInput[] = [];
    if (activeUnit.moveIntent) {
      eventsToDispatch.push({
        type: 'move',
        payload: {
          playerId: this.client.playerId,
          ...this.client.stateManager.activeUnit.moveIntent!.point
        }
      });
    }
    eventsToDispatch.push({
      type: 'attack',
      payload: {
        playerId: this.client.playerId,
        ...unit.position
      }
    });
    this.client.simulateDispatch(eventsToDispatch);
  }

  private moveWithinRangeIfNeeded(
    attackable: { point: Point3D; origins: Array<{ point: Point3D; path: Point3D[] }> },
    activeUnit: UnitViewModel
  ) {
    const needsToMove = !attackable.origins.some(origin =>
      Vec3.fromPoint3D(origin.point).equals(
        activeUnit.moveIntent?.point ?? activeUnit.position
      )
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
  }

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

    this.moveWithinRangeIfNeeded(attackable, activeUnit);

    activeUnit.attackAt(unit.position);

    this.simulateAttack(activeUnit, unit);
  }
}
