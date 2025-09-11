import { assert, type Values } from '@game/shared';
import type { BoardCell } from '../../board/board-cell.entity';
import type { GameClient } from '../client';

import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';

export type Camera = {
  rotateCW(): void;
  rotateCCW(): void;
};

export const CELL_HIGHLIGHTS = {
  BLUE: 'blue',
  RED: 'red',
  WHITE: 'white',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  CYAN: 'cyan'
} as const;
export type CellHighlight = Values<typeof CELL_HIGHLIGHTS>;

export class DOMSelector {
  constructor(readonly id: string) {}

  get selector() {
    return `#${this.id}`;
  }

  get element() {
    return document.getElementById(this.id);
  }
}

export class UiController {
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  DOMSelectors = {};

  displayedElements = {};

  highlightedElement: HTMLElement | null = null;

  _hoveredCell: BoardCellViewModel | null = null;

  private _camera: Camera | null = null;

  constructor(private client: GameClient) {}

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  get hoveredCell() {
    return this._hoveredCell;
  }

  get camera(): Camera | null {
    return this._camera;
  }

  set camera(camera: Camera) {
    this._camera = camera;
  }

  hoverAt(cell: BoardCellViewModel) {
    if (this._hoveredCell?.equals(cell)) return;
    this._hoveredCell = cell;
  }

  unhover() {
    this._hoveredCell = null;
  }

  update() {}

  getCellHighlight(cell: BoardCellViewModel): CellHighlight | null {
    const player = this.client.state.entities[this.client.playerId] as PlayerViewModel;
    if (this.client.state.phase === GAME_PHASES.DEPLOY) {
      if (player.deployZone.includes(cell.id)) {
        return CELL_HIGHLIGHTS.CYAN;
      }
    }

    return null;
  }
}
