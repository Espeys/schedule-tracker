<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="select border-[#707070] bg-base-100 text-xs outline-none cursor-pointer"
    v-bind="$attrs"
    @change="handleChange"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  disabled?: boolean
  modelValue: string
  options: Array<{
    label: string
    value: string
  }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
