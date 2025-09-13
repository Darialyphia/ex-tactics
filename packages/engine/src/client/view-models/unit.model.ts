import { Vec3, type Nullable, type Point3D } from '@game/shared';
import type { SerializedUnit } from '../../unit/unit.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';
import type { BoardCellViewModel } from './board-cell.model';

export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  moveIntent: Nullable<{ point: Point3D; path: Point3D[] }> = null;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedUnit>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new UnitViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get position() {
    return this.data.position;
  }

  get orientation() {
    return this.data.orientation;
  }

  get spriteId() {
    return `unit-${this.data.sprite.id}`;
  }

  get spriteParts() {
    return this.data.sprite.parts;
  }

  get potentialMoves() {
    return this.data.potentialMoves;
  }

  get indexInTurnOrder() {
    return this.getClient().state.turnOrder.indexOf(this.id);
  }

  get hp() {
    return this.data.currentHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get mp() {
    return this.data.currentMp;
  }

  get maxMp() {
    return this.data.maxMp;
  }

  canMoveTo(cell: BoardCellViewModel) {
    return this.data.potentialMoves.some(point =>
      Vec3.fromPoint3D(point.point).equals(cell.position)
    );
  }

  moveTowards(point: Point3D) {
    const destination = this.data.potentialMoves.find(p =>
      Vec3.fromPoint3D(p.point).equals(point)
    );
    if (destination) {
      this.moveIntent = destination;
    }
  }
}
