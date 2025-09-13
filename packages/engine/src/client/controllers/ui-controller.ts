import { assert, Vec3, type Point3D, type Values } from '@game/shared';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';
import { DIRECTION, type Direction } from '../../board/board.utils';
import type { SerializedPlayer } from '../../player/player.entity';
import type { CellClickAction } from '../actions/action';
import { DeployCellClickAction } from '../actions/deploy.cell-click-action';
import type { UnitViewModel } from '../view-models/unit.model';
import { DeclareMoveIntentCellClickAction } from '../actions/declareMoveIntent.cell-click-action';

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
export type DeployedHero = {
  hero: HeroToDeploy;
  position: Point3D;
  orientation: Direction;
};
export class UiController {
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  DOMSelectors = {};

  displayedElements = {};

  highlightedElement: HTMLElement | null = null;

  private _hoveredCell: BoardCellViewModel | null = null;

  hoveredHeroInDeployActionBar: HeroToDeploy | null = null;

  deployment = {} as Record<string, DeployedHero>;

  selectedHeroToDeploy: HeroToDeploy | null = null;

  private _camera: Camera | null = null;

  private cellClickRules: CellClickAction[];

  constructor(private client: GameClient) {
    this.cellClickRules = [
      new DeployCellClickAction(client),
      new DeclareMoveIntentCellClickAction(client)
    ];
  }

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

  private swapDeployment(a: DeployedHero, b: DeployedHero) {
    const tempPosition = a.position;
    const tempOrientation = a.orientation;

    a.position = b.position;
    a.orientation = b.orientation;

    b.position = tempPosition;
    b.orientation = tempOrientation;
  }

  deployAt(position: Point3D) {
    const heroToDeploy = this.selectedHeroToDeploy;
    assert(heroToDeploy, 'No hero selected to deploy');

    const heroDeployedAtPosition = Object.values(this.deployment).find(d =>
      Vec3.fromPoint3D(d.position).equals(position)
    );

    const alreadyDeployedHero = Object.values(this.deployment).find(
      d => d.hero === heroToDeploy
    );

    if (alreadyDeployedHero && heroDeployedAtPosition) {
      this.swapDeployment(alreadyDeployedHero, heroDeployedAtPosition);
      this.selectedHeroToDeploy = null;
      return;
    }

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

    if (this.client.state.phase === GAME_PHASES.BATTLE) {
      const activeUnit = this.client.state.entities[
        this.client.state.activeUnitId!
      ] as UnitViewModel;
      const canMove = activeUnit?.potentialMoves.some(p =>
        Vec3.fromPoint3D(p.point).equals(cell.position)
      );
      if (canMove) return CELL_HIGHLIGHTS.BLUE;
    }

    return null;
  }

  onCellClick(cell: BoardCellViewModel) {
    for (const rule of this.cellClickRules) {
      if (rule.predicate(cell)) {
        rule.action(cell);
        break;
      }
    }
  }
}
