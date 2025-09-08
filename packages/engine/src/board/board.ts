import {
  indexToPoint,
  isString,
  type Point,
  type Point3D,
  type Serializable
} from '@game/shared';
import { BoardCell } from './board-cell.entity';
import { pointToCellId } from './board.utils';
import type { MapBlueprint } from './map-blueprint';
import type { Game } from '../game/game';
import { TILES } from './tiles';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  cells: string[];
};

export class Board implements Serializable<SerializedBoard> {
  map!: MapBlueprint;

  cellsMap = new Map<string, BoardCell>();

  constructor(private game: Game) {}

  initialize(options: BoardSystemOptions) {
    this.map = options.map;
    this.map.cells.forEach((cell, index) => {
      if (!cell) return;
      const { x, y, z } = indexToPoint(index, this.map.cols, this.map.rows);
      const instance = new BoardCell(this.game, {
        id: pointToCellId({ x, y, z }),
        position: { x, y, z },
        tile: TILES[cell.tile]
      });
      this.cellsMap.set(instance.id, instance);

      if (cell.obstacle) {
        this.game.obstacleManager.addObstacle({
          blueprintId: cell.obstacle.blueprintId,
          position: { x, y, z },
          orientation: cell.obstacle.orientation,
          player: null
        });
      }
    });

    this.map.players.forEach((player, index) => {
      player.obstacles.forEach(obstacle => {
        this.game.obstacleManager.addObstacle({
          blueprintId: obstacle.blueprintId,
          position: obstacle.position,
          orientation: obstacle.orientation,
          player: this.game.playerManager.players[index]
        });
      });
    });
  }

  serialize() {
    return {
      rows: this.rows,
      columns: this.cols,
      cells: this.cells.map(cell => cell.id)
    };
  }

  get cols() {
    return this.map.cols;
  }

  get rows() {
    return this.map.rows;
  }

  get cells() {
    return [...this.cellsMap.values()];
  }

  getCellAt(posOrKey: string | Point3D) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getManhattanDistance(p1: Point, p2: Point) {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }

  getNeighbors(point: Point3D) {
    return this.cells.filter(
      cell => cell.position.isNearby(point) && !cell.position.equals(point)
    );
  }
}
