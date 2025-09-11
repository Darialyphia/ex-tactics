import { keyBy } from 'lodash-es';
import type { ObstacleBlueprint } from '../obstacle-blueprint';
import { shrine } from './shrine';

export const OBSTACLE_DICTIONARY: Record<string, ObstacleBlueprint> = keyBy(
  [shrine],
  'id'
);
