<template>
  <button
    type="button"
    class="btn rounded-sm px-8 text-lg font-medium"
    :class="[variantClass, { 'w-full': fullWidth }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    fullWidth?: boolean
    variant?: 'primary' | 'secondary' | 'text'
  }>(),
  {
    disabled: false,
    fullWidth: false,
    variant: 'primary',
  },
)

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'btn-outline'
    case 'text':
      return 'btn-ghost text-base-content shadow-none'
    default:
      return 'btn-primary !text-[var(--color-on-primary)] shadow-md'
  }
})
</script>
