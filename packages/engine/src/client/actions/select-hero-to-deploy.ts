import { Vec3, type Point3D } from '@game/shared';
import type { Board } from '../../board/board';
import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { CellClickAction } from './action';

export class SelectHeroToDeployCellClickAction implements CellClickAction {
  constructor(private client: GameClient) {}

  private getHeroDeployedAtPosition(position: Point3D) {
    const ui = this.client.ui;
    return Object.values(ui.deployment).find(d =>
      Vec3.fromPoint3D(d.position).equals(position)
    );
  }
  predicate(cell: BoardCellViewModel) {
    const ui = this.client.ui;

    const state = this.client.state;
    if (state.phase !== GAME_PHASES.DEPLOY) return false;

    const hero = this.getHeroDeployedAtPosition(cell.position);

    return !ui.selectedHeroToDeploy && !!hero;
  }

  action(cell: BoardCellViewModel) {
    this.client.ui.selectedHeroToDeploy = this.getHeroDeployedAtPosition(
      cell.position
    )!.hero;
  }
}
