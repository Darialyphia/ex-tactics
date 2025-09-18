import { TARGETING_TYPES } from '../../aoe/aoe.constants';
import { ConeAOEShape } from '../../aoe/cone.aoe-shape';
import { CrossAOEShape } from '../../aoe/cross.aoe-shape';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import type { AbilityBlueprint } from '../ability/ability-blueprint';
import type { Ability } from '../ability/ability.entity';
import { MagicalDamage } from '../damage';
import type { UnitBlueprint } from '../unit-blueprint';

const magicBolt: AbilityBlueprint<{
  baseDamage: number;
  mAtkRatio: number;
  range: number;
}> = {
  id: 'magic-bolt',
  meta: {
    baseDamage: 10,
    mAtkRatio: 0.8,
    range: 3
  },
  name: 'Magic Bolt',
  description: 'Deals 10 + 80% MATK magic damage to a single target.',
  dynamicDescription(game, ability) {
    return `Deals ${ability.meta.baseDamage + ability.meta.mAtkRatio * ability.unit.mAtk}% MATK magic damage to a single target.`;
  },
  iconId: 'magic-bolt',
  cooldown: 1,
  manaCost: 1,
  shouldAlterOrientation: true,
  getImpactAOEShape(game, ability) {
    return {
      shape: new PointAOEShape(TARGETING_TYPES.NON_ALLY),
      points: [{ type: 'target', index: 0 }]
    };
  },
  getTargetingShapes(game, ability) {
    return [
      {
        shape: new CrossAOEShape(TARGETING_TYPES.NON_ALLY, {
          horizontalSize: ability.meta.range,
          verticalSize: 1,
          includeCenter: false
        }),
        points: [{ type: 'self' }]
      }
    ];
  },
  onUse(game, ability, targets) {
    const [target] = ability.getUnitOrObstacleInAoe(targets);
    ability.unit.combat.dealDamage(
      [target],
      new MagicalDamage(game, {
        baseAmount: ability.meta.baseDamage,
        mAtkRatio: ability.meta.mAtkRatio,
        source: ability.unit
      })
    );
  }
};

const coneOfFlames: AbilityBlueprint<{
  baseDamage: number;
  mAtkRatio: number;
  range: number;
}> = {
  id: 'cone-of-flames',
  meta: {
    baseDamage: 5,
    mAtkRatio: 0.5,
    range: 3
  },
  name: 'Cone of Flames',
  description: 'Deals 5 + 50% MATK magic damage in a cone area.',
  dynamicDescription(game, ability) {
    return `Deals ${ability.meta.baseDamage + ability.meta.mAtkRatio * ability.unit.mAtk}% MATK magic damage in a cone area.`;
  },
  iconId: 'cone-of-flames',
  cooldown: 1,
  manaCost: 2,
  shouldAlterOrientation: true,
  getImpactAOEShape(game, ability) {
    return {
      shape: new ConeAOEShape(TARGETING_TYPES.ANY, ability.meta.range, 1),
      points: [{ type: 'self' }, { type: 'target', index: 0 }]
    };
  },
  getTargetingShapes(game, ability) {
    return [
      {
        shape: new CrossAOEShape(TARGETING_TYPES.ANY, {
          horizontalSize: 1,
          verticalSize: 1,
          includeCenter: false
        }),
        points: [{ type: 'self' }]
      }
    ];
  },
  onUse(game, ability, targets) {
    ability.unit.combat.dealDamage(
      ability.getUnitOrObstacleInAoe(targets),
      new MagicalDamage(game, {
        baseAmount: ability.meta.baseDamage,
        mAtkRatio: ability.meta.mAtkRatio,
        source: ability.unit
      })
    );
  }
};

export const testMage: UnitBlueprint = {
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
    movementRange: 3
  },
  sprite: {
    id: 'placeholder2',
    defaultParts: {
      weapon: 'default'
    }
  },
  defaultAbilities: [magicBolt, coneOfFlames],
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
};
