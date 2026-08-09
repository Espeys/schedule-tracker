<template>
  <label class="flex flex-col items-center gap-2">
    <input
      :value="modelValue"
      :style="{ width: inputWidth }"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      class="input input-ghost block min-w-24 appearance-auto! border-0 border-b border-base-content/35 bg-transparent px-0 pb-1 pr-2 text-center text-5xl leading-none font-bold text-base-content focus:border-primary focus:outline-none"
      @input="handleInput"
    />

    <span v-if="caption" class="text-base text-base-content">
      {{ caption }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    caption?: string
    max?: number
    min?: number
    modelValue: number | ''
    step?: number
  }>(),
  {
    caption: '',
    max: undefined,
    min: undefined,
    step: 1,
  },
)

const inputWidth = computed(() => {
  const digits = String(props.modelValue).length
  return `calc(${Math.max(digits, 1)}ch + 1.1rem)`
})

const emit = defineEmits<{
  'update:modelValue': [value: number | '']
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.value === '') {
    emit('update:modelValue', '')
    return
  }

  emit('update:modelValue', target.valueAsNumber)
}
</script>
