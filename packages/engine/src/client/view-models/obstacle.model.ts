import type { Point } from '@game/shared';
import type { SerializedObstacle } from '../../obstacle/obstacle.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';
import { DeclareAttackObstacleClickAction } from '../actions/declare-attack.obstacle-click.action';
import type { BoardCellViewModel } from './board-cell.model';

export class ObstacleViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedObstacle,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(Obstacle: ObstacleViewModel | SerializedObstacle) {
    return this.id === Obstacle.id;
  }

  update(data: Partial<SerializedObstacle>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new ObstacleViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get spriteId() {
    return `obstacle-${this.data.sprite.id}`;
  }

  get spriteParts() {
    return this.data.sprite.parts;
  }

  get orientation() {
    return this.data.orientation;
  }

  get position() {
    return this.data.position;
  }

  get player() {
    if (!this.data.player) return null;
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get maxHP() {
    return this.data.maxHp;
  }

  get hp() {
    return this.data.currentHp;
  }

  get isAttackable() {
    return this.data.isAttackable;
  }

  get cell() {
    const entities = this.getEntities();
    return (entities[`${this.position.x}:${this.position.y}:${this.position.z}`] as
      | BoardCellViewModel
      | undefined)!;
  }

  onClick() {
    const client = this.getClient();
    const rules = [new DeclareAttackObstacleClickAction(client)];

    for (const rule of rules) {
      if (rule.predicate(this)) {
        rule.action(this);
        break;
      }
    }
    client.forceSync();
  }
}
