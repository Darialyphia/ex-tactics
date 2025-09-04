import type { Point3D } from '@game/shared';
import type { Game } from '../game/game';
import { Unit } from './unit.entity';
import type { Player } from '../player/player.entity';

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

  addUnit(player: Player, position: Point3D) {
    const id = ++this.nextUnitId;
    const unit = new Unit(this.game, {
      id,
      player,
      position
    });
    this.unitMap.set(unit.id, unit);

    return unit;
  }

  removeUnit(unit: Unit) {
    this.unitMap.delete(unit.id);
  }
}
