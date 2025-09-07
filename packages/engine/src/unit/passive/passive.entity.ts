import type { EmptyObject, Serializable } from '@game/shared';
import { Entity } from '../../entity';
import type { Unit } from '../unit.entity';
import type { PassiveBlueprint } from './passive-blueprint';
import type { Game } from '../../game/game';

export type SerializedPassive = {
  type: 'passive';
  id: string;
  iconId: string;
  description: string;
  dynamicDescription: string;
};

export class Passive
  extends Entity<EmptyObject>
  implements Serializable<SerializedPassive>
{
  constructor(
    private game: Game,
    private unit: Unit,
    private blueprint: PassiveBlueprint
  ) {
    super(`passive-${unit.id}-${blueprint.id}`, {});
  }

  serialize() {
    return {
      type: 'passive' as const,
      id: this.id,
      iconId: this.blueprint.iconId,
      description: this.blueprint.description,
      dynamicDescription: this.blueprint.dynamicDescription(this.game, this)
    };
  }
}
