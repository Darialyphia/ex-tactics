<script setup lang="ts">
import { useLights } from '@/shared/composables/useLightsManager';
import { defineProps } from 'vue';

const { id } = defineProps<{
  id: string;
}>();

const lights = useLights();
</script>

<template>
  <container ref="container" />
</template>
