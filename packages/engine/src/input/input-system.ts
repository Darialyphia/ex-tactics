import {
  isDefined,
  type AnyFunction,
  type Constructor,
  type Nullable,
  type Prettify,
  type Values
} from '@game/shared';
import { type Game } from '../game/game';
import type { DefaultSchema, Input } from './input';
import { z } from 'zod';
import {
  GAME_EVENTS,
  GameErrorEvent,
  GameInputQueueFlushedEvent,
  GameInputEvent
} from '../game/game.events';
import { InputError } from './input-errors';
import { EndTurnInput } from './inputs/end-turn';
import { MoveInput } from './inputs/move.input';
import { AttackInput } from './inputs/attack.input';
import { UseAbilityInput } from './inputs/use-ability';
import { DeployInput } from './inputs/deploy.input';

type GenericInputMap = Record<string, Constructor<Input<DefaultSchema>>>;

type ValidatedInputMap<T extends GenericInputMap> = {
  [Name in keyof T & string]: T[Name] extends Constructor<Input<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : `input map mismatch: expected ${Name}, but Input name is ${InstanceType<T[Name]>['name']}`
    : `input type mismatch: expected Input constructor`;
};

const validateinputMap = <T extends GenericInputMap>(data: ValidatedInputMap<T>) => data;

const inputMap = validateinputMap({
  endTurn: EndTurnInput,
  move: MoveInput,
  attack: AttackInput,
  useAbility: UseAbilityInput,
  deploy: DeployInput
});

type InputMap = typeof inputMap;

type UnpauseCallback<T> = (data: T) => void;

export type SerializedInput = Prettify<
  Values<{
    [Name in keyof InputMap]: {
      type: Name;
      payload: InstanceType<InputMap[Name]> extends Input<infer Schema>
        ? z.infer<Schema>
        : never;
    };
  }>
>;
export type InputDispatcher<T = void> = (input: SerializedInput) => T;

export type InputSystemOptions = { game: Game };

export class InputSystem {
  private history: Input<any>[] = [];

  private isRunning = false;

  private queue: AnyFunction[] = [];

  private _currentAction?: Nullable<InstanceType<Values<typeof inputMap>>> = null;

  private onUnpause: UnpauseCallback<any> | null = null;

  private nextInputId = 0;

  constructor(private game: Game) {}

  get currentAction() {
    return this._currentAction;
  }

  get isPaused() {
    return isDefined(this.onUnpause);
  }

  initialize() {}

  applyHistory(rawHistory: SerializedInput[]) {
    for (const input of rawHistory) {
      this.schedule(() => this.handleInput(input));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  private isActionType(type: string): type is keyof typeof inputMap {
    return Object.keys(inputMap).includes(type);
  }

  private addToHistory(input: Input<any>) {
    const ignored: Constructor<Input<any>>[] = [];
    if (ignored.includes(input.constructor as Constructor<Input<any>>)) return;

    this.history.push(input);
  }

  schedule(fn: AnyFunction) {
    this.queue.push(fn);
    if (!this.isRunning) {
      this.flushSchedule();
    }
  }

  private flushSchedule() {
    if (this.isRunning) {
      console.warn('already flushing !');
      return;
    }
    this.isRunning = true;
    try {
      while (this.queue.length) {
        const fn = this.queue.shift();
        fn!();
      }
      this.isRunning = false;
      this.game.snapshotSystem.takeSnapshot();
      this.game.emit(GAME_EVENTS.FLUSHED, new GameInputQueueFlushedEvent({}));
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(err: unknown) {
    console.groupCollapsed('%c[INPUT SYSTEM]: ERROR', 'color: #ff0000');
    console.error(err, {
      initialState: this.game.options,
      history: this.game.inputSystem.serialize()
    });
    console.groupEnd();

    const serialized = this.game.serialize();
    if (this._currentAction) {
      serialized.history.push(this._currentAction.serialize() as SerializedInput);
    }
    this.game.emit(
      'game.error',
      new GameErrorEvent({ error: err as Error, debugDump: serialized })
    );

    // this means the error got caught during player input validation, the game state is not corrupted but clients might need to resync
    if (err instanceof InputError) {
      this.isRunning = false;
      this.queue = [];
      this._currentAction = null;
      this.game.snapshotSystem.takeSnapshot();
      this.game.emit(GAME_EVENTS.FLUSHED, new GameInputQueueFlushedEvent({}));
    }
  }

  dispatch(input: SerializedInput) {
    console.groupCollapsed(`[InputSystem]: ${input.type}`);
    console.log(input);
    console.groupEnd();
    if (!this.isActionType(input.type)) return;
    if (this.isPaused) {
      // if the game is paused, run the input immediately
      this.handleInput(input);
    } else if (this.isRunning) {
      // let the current input fully resolve, then schedule
      // the currentinput could schedule new actions, so we need to wait for the flush
      this.game.once(GAME_EVENTS.FLUSHED, () => {
        return this.schedule(() => this.handleInput(input));
      });
    } else {
      // if the game is not paused and not running, run the input immediately
      this.schedule(() => {
        return this.handleInput(input);
      });
    }
  }

  handleInput(arg: SerializedInput) {
    const { type, payload } = arg;
    if (!this.isActionType(type)) return;
    const ctor = inputMap[type];
    const input = new ctor(this.game, this.nextInputId++, payload);
    const prevAction = this._currentAction;
    this._currentAction = input;
    this.game.emit(GAME_EVENTS.INPUT_START, new GameInputEvent({ input }));

    input.execute();
    this.game.emit(GAME_EVENTS.INPUT_END, new GameInputEvent({ input }));
    this.addToHistory(input);
    this._currentAction = prevAction;
  }

  getHistory() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(action => action.serialize()) as SerializedInput[];
  }
}
