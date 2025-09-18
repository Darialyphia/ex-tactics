<script setup lang="ts">
import { ROUND_PHASES } from '@game/engine/src/game/systems/turn.system';
import {
  useActiveUnit,
  useGameClient,
  useGameState,
  useGameUi,
  useLatestSimulationResult,
  useMyPlayer
} from '../composables/useGameClient';

const state = useGameState();
const activeUnit = useActiveUnit();
const myPlayer = useMyPlayer();
const ui = useGameUi();
const client = useGameClient();
const simulation = useLatestSimulationResult();

const canConfirmAction = computed(() => {
  if (!activeUnit.value) return false;
  if (!ui.value.selectedUnitAction) return false;

  if (ui.value.selectedUnitAction.type === 'attack') {
    return !!activeUnit.value.attackIntent;
  } else if (ui.value.selectedUnitAction.type === 'ability') {
    return (
      ui.value.selectedUnitAction.ability.selectedTargets.length ===
      ui.value.selectedUnitAction.ability.neededTargets
    );
  }
  return false;
});

const onConfirmAction = () => {
  if (!activeUnit.value || !ui.value.selectedUnitAction) return;

  if (ui.value.selectedUnitAction.type === 'attack') {
    client.attack();
  } else if (ui.value.selectedUnitAction.type === 'ability') {
    client.useAbility();
  }
};
</script>
<template>
  <section v-if="state.phase === ROUND_PHASES.BATTLE" class="battle-ui">
    <p v-if="!activeUnit?.player.equals(myPlayer)">Opponent's turn</p>

    <template v-else-if="activeUnit">
      <div class="flex gap2">
        <div class="actions flex-col">
          <button
            class="action"
            :style="`--bg: url('/assets/icons/end-turn.png')`"
            @click="client.endTurn()"
          />
          <button
            v-if="activeUnit.moveIntent"
            class="action"
            :style="`--bg: url('/assets/icons/move.png')`"
            @click="client.move()"
          />
          <button
            v-if="ui.selectedUnitAction"
            :disabled="!canConfirmAction"
            class="action"
            :style="`--bg: url('/assets/icons/confirm.png')`"
            @click="onConfirmAction"
          />
        </div>
      </div>

      <div class="flex gap-2 items-end">
        <div class="portrait" :style="`--bg: url(${activeUnit.portrait})`" />

        <div>
          <p>{{ activeUnit.name }}</p>
          <p>HP: {{ activeUnit.hp }} / {{ activeUnit.maxHp }}</p>
          <p>MP: {{ activeUnit.mp }} / {{ activeUnit.maxMp }}</p>
          <p>AP: {{ activeUnit.ap }} / {{ activeUnit.maxAp }}</p>
        </div>

        <div v-if="ui.selectedUnitAction">
          <div v-if="ui.selectedUnitAction.type === 'ability'">
            <div class="text-3">{{ ui.selectedUnitAction.ability.name }}</div>
            <div>
              {{ ui.selectedUnitAction.ability.manaCost }} MP |
              {{ ui.selectedUnitAction.ability.cooldown }} cooldown
            </div>
            <p>{{ ui.selectedUnitAction.ability.description }}</p>
          </div>
          <div v-else-if="ui.selectedUnitAction.type === 'attack'">
            <p>Basic Attack</p>
            <p>Deal 100% PATK to a target.</p>
          </div>
        </div>

        <div v-if="activeUnit.attackIntent">
          Attack intent: {{ activeUnit.attackIntent }}
          <div v-if="simulation">
            Simulation result :
            <div v-for="(event, index) in simulation.events" :key="`${event.eventName}-${index}`">
              {{ event.eventName }}: {{ event.event }}
            </div>
          </div>
        </div>
        <div v-if="activeUnit.abilityIntent">
          Ability intent: {{ activeUnit.abilityIntent.name }}
          <div v-if="simulation">
            Simulation result :
            <div v-for="(event, index) in simulation.events" :key="`${event.eventName}-${index}`">
              {{ event.eventName }}: {{ event.event }}
            </div>
          </div>
        </div>

        <div class="actions">
          <template v-if="!ui.selectedUnitAction">
            <button
              v-for="action in activeUnit.actions"
              :key="action.id"
              class="action ability"
              :style="`--bg: url(${action.type === 'attack' ? '/assets/icons/attack.png' : action.ability.icon})`"
              :disabled="action.type === 'attack' ? !activeUnit.canAttack : !action.ability.canUse"
              @click="ui.selectedUnitAction = action"
            />
          </template>
          <button
            v-else
            class="action abiliy"
            :style="{ '--bg': 'url(/assets/icons/back.png)' }"
            @click="ui.clearUnitAction()"
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
  align-self: flex-end;
}

.actions {
  margin-left: auto;
  margin-right: var(--size-10);
  display: flex;
  gap: var(--size-4);

  :disabled {
    filter: grayscale(1) opacity(0.8);
    cursor: not-allowed;
  }
  @media (width <= 900px) {
    margin-right: var(--size-5);
    gap: var(--size-2);
  }
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

  &.ability {
    background: url('/assets/ui/ability-frame.png'), var(--bg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }

  &:hover {
    filter: brightness(1.2);
  }
  &.selected {
    outline: solid var(--border-size-2) var(--yellow-6);
  }
}
</style>
