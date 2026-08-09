<template>
  <AppInput
    ref="inputRef"
    :model-value="displayValue"
    inputmode="none"
    :placeholder="placeholder"
    :disabled="disabled"
    closable
    readonly
    @clear="handleClear"
  >
    <template #prepend>
      <CalendarDaysIcon class="size-5" aria-hidden="true" />
    </template>
  </AppInput>
</template>

<script setup lang="ts">
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import AirDatepicker from 'air-datepicker'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import AppInput from '@/components/generic/AppInput.vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    fitCalendar?: boolean
    minDate?: Date | false
    modelValue: Date | null
    placeholder?: string
  }>(),
  {
    disabled: false,
    fitCalendar: false,
    minDate: false,
    placeholder: 'Pick a date',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

const formatDateValue = (value: Date | null) => {
  if (!value) {
    return ''
  }

  return value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const inputRef = ref<{ inputElement: HTMLInputElement | null } | null>(null)
const displayValue = ref(formatDateValue(props.modelValue))

let datepicker: AirDatepicker<HTMLInputElement> | null = null

const englishLocale = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthsShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'MMMM d, yyyy',
  timeFormat: 'hh:mm aa',
  firstDay: 1 as const,
}

const syncSelectedDate = async (value: Date | null) => {
  displayValue.value = formatDateValue(value)

  if (!datepicker) {
    return
  }

  if (!value) {
    await datepicker.clear({ silent: true })
    return
  }

  await datepicker.selectDate(value, { silent: true })
}

const syncCalendarWidth = () => {
  if (!props.fitCalendar || !datepicker) {
    return
  }

  const inputElement = inputRef.value?.inputElement

  if (!inputElement) {
    return
  }

  const inputWidth = `${Math.round(inputElement.getBoundingClientRect().width)}px`

  datepicker.$datepicker.style.width = inputWidth
  datepicker.$datepicker.style.setProperty('--adp-width', inputWidth)
}

onMounted(() => {
  const inputElement = inputRef.value?.inputElement

  if (!inputElement) {
    return
  }

  datepicker = new AirDatepicker(inputElement, {
    locale: englishLocale,
    minDate: props.minDate,
    dateFormat: 'MMMM d, yyyy',
    autoClose: false,
    selectedDates: props.modelValue ? [props.modelValue] : false,
    buttons: ['today', 'clear'],
    onSelect: ({ date }) => {
      const selectedDate = Array.isArray(date) ? (date[0] ?? null) : (date ?? null)

      displayValue.value = formatDateValue(selectedDate)
      emit('update:modelValue', selectedDate)
    },
    onShow: () => {
      syncCalendarWidth()
    },
  })

  syncCalendarWidth()
  window.addEventListener('resize', syncCalendarWidth)
})

const handleClear = async () => {
  displayValue.value = ''
  emit('update:modelValue', null)
  await datepicker?.clear({ silent: true })
}

watch(
  () => props.modelValue,
  (value) => {
    void syncSelectedDate(value)
  },
)

watch(
  () => props.minDate,
  (value) => {
    datepicker?.update({ minDate: value }, { silent: true })
  },
)

watch(
  () => props.fitCalendar,
  (value) => {
    if (!datepicker) {
      return
    }

    if (value) {
      syncCalendarWidth()
      return
    }

    datepicker.$datepicker.style.removeProperty('width')
    datepicker.$datepicker.style.removeProperty('--adp-width')
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncCalendarWidth)
  datepicker?.destroy()
  datepicker = null
})
</script>
