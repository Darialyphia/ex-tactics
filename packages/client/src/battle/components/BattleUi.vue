<script setup lang="ts">
import { ROUND_PHASES } from '@game/engine/src/game/systems/turn.system';
import {
  useActiveUnit,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';

const state = useGameState();
const activeUnit = useActiveUnit();
const myPlayer = useMyPlayer();
const ui = useGameUi();
const client = useGameClient();
</script>
<template>
  <section v-if="state.phase === ROUND_PHASES.BATTLE" class="battle-ui">
    <p v-if="!activeUnit?.player.equals(myPlayer)">Opponent's turn</p>

    <template v-else-if="activeUnit">
      <div class="flex gap2">
        <div class="ml-auto mr-10 flex flex-col gap-4">
          <button
            v-if="activeUnit.moveIntent"
            class="action"
            :style="`--bg: url('/assets/icons/move.png')`"
            @click="client.move()"
          />
          <button
            v-if="activeUnit.attackIntent"
            class="action"
            :style="`--bg: url('/assets/icons/confirm.png')`"
            @click="client.attack()"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <div class="portrait" :style="`--bg: url(${activeUnit.portrait})`" />

        <div>
          <p>{{ activeUnit.name }}</p>
          <p>HP: {{ activeUnit.hp }} / {{ activeUnit.maxHp }}</p>
          <p>MP: {{ activeUnit.mp }} / {{ activeUnit.maxMp }}</p>
          <p>AP: {{ activeUnit.ap }} / {{ activeUnit.maxAp }}</p>
        </div>

        <div class="ml-auto mr-10 flex gap-2">
          <template v-if="!ui.selectedUnitAction">
            <button
              v-for="action in activeUnit.actions"
              :key="action.id"
              class="action"
              :style="`--bg: url(${action.type === 'attack' ? '/assets/icons/attack.png' : action.ability.icon})`"
              @click="ui.selectedUnitAction = action"
            />
          </template>
          <button
            v-else
            class="action"
            :style="{ '--bg': 'url(/assets/icons/back.png)' }"
            @click="ui.clearUnitaction()"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="postcss">
.battle-ui {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: var(--size-3);
  color: white;
  width: 100%;
}

.portrait {
  position: relative;
  width: calc(48px * var(--pixel-art-scale));
  aspect-ratio: 1;
  background: var(--bg) no-repeat center/cover;
  cursor: pointer;
}

.action {
  position: relative;
  width: calc(32px * var(--pixel-art-scale));
  align-self: center;
  aspect-ratio: 1;
  border-radius: var(--radius-2);
  background: var(--bg) no-repeat center/cover;
  box-shadow: 0 0 0 2px var(--color-bg);
  cursor: pointer;
  border-radius: var(--radius-round);

  &:hover {
    filter: brightness(1.2);
  }
  &.selected {
    outline: solid var(--border-size-2) var(--yellow-6);
  }
}
</style>
