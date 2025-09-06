import type { Serializable, Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_EVENTS } from '../game.events';
import type { Unit } from '../../unit/unit.entity';
import type { Game } from '../game';

export const TURN_EVENTS = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end'
} as const;

export class GameTurnEvent extends TypedSerializableEvent<
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
  [TURN_EVENTS.TURN_START]: GameTurnEvent;
  [TURN_EVENTS.TURN_END]: GameTurnEvent;
};

export type SerializedTurnOrder = string[];

export class TurnSystem implements Serializable<SerializedTurnOrder> {
  private _turnCount = 0;

  private _processedUnits = new Set<Unit>();

  queue: Unit[] = [];

  constructor(private game: Game) {}

  initialize() {
    this.game.on(GAME_EVENTS.UNIT_TURN_END, this.onUnitTurnEnd.bind(this));
    this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, e => {
      this.removeFromCurrentQueue(e.data.unit);
    });

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

  startGameTurn() {
    this._turnCount++;
    this.queue = [];
    this._processedUnits.clear();

    this.buildQueue();
    this.game.emit(
      TURN_EVENTS.TURN_START,
      new GameTurnEvent({ turnCount: this.turnCount })
    );

    this.activeUnit?.startTurn();
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

  endGameTurn() {
    this.game.emit(
      TURN_EVENTS.TURN_END,
      new GameTurnEvent({ turnCount: this.turnCount })
    );
  }

  onUnitTurnEnd() {
    this._processedUnits.add(
      this.queue.splice(this.queue.indexOf(this.activeUnit), 1)[0]
    );

    if (!this.activeUnit) {
      this.endGameTurn();
      this.startGameTurn();
      return;
    } else {
      this.activeUnit.startTurn();
    }
  }
}
