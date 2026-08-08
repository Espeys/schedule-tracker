<template>
  <div class="flex w-full flex-col items-center gap-16">
    <div class="flex flex-col gap-4">
      <h1 class="text-4xl font-bold text-secondary">Set up cycle length</h1>
      <p class="max-w-xl leading-8">
        <span class="font-semibold">Specify how many days are included in a single cycle.</span>
        <span>This will be used as the basis for generating and managing your schedule.</span>
      </p>
    </div>

    <AppInputNumber
      :model-value="modelValue"
      :min="1"
      caption="day/s per cycle"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import AppInputNumber from '@/components/generic/AppInputNumber.vue'

defineProps<{
  modelValue: number | ''
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | '']
}>()
</script>
