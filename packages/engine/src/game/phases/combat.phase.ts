import {
  assert,
  StateMachine,
  stateTransition,
  type Serializable,
  type Values
} from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { GameError } from '../game-error';
import {
  CorruptedGamephaseContextError,
  GAME_PHASE_TRANSITIONS
} from '../systems/game-phase.system';
import { CombatDamage } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES } from '../game.enums';

export type Attacker = MinionCard | HeroCard;
export type AttackTarget = MinionCard | HeroCard;
export type Defender = MinionCard | HeroCard;

export const COMBAT_STEPS = {
  DECLARE_ATTACKER: 'declare-attacker',
  DECLARE_TARGET: 'declare-target',
  DECLARE_BLOCKER: 'declare-blocker',
  BUILDING_CHAIN: 'chain',
  RESOLVING_COMBAT: 'resolving'
} as const;

export type CombatStep = Values<typeof COMBAT_STEPS>;

export const COMBAT_STEP_TRANSITIONS = {
  ATTACKER_DECLARED: 'attacker-declared',
  ATTACKER_TARGET_DECLARED: 'attacker-target-declared',
  BLOCKER_DECLARED: 'blocker-declared',
  CHAIN_RESOLVED: 'chain-resolved'
} as const;

export type CombatStepTransition = Values<typeof COMBAT_STEP_TRANSITIONS>;

export type SerializedCombatPhase = {
  attacker: string;
  target: string | null;
  blocker: string | null;
  step: CombatStep;
  potentialTargets: string[];
  potentialBlockers: string[];
};

export class BeforeDeclareAttackEvent extends TypedSerializableEvent<
  { attacker: Attacker },
  { attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id
    };
  }
}

export class AfterDeclareAttackEvent extends TypedSerializableEvent<
  { attacker: Attacker },
  { attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id
    };
  }
}

export class BeforeDeclareAttackTargetEvent extends TypedSerializableEvent<
  { target: AttackTarget; attacker: Attacker },
  { target: string; attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class AfterDeclareAttackTargetEvent extends TypedSerializableEvent<
  { target: AttackTarget; attacker: Attacker },
  { target: string; attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class BeforeDeclareBlockerEvent extends TypedSerializableEvent<
  { blocker: Defender | null },
  { blocker: string | null }
> {
  serialize() {
    return {
      blocker: this.data.blocker?.id ?? null
    };
  }
}
export class AfterDeclareBlockerEvent extends TypedSerializableEvent<
  { blocker: Defender | null },
  { blocker: string | null }
> {
  serialize() {
    return {
      blocker: this.data.blocker?.id ?? null
    };
  }
}

export class BeforeResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget; blocker: Defender | null },
  { attacker: string; target: string; blocker: string | null }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id,
      blocker: this.data.blocker?.id ?? null
    };
  }
}

export class AfterResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget; blocker: Defender | null },
  { attacker: string; target: string; blocker: string | null }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id,
      blocker: this.data.blocker?.id ?? null
    };
  }
}

export const COMBAT_EVENTS = {
  BEFORE_DECLARE_ATTACK: 'combat.before-declare-attack',
  AFTER_DECLARE_ATTACK: 'combat.after-declare-attack',
  BEFORE_DECLARE_ATTACK_TARGET: 'combat.before-declare-attack-target',
  AFTER_DECLARE_ATTACK_TARGET: 'combat.after-declare-attack-target',
  BEFORE_DECLARE_BLOCKER: 'combat.before-declare-blocker',
  AFTER_DECLARE_BLOCKER: 'combat.after-declare-blocker',
  BEFORE_RESOLVE_COMBAT: 'combat.before-resolve-combat',
  AFTER_RESOLVE_COMBAT: 'combat.after-resolve-combat'
} as const;
export type CombatEventName = Values<typeof COMBAT_EVENTS>;

export type CombatEventMap = {
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK]: BeforeDeclareAttackEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK]: AfterDeclareAttackEvent;
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET]: BeforeDeclareAttackTargetEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET]: AfterDeclareAttackTargetEvent;
  [COMBAT_EVENTS.BEFORE_DECLARE_BLOCKER]: BeforeDeclareBlockerEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_BLOCKER]: AfterDeclareBlockerEvent;
  [COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT]: BeforeResolveCombatEvent;
  [COMBAT_EVENTS.AFTER_RESOLVE_COMBAT]: AfterResolveCombatEvent;
};

