import type { EmptyObject, Point3D, Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';
import type { Direction } from '../board/board.utils';
import { UNIT_EVENTS } from '../unit/unit.constants';
import { TURN_EVENTS } from '../game/systems/turn.system';
import { PlayerDeployedForTurnEvent } from './player.events';
import { PLAYER_EVENTS } from './player.constants';
import { shrine } from '../obstacle/obstacles/shrine';
import { match } from 'ts-pattern';

export type SerializedPlayer = {
  entityType: 'player';
  name: string;
  id: string;
  deployZone: string[];
  heroes: Array<
    | {
        status: 'deployed';
        unit: string;
      }
    | {
        status: 'reserve';
        blueprintId: string;
        selectedTalents: string[];
        cooldown: number;
      }
  >;
};

export type PlayerOptions = {
  id: string;
  name: string;
  heroes: Array<{
    blueprintId: string;
    selectedTalents: string[];
  }>;
};

type PlayerHero =
  | {
      status: 'deployed';
      unit: Unit;
    }
  | {
      status: 'reserve';
      blueprintId: string;
      selectedTalents: string[];
      cooldown: number;
    };
export class Player
  extends Entity<EmptyObject>
  implements Serializable<SerializedPlayer>
{
  heroes: PlayerHero[];

  constructor(
    private game: Game,
    private options: PlayerOptions
  ) {
    super(`player-${options.id}`, {});
    this.heroes = options.heroes.map(h => ({
      status: 'reserve',
      blueprintId: h.blueprintId,
      selectedTalents: h.selectedTalents,
      cooldown: 0
    }));
    this.game.on(UNIT_EVENTS.UNIT_AFTER_DESTROY, this.onUnitDestroyed.bind(this));
    this.game.on(TURN_EVENTS.ROUND_END, this.onRoundEnd.bind(this));
  }

  serialize() {
    return {
      entityType: 'player' as const,
      name: this.options.name,
      id: this.id,
      deployZone: this.deployZone.map(p => p.id),
      heroes: this.heroes.map(hero =>
        match(hero)
          .with({ status: 'deployed' } as const, hero => ({
            status: 'deployed' as const,
            unit: hero.unit.id
          }))
          .with({ status: 'reserve' } as const, hero => ({
            status: 'reserve' as const,
            blueprintId: hero.blueprintId,
            selectedTalents: hero.selectedTalents,
            cooldown: hero.cooldown
          }))
          .exhaustive()
      )
    };
  }

  get units() {
    return this.game.unitManager.units.filter(u => u.player.equals(this));
  }

  get obstacles() {
    return this.game.obstacleManager.obstacles.filter(o => o.player?.equals(this));
  }

  get opponent() {
    return this.game.playerManager.players.find(p => !p.equals(this))!;
  }

  get isActive() {
    return this.game.turnSystem.activeUnit.player.equals(this) ?? false;
  }

  get deployZone() {
    return this.obstacles
      .filter(o => o.blueprintId === shrine.id)
      .flatMap(obstacle => this.game.board.getNeighbors(obstacle.position))
      .filter(c => c.isWalkable);
  }

  private onRoundEnd() {
    this.heroes.forEach(h => {
      if (h.status === 'reserve' && h.cooldown > 0) {
        h.cooldown--;
      }
    });
  }

  onUnitDestroyed(e: { data: { unit: Unit } }) {
    if (!this.equals(e.data.unit.player)) return;

    const hero = this.heroes.find(
      h => h.status === 'deployed' && h.unit.equals(e.data.unit)
    ) as PlayerHero & { status: 'deployed' };
    if (!hero) return;

    this.heroes = this.heroes.filter(
      h => !(h.status === 'deployed' && h.unit.equals(e.data.unit))
    );
    this.heroes.push({
      status: 'reserve',
      blueprintId: hero.unit.blueprintId,
      selectedTalents: hero.unit.selectedTalents,
      cooldown: this.game.config.RESPAWN_COOLDOWN
    });
  }

  get hasHeroToDeploy() {
    return this.heroes.some(h => h.status === 'reserve' && h.cooldown === 0);
  }

  canDeployHeroAt(position: Point3D) {
    return this.deployZone.some(p => p.position.equals(position));
  }

  deployHero(blueprintId: string, position: Point3D, orientation: Direction) {
    const hero = this.heroes.find(
      h => h.status === 'reserve' && h.blueprintId === blueprintId
    ) as PlayerHero & { status: 'reserve' };
    if (!hero) return;

    const unit = this.game.unitManager.addUnit({
      blueprintId,
      player: this,
      position,
      orientation,
      selectedTalents: hero.selectedTalents
    });

    this.heroes = this.heroes.filter(
      h => h.status === 'reserve' && h.blueprintId === blueprintId
    );
    this.heroes.push({
      status: 'deployed',
      unit
    });

    if (!this.hasHeroToDeploy) {
      this.game.emit(
        PLAYER_EVENTS.PLAYER_DEPLOYED_FOR_TURN,
        new PlayerDeployedForTurnEvent({ player: this })
      );
    }
  }

  deployHeroes(
    heroes: Array<{ blueprintId: string; position: Point3D; orientation: Direction }>
  ) {
    heroes.forEach(({ blueprintId, position, orientation }) => {
      this.deployHero(blueprintId, position, orientation);
    });
  }

  sendToReserve(unit: Unit) {
    const hero = this.heroes.find(
      h => h.status === 'deployed' && h.unit.equals(unit)
    ) as PlayerHero & { status: 'deployed' };
    if (!hero) return;

    this.heroes = this.heroes.filter(
      h => !(h.status === 'deployed' && h.unit.equals(unit))
    );
    this.heroes.push({
      status: 'reserve',
      blueprintId: hero.unit.blueprintId,
      selectedTalents: hero.unit.selectedTalents,
      cooldown: this.game.config.RESPAWN_COOLDOWN
    });
  }
}
