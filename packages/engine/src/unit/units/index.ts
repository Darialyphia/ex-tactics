import type { UnitBlueprint } from '../unit-blueprint';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { TARGETING_TYPES } from '../../aoe/aoe.constants';
import { CrossAOEShape } from '../../aoe/cross.aoe-shape';

export const UNITS_DICTIONARY: Record<string, UnitBlueprint> = {
  testHero: {
    id: 'testHero',
    name: 'Test Hero',
    isHero: true,
    icons: {
      portrait: 'placeholder'
    },
    baseStats: {
      maxHp: 100,
      pAtk: 20,
      pDef: 5,
      mAtk: 10,
      mDef: 5,
      initiative: 8,
      movementRange: 4
    },
    sprite: {
      id: 'placeholder',
      defaultParts: {}
    },
    defaultAbilities: [],
    defaultPassives: [],
    talentTree: [],
    getAttackAOEShape(game, unit) {
      return new PointAOEShape(TARGETING_TYPES.NON_ALLY);
    },
    getAttackTargetingShape(game, unit) {
      return new CrossAOEShape(TARGETING_TYPES.NON_ALLY, {
        horizontalSize: 1,
        verticalSize: 1,
        includeCenter: false
      });
    }
  },
  testHero2: {
    id: 'testHero2',
    name: 'Test Hero 2',
    isHero: true,
    icons: {
      portrait: 'placeholder2'
    },
    baseStats: {
      maxHp: 100,
      pAtk: 20,
      pDef: 5,
      mAtk: 10,
      mDef: 5,
      initiative: 8,
      movementRange: 4
    },
    sprite: {
      id: 'placeholder2',
      defaultParts: {}
    },
    defaultAbilities: [],
    defaultPassives: [],
    talentTree: [],
    getAttackAOEShape(game, unit) {
      return new PointAOEShape(TARGETING_TYPES.NON_ALLY);
    },
    getAttackTargetingShape(game, unit) {
      return new CrossAOEShape(TARGETING_TYPES.NON_ALLY, {
        horizontalSize: 2,
        verticalSize: 1,
        includeCenter: false
      });
    }
  }
};
