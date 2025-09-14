import type { GameClient } from '../client';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import type { UnitViewModel } from '../view-models/unit.model';

export type CellClickAction = {
  predicate(cell: BoardCellViewModel): boolean;
  action(cell: BoardCellViewModel): void;
};

export type UnitClickAction = {
  predicate(unit: UnitViewModel): boolean;
  action(unit: UnitViewModel): void;
};
