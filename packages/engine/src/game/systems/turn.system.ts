import type { Serializable, Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_EVENTS } from '../game.events';
import type { Unit } from '../../unit/unit.entity';
import type { Game } from '../game';
import { PLAYER_EVENTS } from '../../player/player.constants';

export const TURN_EVENTS = {
  ROUND_START: 'round_start',
  ROUND_END: 'round_end'
} as const;

export class RoundEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}
export type TurnEvent = Values<typeof TURN_EVENTS>;

export type TurnEventMap = {
  [TURN_EVENTS.ROUND_START]: RoundEvent;
  [TURN_EVENTS.ROUND_END]: RoundEvent;
};

export const ROUND_PHASES = {
  DEPLOY: 'deploy',
  BATTLE: 'battle'
} as const;
export type RoundPhase = Values<typeof ROUND_PHASES>;

export type SerializedTurnOrder = string[];

export class TurnSystem implements Serializable<SerializedTurnOrder> {
  private _turnCount = 0;

  private _processedUnits = new Set<Unit>();

  queue: Unit[] = [];

  private _phase: RoundPhase = ROUND_PHASES.DEPLOY;

  constructor(private game: Game) {}

  get phase() {
    return this._phase;
  }

  initialize() {
    this.game.on(GAME_EVENTS.UNIT_TURN_END, this.onUnitTurnEnd.bind(this));
    this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, e => {
      this.removeFromCurrentQueue(e.data.unit);
    });
    this.game.on(
      PLAYER_EVENTS.PLAYER_DEPLOYED_FOR_TURN,
      this.onPlayerDeployedForTurn.bind(this)
    );
    this.buildQueue();
  }

  serialize() {
    return this.queue.map(unit => unit.id);
  }

  get turnCount() {
    return this._turnCount;
  }

  get activeUnit() {
    return [...this.queue][0];
  }

  get processedUnits() {
    return this._processedUnits;
  }

  private buildQueue() {
    this.game.unitManager.units
      .sort((a, b) => b.initiative - a.initiative)
      .forEach(unit => this.queue.push(unit));
  }

  private onPlayerDeployedForTurn() {
    if (this.phase !== ROUND_PHASES.DEPLOY) return;
    const hasUnitToDeploy = this.game.playerManager.players.some(p => p.hasHeroToDeploy);
    if (hasUnitToDeploy) return;

    this._phase = ROUND_PHASES.BATTLE;
    this.startBattlePhase();
  }

  private startBattlePhase() {
    this.queue = [];
    this._processedUnits.clear();

    this.buildQueue();
    this.game.emit(
      TURN_EVENTS.ROUND_START,
      new RoundEvent({ turnCount: this.turnCount })
    );

    this.activeUnit?.startTurn();
  }

  startRound() {
    const hasUnitToDeploy = this.game.playerManager.players.some(p => p.hasHeroToDeploy);
    this._phase = hasUnitToDeploy ? ROUND_PHASES.DEPLOY : ROUND_PHASES.BATTLE;

    this._turnCount++;
    this.startBattlePhase();
  }

  removeFromCurrentQueue(unit: Unit) {
    const idx = this.queue.findIndex(u => u.equals(unit));
    if (idx === -1) return;
    this.queue.splice(idx, 1);
  }

  insertInCurrentQueue(unit: Unit) {
    let idx = this.queue.findIndex(u => u.initiative < unit.initiative);
    if (idx === -1) idx = this.queue.length;
    this.queue.splice(idx, 0, unit);
  }

  endRound() {
    this.game.emit(TURN_EVENTS.ROUND_END, new RoundEvent({ turnCount: this.turnCount }));
  }

  onUnitTurnEnd() {
    this._processedUnits.add(
      this.queue.splice(this.queue.indexOf(this.activeUnit), 1)[0]
    );

    if (!this.activeUnit) {
      this.endRound();
      this.startRound();
      return;
    } else {
      this.activeUnit.startTurn();
    }
  }
}
