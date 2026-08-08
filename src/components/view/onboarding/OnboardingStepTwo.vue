<template>
  <div class="flex w-full flex-col items-center gap-12">
    <div class="flex flex-col gap-4">
      <h1 class="text-4xl font-bold text-secondary">Select cycle start date</h1>
      <p class="max-w-xl leading-8">
        <span class="font-semibold">Choose the date when your first cycle will begin.</span>
        <span>This date will be used as the starting point for your cycle schedule.</span>
      </p>
    </div>

    <div class="w-full max-w-xs">
      <AppDatePicker
        :model-value="modelValue"
        placeholder="Pick a date"
        :min-date="minDate"
        fit-calendar
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppDatePicker from '@/components/generic/AppDatePicker.vue'

defineProps<{
  minDate: Date
  modelValue: Date | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()
</script>
