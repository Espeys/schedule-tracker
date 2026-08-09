<template>
  <div class="relative w-full">
    <span
      v-if="hasPrepend"
      class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-base-content/45"
    >
      <slot name="prepend" />
    </span>

    <input
      ref="inputElement"
      :value="modelValue ?? undefined"
      :type="type"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="app-input input w-full focus:outline-none"
      :class="{
        'pl-12': hasPrepend,
        'pr-12': closable && hasValue,
      }"
      v-bind="$attrs"
      @input="handleInput"
    />

    <button
      v-if="closable && hasValue"
      type="button"
      class="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-base-content/45 transition hover:text-base-content"
      :disabled="disabled"
      @click="handleClear"
    >
      <XMarkIcon class="size-5" aria-hidden="true" />
      <span class="sr-only">Clear input</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, ref, useSlots } from 'vue'

defineOptions({
  inheritAttrs: false,
})

type InputMode = 'decimal' | 'email' | 'none' | 'numeric' | 'search' | 'tel' | 'text' | 'url'

const props = withDefaults(
  defineProps<{
    closable?: boolean
    disabled?: boolean
    inputmode?: InputMode
    modelValue?: number | string
    placeholder?: string
    readonly?: boolean
    type?: HTMLInputElement['type']
  }>(),
  {
    closable: false,
    disabled: false,
    inputmode: undefined,
    modelValue: undefined,
    placeholder: '',
    readonly: false,
    type: 'text',
  },
)

const emit = defineEmits<{
  clear: []
  'update:modelValue': [value: string]
}>()

const inputElement = ref<HTMLInputElement | null>(null)
const slots = useSlots()

const hasPrepend = computed(() => Boolean(slots.prepend))
const hasValue = computed(() => String(props.modelValue ?? '').length > 0)

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const handleClear = () => {
  if (props.disabled) {
    return
  }

  if (inputElement.value) {
    inputElement.value.value = ''
  }

  emit('update:modelValue', '')
  emit('clear')
}

defineExpose({
  inputElement,
})
</script>
