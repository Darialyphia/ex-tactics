import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';

export type CellClickAction = {
  predicate(cell: BoardCellViewModel): boolean;
  action(cell: BoardCellViewModel): void;
};