export class CombatPhase
  extends StateMachine<CombatStep, CombatStepTransition>
  implements GamePhaseController, Serializable<SerializedCombatPhase>
{
  attacker!: Attacker;
  target: AttackTarget | null = null;
  blocker: Defender | null = null;

  private isCancelled = false;

  constructor(private game: Game) {
    super(COMBAT_STEPS.DECLARE_ATTACKER);

    this.addTransitions([
      stateTransition(
        COMBAT_STEPS.DECLARE_ATTACKER,
        COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED,
        COMBAT_STEPS.DECLARE_TARGET
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_TARGET,
        COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED,
        COMBAT_STEPS.DECLARE_BLOCKER
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_BLOCKER,
        COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED,
        COMBAT_STEPS.BUILDING_CHAIN
      ),
      stateTransition(
        COMBAT_STEPS.BUILDING_CHAIN,
        COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED,
        COMBAT_STEPS.RESOLVING_COMBAT
      )
    ]);
  }

  get potentialBlockers(): Defender[] {
    if (!this.attacker || !this.target) {
      return [];
    }
    return this.target.player.minions.filter(
      minion => this.canBlock(minion) && this.attacker.canBeBlocked(minion)
    );
  }

  get potentialTargets(): AttackTarget[] {
    return this.attacker.potentialAttackTargets;
  }

  async declareAttacker(attacker: Attacker) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK,
      new BeforeDeclareAttackEvent({ attacker })
    );

    this.attacker = attacker;

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK,
      new AfterDeclareAttackEvent({ attacker })
    );

    await this.game.inputSystem.askForPlayerInput();
  }

  async declareAttackTarget(target: AttackTarget) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET,
      new BeforeDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    this.target = target;
    await this.attacker.exhaust();

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
      new AfterDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    await this.game.inputSystem.askForPlayerInput();
  }

  async declareBlocker(blocker: Defender | null) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_BLOCKER,
      new BeforeDeclareBlockerEvent({ blocker })
    );
    this.blocker = blocker;
    await this.blocker?.exhaust();

    this.dispatch(COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_BLOCKER,
      new AfterDeclareBlockerEvent({ blocker })
    );
    void this.game.effectChainSystem
      .createChain(this.attacker.player.opponent)
      .then(() => this.resolveCombat());
  }

  changeTarget(newTarget: AttackTarget) {
    if (!this.target) return;
    this.target = newTarget;
  }

  changeAttacker(newAttacker: Attacker) {
    if (!this.attacker) return;
    this.attacker = newAttacker;
  }

  changeBlocker(newBlocker: Defender | null) {
    if (!this.blocker) return;
    this.blocker = newBlocker;
  }

  private async resolveCombat() {
    assert(this.target, new CorruptedGamephaseContextError());

    this.dispatch(COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED);

    await this.game.emit(
      COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT,
      new BeforeResolveCombatEvent({
        attacker: this.attacker,
        target: this.target,
        blocker: this.blocker
      })
    );

    const isCancelled = this.isCancelled || !this.attacker.canDealCombatDamage;
    if (!isCancelled) {
      await this.performAttacks();
    }

    await this.end();
  }

  private async performAttacks() {
    const defender = this.blocker?.isAlive ? this.blocker : this.target;
    if (!defender) return;

    if (defender.isAlive && this.attacker.isAlive) {
      await this.attacker.dealDamage(defender, new CombatDamage(this.attacker));
      if (this.attacker.canBeCounterattackedBy(defender)) {
        await defender.dealDamage(this.attacker, new CombatDamage(defender));
      }
    }

    await this.game.emit(
      COMBAT_EVENTS.AFTER_RESOLVE_COMBAT,
      new AfterResolveCombatEvent({
        attacker: this.attacker,
        target: this.target!,
        blocker: this.blocker
      })
    );
  }

  private async end() {
    this.game.interaction.onInteractionEnd();
    // phase can be different if combat was aborted early, eg. Elusive
    if (this.game.gamePhaseSystem.getState() === GAME_PHASES.ATTACK) {
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.FINISH_ATTACK
      );
    }
    await this.game.inputSystem.askForPlayerInput();
  }

  async cancelAttack() {
    if (this.isCancelled) return;
    this.isCancelled = true;
    await this.end();
  }

  canBlock(blocker: Defender) {
    if (!this.attacker || !this.target) return false;

    return (
      this.attacker.canBeBlocked(blocker) &&
      blocker.canBlock(this.attacker) &&
      this.target.canBeDefendedBy(blocker)
    );
  }

  get step() {
    return this.getState();
  }

  async onEnter() {}

  async onExit() {}

  serialize(): SerializedCombatPhase {
    return {
      attacker: this.attacker.id,
      target: this.target?.id ?? null,
      blocker: this.blocker?.id ?? null,
      step: this.getState(),
      potentialBlockers: this.potentialBlockers.map(b => b.id),
      potentialTargets: this.potentialTargets.map(t => t.id)
    };
  }
}

export class WrongCombatStepError extends GameError {
  constructor() {
    super('Wrong combat step');
  }
}
