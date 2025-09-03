import { KEYWORDS } from '../../card/card-keywords';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OnEnterModifierMixin, type OnEnterHandler } from '../mixins/on-enter.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnEnterModifier<T extends MinionCard | ArtifactCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { handler: OnEnterHandler<T>; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      mixins: [
        new OnEnterModifierMixin<T>(game, options.handler),
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER),
        ...(options.mixins ?? [])
      ]
    });
  }
}
