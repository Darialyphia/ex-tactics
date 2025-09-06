import type { Point } from '@game/shared';
import type { SerializedCoords } from '../../../board/board-cell.entity';
import type { Edge } from '../algorithms/dijkstra';

export type PathfindingStrategy = {
  getEdges(node: SerializedCoords): Array<Edge<SerializedCoords>>;
  setOrigin(origin: Point): void;
  done(): void;
};
