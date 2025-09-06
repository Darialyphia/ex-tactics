import type { Point3D } from '@game/shared';
import type { Game } from '../game/game';
import { Unit } from './unit.entity';
import type { Player } from '../player/player.entity';
import { UNITS_DICTIONARY } from './units';
import type { Direction } from '../board/board.utils';

export class UnitManager {
  private unitMap = new Map<string, Unit>();

  private nextUnitId = 0;

  constructor(private game: Game) {}

  get units() {
    return [...this.unitMap.values()];
  }

  getUnitById(id: string) {
    return this.unitMap.get(id) ?? null;
  }

  getUnitAt(position: Point3D) {
    return (
      this.units.find(unit => {
        return unit.position.equals(position);
      }) ?? null
    );
  }

  getNearbyUnits({ x, y, z }: Point3D) {
    return this.units.filter(
      u => u.position.isNearby({ x, y, z }) && !u.position.equals({ x, y, z })
    );
  }

  addUnit(options: {
    player: Player;
    position: Point3D;
    blueprintId: string;
    selectedTalents: string[];
    orientation: Direction;
  }) {
    const blueprint = UNITS_DICTIONARY[options.blueprintId];
    if (!blueprint) {
      throw new Error(`Unknown unit blueprint ID: ${options.blueprintId}`);
    }
    const id = ++this.nextUnitId;
    const unit = new Unit(this.game, {
      id,
      blueprint,
      player: options.player,
      position: options.position,
      selectedTalents: options.selectedTalents,
      orientation: options.orientation
    });
    this.unitMap.set(unit.id, unit);

    return unit;
  }

  removeUnit(unit: Unit) {
    this.unitMap.delete(unit.id);
  }
}
