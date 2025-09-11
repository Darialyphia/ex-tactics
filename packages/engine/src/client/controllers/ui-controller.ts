import type { BoardCell } from '../../board/board-cell.entity';
import type { GameClient } from '../client';

import type { BoardCellViewModel } from '../view-models/board-cell.model';

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

  constructor(private client: GameClient) {}

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  get hoveredCell() {
    return this._hoveredCell;
  }

  hoverAt(cell: BoardCellViewModel) {
    if (this._hoveredCell?.equals(cell)) return;
    this._hoveredCell = cell;
  }

  unhover() {
    this._hoveredCell = null;
  }

  update() {}
}
