import { assert, Vec3, type Point3D, type Values } from '@game/shared';
import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { DIRECTION, type Direction } from '../../board/board.utils';
import type { SerializedPlayer } from '../../player/player.entity';
import type { AbilityViewModel } from '../view-models/ability.model';
import type { UnitViewModel } from '../view-models/unit.model';

export type Camera = {
  rotateCW(): void;
  rotateCCW(): void;
  getZoom(): number;
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

export type HeroToDeploy = SerializedPlayer['heroes'][number] & { status: 'reserve' };
export type DeployedHero = {
  hero: HeroToDeploy;
  position: Point3D;
  orientation: Direction;
};

export type UnitAction = { id: string } & (
  | {
      type: 'attack';
    }
  | { type: 'ability'; ability: AbilityViewModel }
);
export class UiController {
  DOMSelectors = {};

  displayedElements = {};

  highlightedElement: HTMLElement | null = null;

  private _hoveredCell: BoardCellViewModel | null = null;

  hoveredHeroInDeployActionBar: HeroToDeploy | null = null;

  deployment = {} as Record<string, DeployedHero>;

  selectedHeroToDeploy: HeroToDeploy | null = null;

  private _camera: Camera | null = null;

  private _selectedUnitAction: UnitAction | null = null;

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

  get selectedUnitAction(): UnitAction | null {
    return this._selectedUnitAction;
  }

  set selectedUnitAction(action: UnitAction) {
    this._selectedUnitAction = action;
  }

  clearUnitaction() {
    this._selectedUnitAction = null;
    const activeUnit = this.client.state.entities[
      this.client.state.activeUnitId!
    ] as UnitViewModel;
    activeUnit.cancelAttackIntent();
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
}
