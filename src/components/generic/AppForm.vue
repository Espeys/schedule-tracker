<template>
  <div @keydown.enter.prevent="submit">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  submit: []
}>()

const submit = () => {
  if (!props.disabled) {
    emit('submit')
  }
}
</script>
