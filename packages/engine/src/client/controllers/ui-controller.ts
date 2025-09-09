import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';

import type { AbilityViewModel } from '../view-models/ability.model';

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

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {}

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  update() {}
}
