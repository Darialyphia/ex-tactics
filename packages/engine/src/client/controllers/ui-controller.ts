import { assert, Vec3, type Point3D, type Values } from '@game/shared';
import type { BoardCell } from '../../board/board-cell.entity';
import type { GameClient } from '../client';

import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';
import { DIRECTION, type Direction } from '../../board/board.utils';
import type { SerializedPlayer } from '../../player/player.entity';

export type Camera = {
  rotateCW(): void;
  rotateCCW(): void;
  getZoom(): number;
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

export type HeroToDeploy = SerializedPlayer['heroes'][number] & { status: 'reserve' };

export class UiController {
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  DOMSelectors = {};

  displayedElements = {};

  highlightedElement: HTMLElement | null = null;

  _hoveredCell: BoardCellViewModel | null = null;

  deployment = {} as Record<
    string,
    { hero: HeroToDeploy; position: Point3D; orientation: Direction }
  >;

  selectedHeroToDeploy: HeroToDeploy | null = null;

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

  deployAt(position: Point3D) {
    const heroToDeploy = this.selectedHeroToDeploy;
    assert(heroToDeploy, 'No hero selected to deploy');
    const heroDeployedAtPosition = Object.values(this.deployment).find(d =>
      Vec3.fromPoint3D(d.position).equals(position)
    );

    this.deployment[heroToDeploy.blueprintId] = {
      hero: heroToDeploy,
      position,
      orientation: DIRECTION.NORTH
    };

    if (heroDeployedAtPosition) {
      delete this.deployment[heroDeployedAtPosition.hero.blueprintId];
      this.selectedHeroToDeploy = heroDeployedAtPosition.hero;
    } else {
      this.selectedHeroToDeploy = null;
    }
  }

  clearDeployment() {
    this.deployment = {};
    this.selectedHeroToDeploy = null;
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
      if (player.deployZone.some(p => p.equals(cell))) {
        return CELL_HIGHLIGHTS.CYAN;
      }
    }

    return null;
  }

  onCellClick(cell: BoardCellViewModel) {
    if (this.client.state.phase === GAME_PHASES.DEPLOY) {
      const player = this.client.state.entities[this.client.playerId] as PlayerViewModel;
      if (this.selectedHeroToDeploy && player.deployZone.some(p => p.equals(cell))) {
        this.deployAt(cell.position);
      }
    }
  }
}
