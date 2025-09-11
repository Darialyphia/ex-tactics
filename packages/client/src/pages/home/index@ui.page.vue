<script setup lang="ts">
import { useGameClientStore } from '@/battle/composables/useGameClient';
import { GAME_TYPES } from '@game/engine/src/client/client';
import { defaultConfig } from '@game/engine/src/config';
import { Game } from '@game/engine/src/game/game';

definePage({
  name: 'Home',
  path: '/'
});

const game = new Game({
  id: 'local-game',
  mapId: 'testMap',
  rngSeed: 'local-game-seed',
  config: defaultConfig,
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      heroes: [
        {
          blueprintId: 'testHero',
          selectedTalents: []
        }
      ]
    },
    {
      id: 'p1',
      name: 'Player 1',
      heroes: [
        {
          blueprintId: 'testHero',
          selectedTalents: []
        }
      ]
    },
    {
      id: 'p2',
      name: 'Player 2',
      heroes: [
        {
          blueprintId: 'testHero',
          selectedTalents: []
        }
      ]
    }
  ]
});
game.initialize();

const clientStore = useGameClientStore();
clientStore.init(
  {
    gameType: GAME_TYPES.LOCAL,
    playerId: 'p1',
    networkAdapter: {
      dispatch: input => {
        return game.dispatch(input);
      },
      subscribe(cb) {
        game.subscribeOmniscient(cb);
      },
      sync(lastSnapshotId) {
        console.log('TODO: sync ', lastSnapshotId);
        return Promise.resolve([]);
      }
    }
  },
  game.snapshotSystem.getLatestOmniscientSnapshot()
);
</script>

<template>
  <div />
</template>

<style scoped lang="postcss"></style>
