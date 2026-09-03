<template>
  <div class="flex h-screen max-h-screen overflow-hidden bg-base-100">
    <TheSidebar v-if="isSidebarVisible" />

    <div class="flex min-w-0 flex-1 flex-col">
      <TheHeader @toggle-sidebar="isSidebarVisible = !isSidebarVisible" />

      <main class="min-h-0 flex-1 overflow-hidden px-8 py-8">
        <AppCalendar
          :events="calendarEvents"
          :cycle-start-date="cycleStartDateKey"
          :cycle-length="cycleLength"
          :starting-cycle-number="1"
          :cycle-pause-date-keys="cyclePauseDateKeys"
          :whole-day-events="wholeDayEvents"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventInput } from '@fullcalendar/vue3'
import { computed, ref } from 'vue'

import AppCalendar from '@/components/generic/AppCalendar.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import { useOnboarding } from '@/composables/useOnboarding'
import { buildDateKey, cycleScheduleTemplate, getCycleOffset, startOfDay } from '@/helpers/cycle.helper'
import {
  cyclePauseDateKeys,
  wholeDayEvents,
} from '@/services/event-management'

const { onboardingData, storedCycleStartDate } = useOnboarding()

const isSidebarVisible = ref(true)

/*
|--------------------------------------------------------------------------
| Date helpers
|--------------------------------------------------------------------------
*/

const withTime = (date: Date, time: string) => {
  const [rawHours = '0', rawMinutes = '0'] = time.split(':')

  const hours = Number.parseInt(rawHours, 10)

  const minutes = Number.parseInt(rawMinutes, 10)

  const nextDate = new Date(date)

  nextDate.setHours(hours, minutes, 0, 0)

  return nextDate
}

/*
|--------------------------------------------------------------------------
| Cycle configuration
|--------------------------------------------------------------------------
*/

const cycleLength = computed(() => {
  return onboardingData.value?.cycleLength ?? cycleScheduleTemplate.length
})

/*
 * AppCalendar expects YYYY-MM-DD.
 *
 * Example:
 *
 * Date(2026-08-11)
 *
 * becomes:
 *
 * "2026-08-11"
 */
const cycleStartDateKey = computed(() => {
  const cycleStartDate = storedCycleStartDate.value

  if (!cycleStartDate) {
    return undefined
  }

  return buildDateKey(startOfDay(cycleStartDate))
})

/*
|--------------------------------------------------------------------------
| Schedule template
|--------------------------------------------------------------------------
*/

const cycleTemplate = computed(() => {
  return Array.from(
    {
      length: cycleLength.value,
    },
    (_, index) => ({
      dayNumber: index + 1,

      entries:
        cycleScheduleTemplate[index % cycleScheduleTemplate.length]?.entries ??
        cycleScheduleTemplate[0]?.entries ??
        [],
    }),
  )
})

/*
|--------------------------------------------------------------------------
| Calendar schedule events
|--------------------------------------------------------------------------
|
| This is now responsible ONLY for generating schedule events.
|
| It no longer needs to generate:
|
| cycleDayLabels
| cycleStartLabels
|
| AppCalendar calculates those itself from:
|
| cycleStartDateKey
| cycleLength
|
*/

const calendarEvents = computed<EventInput[]>(() => {
  const cycleStartDate = storedCycleStartDate.value

  if (!cycleStartDate || cycleTemplate.value.length === 0) {
    return []
  }

  const startDate = startOfDay(cycleStartDate)

  /*
   * Generate enough schedule data
   * for future calendar navigation.
   */
  const rangeEnd = new Date(startDate)

  rangeEnd.setDate(rangeEnd.getDate() + 540)

  const events: EventInput[] = []

  for (let offset = 0; ; offset += 1) {
    const currentDate = new Date(startDate)

    currentDate.setDate(startDate.getDate() + offset)

    if (currentDate > rangeEnd) {
      break
    }

    const cycleOffset = getCycleOffset(startDate, currentDate, cyclePauseDateKeys)

    if (cycleOffset === null) {
      continue
    }

    const templateDay = cycleTemplate.value[cycleOffset % cycleTemplate.value.length]

    if (!templateDay) {
      continue
    }

    templateDay.entries.forEach((entry, entryIndex) => {
      events.push({
        id: `${buildDateKey(currentDate)}-${entryIndex}`,

        title: entry.title,

        start: withTime(currentDate, entry.startTime),

        end: withTime(currentDate, entry.endTime),

        display: 'block',

        extendedProps: {
          backgroundColor: entry.backgroundColor,

          borderColor: entry.borderColor ?? entry.backgroundColor,

          textColor: entry.textColor ?? '#0f172a',

          variant: 'schedule',
        },
      })
    })
  }

  return events
})

</script>
