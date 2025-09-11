import { assert } from '@game/shared';
import type { BoardCell } from '../../board/board-cell.entity';
import type { GameClient } from '../client';

import type { BoardCellViewModel } from '../view-models/board-cell.model';

export type Camera = {
  rotateCW(): void;
  rotateCCW(): void;
};

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
}
