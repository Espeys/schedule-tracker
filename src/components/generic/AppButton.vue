<template>
  <button
    :type="type"
    class="btn text-xs font-semibold outline-none"
    :class="[sizeClass, variantClass, { 'w-full': fullWidth }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md'
  variant?: 'icon' | 'primary' | 'secondary' | 'text'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  fullWidth: false,
  size: 'md',
  variant: 'primary',
  type: 'button',
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'btn-sm rounded-sm'
    default:
      return 'rounded-sm'
  }
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'icon':
      return 'btn-ghost min-w-0 px-3 text-base-content shadow-none'
    case 'secondary':
      return 'btn-outline border-[#707070]'
    case 'text':
      return 'btn-ghost text-base-content shadow-none'
    default:
      return 'btn-primary !text-[var(--color-on-primary)] shadow-md'
  }
})
</script>
