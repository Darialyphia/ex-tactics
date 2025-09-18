import { ROUND_PHASES } from '../../game/systems/turn.system';
import type { SerializedInput } from '../../input/input-system';
import type { GameClient } from '../client';
import type { AbilityViewModel } from '../view-models/ability.model';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { ObstacleViewModel } from '../view-models/obstacle.model';
import type { ObstacleClickAction } from './action';

export class SelectTargetObstacleClickAction implements ObstacleClickAction {
  constructor(private client: GameClient) {}

  private simulateAbility(ability: AbilityViewModel) {
    const eventsToDispatch: SerializedInput[] = [];
    if (ability.selectedTargets.length !== ability.neededTargets) return;
    const activeUnit = this.client.stateManager.activeUnit!;
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
      type: 'useAbility',
      payload: {
        playerId: this.client.playerId,
        abilityId: ability.id,
        targets: ability.selectedTargets
      }
    });
    this.client.simulateDispatch(eventsToDispatch);
  }

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
      this.simulateAbility(action.ability);
    }
  }
}
