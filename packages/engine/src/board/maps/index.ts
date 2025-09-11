import { keyBy } from 'lodash-es';
import type { MapBlueprint } from '../map-blueprint';
import { testMap } from './test-map';

export const MAP_DICTIONARY: Record<string, MapBlueprint> = keyBy([testMap], 'id');
