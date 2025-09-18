import type { UnitBlueprint } from '../unit-blueprint';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { TARGETING_TYPES } from '../../aoe/aoe.constants';
import { CrossAOEShape } from '../../aoe/cross.aoe-shape';
import { ABILITY_TARGET_KINDS } from '../ability/ability-blueprint';
import { MagicalDamage } from '../damage';

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
      pAtk: 10,
      pDef: 5,
      mAtk: 15,
      mDef: 5,
      initiative: 8,
      movementRange: 4
    },
    sprite: {
      id: 'placeholder2',
      defaultParts: {}
    },
    defaultAbilities: [
      {
        id: 'magic-bolt',
        name: 'Magic Bolt',
        description: 'Deals 10 + 80% MATK magic damage to a single target.',
        dynamicDescription(game, ability) {
          return `Deals ${10 + 0.8 * ability.unit.mAtk}% MATK magic damage to a single target.`;
        },
        iconId: 'magic-bolt',
        cooldown: 1,
        manaCost: 1,
        shouldAlterOrientation: true,
        getImpactAOEShape(game, ability) {
          return {
            shape: new PointAOEShape(TARGETING_TYPES.NON_ALLY),
            origin: 0
          };
        },
        getTargetingShapes(game, ability) {
          return [
            {
              shape: new CrossAOEShape(TARGETING_TYPES.NON_ALLY, {
                horizontalSize: 3,
                verticalSize: 1,
                includeCenter: false
              }),
              origin: null
            }
          ];
        },
        onUse(game, ability, targets) {
          const [target] = ability.getUnitOrObstacleInAoe(targets);
          ability.unit.combat.dealDamage(
            [target],
            new MagicalDamage(game, {
              baseAmount: 10,
              mAtkRatio: 0.8,
              source: ability.unit
            })
          );
        }
      }
    ],
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
  }
};
