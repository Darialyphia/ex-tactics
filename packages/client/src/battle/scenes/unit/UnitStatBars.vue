<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import HpBar from '../HpBar.vue';
import MpBar from '../MpBar.vue';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();
</script>

<template>
  <container :y="-60" :x="-12">
    <UiAnimatedSprite asset-id="unit-stat-bars" :anchor="0" />
    <HpBar :value="unit.hp" :max="unit.maxHp" :x="2" :y="2" />
    <MpBar :value="unit.mp" :max="unit.maxMp" :x="2" :y="5" />
  </container>
</template>
