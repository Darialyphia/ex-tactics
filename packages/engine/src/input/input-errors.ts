import type { Point } from '@game/shared';
import { GameError } from '../game/game-error';

export class InputError extends GameError {
  constructor(message: string) {
    super(`Input error: ${message}`);
  }
}

export class NotActivePlayerError extends InputError {
  constructor() {
    super('You are not the active player.');
  }
}

export class TooManyReplacesError extends InputError {
  constructor() {
    super('You cannot replace any more cards this turn.');
  }
}

export class InvalidCardIndexError extends InputError {
  constructor() {
    super('Invalid card index');
  }
}

export class WrongGamePhaseError extends InputError {
  constructor() {
    super('You cannot do this action in the current game phase.');
  }
}

export class MissingPayloadError extends InputError {
  constructor() {
    super('Input payload is required');
  }
}

export class WrongRoundPhaseError extends InputError {
  constructor() {
    super('You cannot do this action in the current round phase.');
  }
}

export class UnknownPlayerError extends InputError {
  constructor(playerId: string) {
    super(`Unknown player id: ${playerId}`);
  }
}

export class UnknownUnitError extends InputError {
  constructor(unitId: string) {
    super(`Unknown unit id: ${unitId}`);
  }
}

export class UnknownCardError extends Error {
  constructor(cardId: string) {
    super(`Unknown card id: ${cardId}`);
  }
}

export class UnknownAbilityError extends Error {
  constructor(cardId: string, abilityId: string) {
    super(`Unknown ability id: ${abilityId} on card id: ${cardId}`);
  }
}

export class UnknownTalentError extends InputError {
  constructor(talentId: string) {
    super(`Unknown talent id: ${talentId}`);
  }
}

export class UnitNotOwnedError extends InputError {
  constructor() {
    super('You do not own this unit.');
  }
}

export class IllegalTalentUnlockError extends InputError {
  constructor() {
    super('You cannot unlock this talent');
  }
}

export class IllegalAttackTargetError extends InputError {
  constructor() {
    super(`Cannot attack at position this target`);
  }
}

export class IllegalMovementError extends InputError {
  constructor(point: Point) {
    super(`Cannot move at position ${point.x}:${point.y}`);
  }
}

export class TooManyTargetsError extends InputError {
  constructor() {
    super('You cannot add more targets');
  }
}

export class IllegalTargetError extends InputError {
  constructor() {
    super('Illegal target');
  }
}

export class InvalidDeploymentError extends InputError {
  constructor() {
    super('Invalid deployment');
  }
}

export class IllegalAbilityError extends InputError {
  constructor() {
    super('Ability cannot be used');
  }
}

export class UnknownArtifactError extends InputError {
  constructor(artifactId: string) {
    super(`Unknown artifact id: ${artifactId}`);
  }
}

export class TooManyResourceActionError extends InputError {
  constructor() {
    super('Player already performed their resource action.');
  }
}

export class IllegalAttackerError extends InputError {
  constructor() {
    super('Cannot attack with this unit');
  }
}

export class IllegalBlockerError extends InputError {
  constructor() {
    super('Cannot block with this unit');
  }
}

export class IllegalBlockError extends InputError {
  constructor() {
    super('Cannot block this attack');
  }
}

export class IllegalCombatStepError extends InputError {
  constructor() {
    super('Wrong combat step');
  }
}

export class NoOngoingEffectChainsError extends InputError {
  constructor() {
    super('No ongoing effect chains');
  }
}
