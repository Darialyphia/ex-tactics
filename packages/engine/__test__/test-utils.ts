import { assert, isDefined } from '@game/shared';
import { Game, type GameOptions } from '../src/game/game';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../src/card/card.enums';
import { GAME_EVENTS } from '../src/game/game.events';
import type { Player, PlayerOptions } from '../src/player/player.entity';
import type { MinionBlueprint } from '../src/card/card-blueprint';
import { GAME_PHASES, type GamePhasesDict } from '../src/game/game.enums';
import type { HeroCard } from '../src/card/entities/hero.entity';
import { MinionCard } from '../src/card/entities/minion.entity';
import type { AnyCard } from '../src/card/entities/card.entity';

export const testGameBuilder = () => {
  const options: Partial<GameOptions> = {};

  return {
    withSeed(seed: string) {
      options.rngSeed = seed;
      return this;
    },
    withOverrides(overrides: GameOptions['overrides']) {
      options.overrides = overrides;
      return this;
    },
    withP1Deck(deck: {
      main: PlayerOptions['mainDeck']['cards'];
      destiny: PlayerOptions['destinyDeck']['cards'];
      hero: PlayerOptions['hero'];
    }) {
      // @ts-expect-error
      options.players ??= [];

      options.players![0] = {
        mainDeck: { cards: deck.main },
        destinyDeck: { cards: deck.destiny },
        hero: deck.hero,
        id: 'p1',
        name: 'player1'
      };
      return this;
    },
    withP2Deck(deck: {
      main: PlayerOptions['mainDeck']['cards'];
      destiny: PlayerOptions['destinyDeck']['cards'];
      hero: PlayerOptions['hero'];
    }) {
      // @ts-expect-error
      options.players ??= [];

      options.players![1] = {
        mainDeck: { cards: deck.main },
        destinyDeck: { cards: deck.destiny },
        hero: deck.hero,
        id: 'p2',
        name: 'player2'
      };
      return this;
    },
    async build(withSnapshots = false) {
      const { players, overrides } = options;
      assert(isDefined(players), 'players must be defined');
      assert(players.length === 2, 'players must have 2 entries');
      const game = new Game({
        id: 'test',
        overrides: overrides ?? {},
        rngSeed: options.rngSeed ?? 'test',
        players,
        enableSnapshots: withSnapshots
      });

      await game.initialize();

      const errors: Error[] = [];

      game.on(GAME_EVENTS.ERROR, event => {
        errors.push(event.data.error);
      });

      return {
        game,
        errors,
        player1: game.playerSystem.player1,
        player2: game.playerSystem.player2,
        testHelpers: {
          generateAndPlayCard: async <T extends AnyCard>(
            player: Player,
            blueprintId: string,
            manaCostIndices: number[],
            options: T extends MinionCard
              ? {
                  zone: 'attack' | 'defense';
                  slot: number;
                }
              : undefined
          ) => {
            const card = await player.generateCard<T>(blueprintId);
            const cardsForManaCost = manaCostIndices.map(i =>
              player.cardManager.getCardInHandAt(i)
            );

            cardsForManaCost.forEach(c => {
              c.sendToDestinyZone();
            });

            if (card instanceof MinionCard) {
              await card.playAt({ player, zone: options!.zone, slot: options!.slot });
            } else {
              await card.play();
            }

            return card;
          },
          async endTurn(player: Player) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise<void>(async resolve => {
              await game.gamePhaseSystem.declareEndPhase();
              game.once(GAME_EVENTS.PLAYER_START_TURN, () => resolve());

              game.effectChainSystem.pass(player.opponent);
            });
          },
          waitUntilDestinyPhase() {
            return new Promise<void>(resolve => {
              const stop = game.once(GAME_EVENTS.AFTER_CHANGE_PHASE, event => {
                if (event.data.to.state === GAME_PHASES.DESTINY) {
                  stop();
                  resolve();
                }
              });
            });
          },
          async skipDestiny() {
            await game.gamePhaseSystem
              .getContext<GamePhasesDict['DESTINY']>()
              .ctx.skipDestinyPhase();
          },
          async playDestinyCard(blueprintId: string) {
            const player = game.gamePhaseSystem.currentPlayer;
            const card = player.cardManager.destinyDeck.cards.find(
              c => c.blueprintId === blueprintId
            )!;

            await game.gamePhaseSystem
              .getContext<GamePhasesDict['DESTINY']>()
              .ctx.playDestinyCard(card);
          },
          async declareAttack(
            attacker: MinionCard | HeroCard,
            target: MinionCard | HeroCard
          ) {
            await game.gamePhaseSystem.startCombat();
            const { ctx } = game.gamePhaseSystem.getContext<GamePhasesDict['ATTACK']>();

            await ctx.declareAttacker(attacker);
            await ctx.declareAttackTarget(target);
          },
          async skipBlock() {
            const { ctx } = game.gamePhaseSystem.getContext<GamePhasesDict['ATTACK']>();
            await ctx.declareBlocker(null);
          },
          async declareBlocker(blocker: MinionCard | HeroCard) {
            const { ctx } = game.gamePhaseSystem.getContext<GamePhasesDict['ATTACK']>();
            await ctx.declareBlocker(blocker);
          }
        }
      };
    }
  };
};

export const makeTestMinionCardBlueprint = ({
  id,
  name = 'Test Minion',
  description = 'Test Minion description',
  unique = false,
  manaCost = 0,
  affinity = AFFINITIES.NORMAL,
  atk = 1,
  maxHp = 1,
  onInit = async () => {},
  onPlay = async () => {}
}: { id: string } & Partial<
  Pick<
    MinionBlueprint,
    | 'name'
    | 'description'
    | 'cardIconId'
    | 'collectable'
    | 'unique'
    | 'manaCost'
    | 'affinity'
    | 'atk'
    | 'maxHp'
    | 'onInit'
    | 'onPlay'
  >
>): MinionBlueprint => ({
  id,
  name,
  description,
  cardIconId: 'test-minion',
  collectable: true,
  unique,
  manaCost,
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  tags: [],
  affinity,
  atk,
  maxHp,
  abilities: [],
  canPlay: () => true,
  onInit,
  onPlay
});
