import { Vec3, type Values } from '@game/shared';
import type { SerializedBoardCell } from '../../board/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { ObstacleViewModel } from './obstacle.model';
import { UnitViewModel } from './unit.model';
import { DeployCellClickAction } from '../actions/deploy.cell-click-action';
import { DeclareMoveIntentCellClickAction } from '../actions/declare-move-intent.cell-click-action';
import { GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from './player.model';

export const CELL_HIGHLIGHTS = {
  BLUE: 'blue',
  RED: 'red',
  WHITE: 'white',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  CYAN: 'cyan',
  PURPLE: 'purple'
} as const;
export type CellHighlight = Values<typeof CELL_HIGHLIGHTS>;

export class BoardCellViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedBoardCell,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardCellViewModel | SerializedBoardCell) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new BoardCellViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get spriteId() {
    return `tile-${this.data.spriteId}`;
  }

  get position() {
    return this.data.position;
  }

  get unit() {
    if (!this.data.unit) return null;
    const entities = this.getEntities();
    return entities[this.data.unit] as UnitViewModel;
  }

  get obstacle() {
    if (!this.data.obstacle) return null;
    const entities = this.getEntities();
    return entities[this.data.obstacle] as ObstacleViewModel;
  }

  get activeUnitCanAttack() {
    const client = this.getClient();
    const entities = this.getEntities();
    if (client.state.phase !== GAME_PHASES.BATTLE) return false;
    if (!client.state.activeUnitId) return false;

    const activeUnit = entities[client.state.activeUnitId] as UnitViewModel;
    if (!activeUnit) return false;

    return activeUnit.attackablePoints.some(p =>
      Vec3.fromPoint3D(p.point).equals(this.position)
    );
  }

  get activeUnitCanMove() {
    const client = this.getClient();
    const entities = this.getEntities();
    if (client.state.phase !== GAME_PHASES.BATTLE) return false;
    if (!client.state.activeUnitId) return false;

    const activeUnit = entities[client.state.activeUnitId] as UnitViewModel;
    if (!activeUnit) return false;

    return activeUnit.potentialMoves.some(p =>
      Vec3.fromPoint3D(p.point).equals(this.position)
    );
  }

  get enemiesInAttackRange() {
    const client = this.getClient();
    const entities = this.getEntities();
    const enemies = Object.values(entities).filter(
      e => e instanceof UnitViewModel && e.player.id !== client.playerId
    ) as UnitViewModel[];

    return enemies.filter(enemy => {
      return enemy.attackZone.some(p => Vec3.fromPoint3D(p.point).equals(this.position));
    });
  }

  onClick() {
    const client = this.getClient();
    const rules = [
      new DeployCellClickAction(client),
      new DeclareMoveIntentCellClickAction(client)
    ];

    for (const rule of rules) {
      if (rule.predicate(this)) {
        rule.action(this);
        break;
      }
    }
    client.forceSync();
  }

  get canDeploy() {
    const client = this.getClient();
    const player = client.state.entities[client.playerId] as PlayerViewModel;
    if (client.state.phase !== GAME_PHASES.DEPLOY) return false;
    return player.deployZone.some(p => p.equals(this));
  }
}
