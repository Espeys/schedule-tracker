<template>
  <section class="app-calendar flex h-full min-h-0 flex-col">
    <div class="mb-6 flex items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <AppButton variant="icon" aria-label="Go to previous date range" @click="goToPrevious">
            <ChevronLeftIcon class="size-4" aria-hidden="true" />
          </AppButton>

          <AppButton variant="icon" aria-label="Go to next date range" @click="goToNext">
            <ChevronRightIcon class="size-4" aria-hidden="true" />
          </AppButton>
        </div>

        <p class="text-3xl font-semibold tracking-tight text-base-content">
          {{ currentTitle }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <AppButton variant="secondary" class="border-[#707070]" @click="goToToday">
          Today
        </AppButton>

        <label class="sr-only" for="calendar-view-mode"> Calendar view mode </label>

        <AppSelect
          id="calendar-view-mode"
          v-model="selectedView"
          :options="viewModeOptions"
          class="w-32"
          @update:model-value="handleViewChange"
        />
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import FullCalendar, {
  type CalendarOptions,
  type DatesSetInfo,
  type DayCellInfo,
  type DayHeaderInfo,
  type DayLaneInfo,
  type EventDisplayInfo,
  type EventInput,
} from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/vue3/daygrid'
import '@fullcalendar/vue3/skeleton.css'
import classicThemePlugin from '@fullcalendar/vue3/themes/classic'
import '@fullcalendar/vue3/themes/classic/palette.css'
import '@fullcalendar/vue3/themes/classic/theme.css'
import timeGridPlugin from '@fullcalendar/vue3/timegrid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { nextTick, reactive, ref, watch } from 'vue'

import AppButton from '@/components/generic/AppButton.vue'
import AppSelect from '@/components/generic/AppSelect.vue'
import { buildDateKey, dateKeyToDate, getCycleOffset } from '@/helpers/cycle.helper'
import type { WholeDayEvent } from '@/services/event-management'

const props = withDefaults(
  defineProps<{
    events?: EventInput[]
    cycleStartDate?: string
    cycleLength?: number
    startingCycleNumber?: number
    cyclePauseDateKeys?: string[]
    wholeDayEvents?: WholeDayEvent[]
  }>(),
  {
    events: () => [],
    cycleStartDate: undefined,
    cycleLength: 6,
    startingCycleNumber: 1,
    cyclePauseDateKeys: () => [],
    wholeDayEvents: () => [],
  },
)

type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
type FullCalendarInstance = InstanceType<typeof FullCalendar>

interface CalendarEventExtendedProps {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  variant?: 'schedule'
}

interface CycleMeta {
  cycleNumber: number
  dayNumber: number
  isCycleStart: boolean
}

interface EventColors {
  backgroundColor: string
  borderColor: string
  textColor: string
}

interface CycleTheme {
  cellBackground: string
  headerBackground: string
  borderColor: string
  textColor: string
}

const calendarRef = ref<FullCalendarInstance | null>(null)
const selectedView = ref<CalendarViewMode>('dayGridMonth')

const viewModeOptions: Array<{ label: string; value: CalendarViewMode }> = [
  { label: 'Day', value: 'timeGridDay' },
  { label: 'Week', value: 'timeGridWeek' },
  { label: 'Month', value: 'dayGridMonth' },
]

const monthNameFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
})

const monthTitleFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const yearFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
})

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
})

const dayNumberFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
})

const timeLabelFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

const monthWeekdayLabels = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'] as const
const cycleThemes: CycleTheme[] = [
  {
    cellBackground: '#c9f7f3',
    headerBackground: '#a9eee8',
    borderColor: '#88ded6',
    textColor: '#176e6b',
  },
  {
    cellBackground: '#e1f7df',
    headerBackground: '#c8edc5',
    borderColor: '#a8dca3',
    textColor: '#3f7a3a',
  },
  {
    cellBackground: '#f8e3dc',
    headerBackground: '#f0cec2',
    borderColor: '#dfaf9f',
    textColor: '#945b4d',
  },
  {
    cellBackground: '#c2e2ef',
    headerBackground: '#a7d4e5',
    borderColor: '#82bdd2',
    textColor: '#306d85',
  },
  {
    cellBackground: '#fffcc5',
    headerBackground: '#f7ed8e',
    borderColor: '#e5d967',
    textColor: '#84701b',
  },
  {
    cellBackground: '#f3c5f5',
    headerBackground: '#eaa8ee',
    borderColor: '#d58bdb',
    textColor: '#94449b',
  },
] as const

const currentTitle = ref(monthTitleFormatter.format(new Date()))

const getCycleMeta = (dateKey: string): CycleMeta | null => {
  if (!props.cycleStartDate || props.cycleLength <= 0) {
    return null
  }

  const cycleStartDate = dateKeyToDate(props.cycleStartDate)
  const currentDate = dateKeyToDate(dateKey)

  if (!cycleStartDate || !currentDate) {
    return null
  }

  const offset = getCycleOffset(cycleStartDate, currentDate, props.cyclePauseDateKeys)

  if (offset === null) {
    return null
  }

  const dayNumber = (offset % props.cycleLength) + 1
  const cycleNumber = props.startingCycleNumber + Math.floor(offset / props.cycleLength)

  return {
    cycleNumber,
    dayNumber,
    isCycleStart: dayNumber === 1,
  }
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const getInclusiveEndDate = (date: Date) => {
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() - 1)
  return endDate
}

const formatMonthDayYear = (date: Date) => fullDateFormatter.format(date)

const formatMonthDay = (date: Date) =>
  `${monthNameFormatter.format(date)} ${dayFormatter.format(date)}`

const formatTimeLabel = (date: Date) => timeLabelFormatter.format(date)

const formatEventTimeRange = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) {
    return ''
  }

  return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`
}

const getWholeDayEvent = (dateKey: string) =>
  props.wholeDayEvents.find((event) => event.date === dateKey)

const getEventDurationMinutes = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) {
    return null
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
}

const formatWeekRangeTitle = (start: Date, end: Date) => {
  if (start.getFullYear() !== end.getFullYear()) {
    return `${formatMonthDayYear(start)} - ${formatMonthDayYear(end)}`
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${formatMonthDay(start)} - ${formatMonthDay(end)}, ${yearFormatter.format(end)}`
  }

  return `${formatMonthDay(start)} - ${dayFormatter.format(end)}, ${yearFormatter.format(end)}`
}

const formatCalendarTitle = (info: DatesSetInfo) => {
  const { currentStart, type } = info.view

  switch (type) {
    case 'timeGridDay':
      return fullDateFormatter.format(currentStart)

    case 'timeGridWeek':
      return formatWeekRangeTitle(info.start, getInclusiveEndDate(info.end))

    default:
      return monthTitleFormatter.format(currentStart)
  }
}

const isTimeGridView = (viewType: string) =>
  viewType === 'timeGridDay' || viewType === 'timeGridWeek'

const getCycleTheme = (cycleNumber: number): CycleTheme => {
  const cycleIndex = ((cycleNumber - props.startingCycleNumber) % cycleThemes.length + cycleThemes.length) % cycleThemes.length

  return cycleThemes[cycleIndex] || cycleThemes[0]!
}

const toCycleThemeStyle = (theme: CycleTheme) =>
  [
    `--app-calendar-cycle-bg:${theme.cellBackground}`,
    `--app-calendar-cycle-header-bg:${theme.headerBackground}`,
    `--app-calendar-cycle-border:${theme.borderColor}`,
    `--app-calendar-cycle-text:${theme.textColor}`,
  ].join(';')

const getEventColors = (extendedProps: CalendarEventExtendedProps): EventColors => ({
  backgroundColor: extendedProps.backgroundColor ?? '#eef6ff',
  borderColor: extendedProps.borderColor ?? extendedProps.backgroundColor ?? '#cbd5e1',
  textColor: extendedProps.textColor ?? '#0f172a',
})

const handleDayHeaderContent = (info: DayHeaderInfo) => {
  if (info.view.type === 'dayGridMonth') {
    return {
      html: `
        <div class="app-calendar__month-header">
          <span class="app-calendar__month-header-label">
            ${escapeHtml(monthWeekdayLabels[info.date.getDay()] ?? weekdayFormatter.format(info.date))}
          </span>
        </div>
      `,
    }
  }

  const dateKey = buildDateKey(info.date)
  const cycleMeta = getCycleMeta(dateKey)
  const wholeDayEvent = getWholeDayEvent(dateKey)
  const weekdayLabel = weekdayFormatter.format(info.date)
  const dayNumberLabel = dayNumberFormatter.format(info.date)
  const headerClassName =
    info.view.type === 'timeGridDay'
      ? 'app-calendar__time-header app-calendar__time-header--single-day'
      : 'app-calendar__time-header'

  const dateClassName = [
    'app-calendar__time-header-date',
    info.isToday ? 'app-calendar__time-header-date--today' : '',
    wholeDayEvent ? `app-calendar__time-header-date--${wholeDayEvent.type}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    html: `
      <div class="${headerClassName}">
        <div class="app-calendar__time-header-shell">
          <span class="app-calendar__time-header-weekday">${escapeHtml(weekdayLabel)}</span>
          <span class="${dateClassName}">${escapeHtml(dayNumberLabel)}</span>
          ${
            cycleMeta
              ? `
                <span class="app-calendar__time-header-cycle-pill">
                  Cycle ${cycleMeta.cycleNumber} - Day ${cycleMeta.dayNumber}
                </span>
              `
              : ''
          }
          ${
            wholeDayEvent
              ? `
                <span class="app-calendar__time-header-event-chip app-calendar__event-chip--${wholeDayEvent.type}">
                  ${escapeHtml(wholeDayEvent.title)}
                </span>
              `
              : ''
          }
        </div>
      </div>
    `,
  }
}

const handleDayHeaderMount = (info: DayHeaderInfo & { el: HTMLElement }) => {
  info.el.classList.remove('app-calendar__time-header-cell--cycle')
  info.el.style.removeProperty('--app-calendar-cycle-bg')
  info.el.style.removeProperty('--app-calendar-cycle-header-bg')
  info.el.style.removeProperty('--app-calendar-cycle-border')
  info.el.style.removeProperty('--app-calendar-cycle-text')

  if (!isTimeGridView(info.view.type)) {
    return
  }

  const cycleMeta = getCycleMeta(buildDateKey(info.date))

  if (!cycleMeta) {
    return
  }

  const cycleTheme = getCycleTheme(cycleMeta.cycleNumber)

  info.el.classList.add('app-calendar__time-header-cell--cycle')
  info.el.style.setProperty('--app-calendar-cycle-bg', cycleTheme.cellBackground)
  info.el.style.setProperty('--app-calendar-cycle-header-bg', cycleTheme.headerBackground)
  info.el.style.setProperty('--app-calendar-cycle-border', cycleTheme.borderColor)
  info.el.style.setProperty('--app-calendar-cycle-text', cycleTheme.textColor)
}

/*
 * FullCalendar v7:
 *
 * Use dayCellTopContent to render the day number/cycle content.
 * Do not query FullCalendar's private DOM classes such as
 * ".fc-daygrid-day-top", which no longer exists in the v7 markup.
 */
const handleDayCellTopContent = (info: DayCellInfo) => {
  const dateKey = buildDateKey(info.date)
  const cycleMeta = info.view.type === 'dayGridMonth' ? getCycleMeta(dateKey) : null
  const wholeDayEvent = getWholeDayEvent(dateKey)

  const dayNumberClasses = [
    'app-calendar__day-number',
    info.isToday ? 'app-calendar__day-number--today' : '',
    info.isOther ? 'app-calendar__day-number--other' : '',
    wholeDayEvent ? `app-calendar__day-number--${wholeDayEvent.type}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cycleContent = cycleMeta
    ? `
      <div class="app-calendar__day-cycle-header">
        <span class="app-calendar__cycle-pill">
          Cycle ${cycleMeta.cycleNumber} - Day ${cycleMeta.dayNumber}
        </span>
      </div>
    `
    : ''

  const wholeDayEventContent = wholeDayEvent
    ? `
      <div class="app-calendar__day-event-chip-row">
        <span class="app-calendar__event-chip app-calendar__event-chip--${wholeDayEvent.type}">
          ${escapeHtml(wholeDayEvent.title)}
        </span>
      </div>
    `
    : ''

  return {
    html: `
      <div class="app-calendar__day-top-content">
        <div class="app-calendar__day-number-row">
          <span class="${dayNumberClasses}">
            ${escapeHtml(info.dayNumberText)}
          </span>
        </div>

        ${cycleContent}
        ${wholeDayEventContent}
      </div>
    `,
  }
}

const getDayCellClassName = (info: DayCellInfo) => {
  const classNames = [info.isToday ? 'app-calendar__day-cell--today' : '']

  if (info.view.type === 'dayGridMonth' && getCycleMeta(buildDateKey(info.date))) {
    classNames.push('app-calendar__day-cell--cycle')
  }

  return classNames.filter(Boolean).join(' ')
}

const handleDayCellMount = (info: DayCellInfo & { el: HTMLElement }) => {
  info.el.style.removeProperty('--app-calendar-cycle-bg')
  info.el.style.removeProperty('--app-calendar-cycle-header-bg')
  info.el.style.removeProperty('--app-calendar-cycle-border')
  info.el.style.removeProperty('--app-calendar-cycle-text')

  if (info.view.type !== 'dayGridMonth') {
    return
  }

  const cycleMeta = getCycleMeta(buildDateKey(info.date))

  if (!cycleMeta) {
    return
  }

  const cycleTheme = getCycleTheme(cycleMeta.cycleNumber)

  info.el.style.setProperty('--app-calendar-cycle-bg', cycleTheme.cellBackground)
  info.el.style.setProperty('--app-calendar-cycle-header-bg', cycleTheme.headerBackground)
  info.el.style.setProperty('--app-calendar-cycle-border', cycleTheme.borderColor)
  info.el.style.setProperty('--app-calendar-cycle-text', cycleTheme.textColor)
}

const resetTodayLaneState = (laneElement: HTMLElement) => {
  laneElement.classList.remove('app-calendar__day-lane--today')
}

const getDayLaneClassName = (info: DayLaneInfo) => {
  if (!isTimeGridView(info.view.type) || !info.isToday) {
    return ''
  }

  return 'app-calendar__day-lane--today'
}

const handleDayLaneMount = (info: DayLaneInfo) => {
  resetTodayLaneState(info.el)

  if (!isTimeGridView(info.view.type) || !info.isToday) {
    return
  }

  info.el.classList.add('app-calendar__day-lane--today')
}

const handleEventContent = (info: EventDisplayInfo) => {
  const extendedProps = info.event.extendedProps as CalendarEventExtendedProps

  if (extendedProps.variant !== 'schedule') {
    return true
  }

  if (isTimeGridView(info.view.type)) {
    const eventTimeText = formatEventTimeRange(info.event.start, info.event.end)
    const eventShellClassName =
      info.view.type === 'timeGridDay'
        ? 'app-calendar__time-event-shell app-calendar__time-event-shell--single-day'
        : 'app-calendar__time-event-shell'

    return {
      html: `
        <div class="${eventShellClassName}">
          <span class="app-calendar__time-event-accent"></span>
          <div class="app-calendar__time-event-copy">
            <span class="app-calendar__time-event-title">${escapeHtml(info.event.title)}</span>
            <span class="app-calendar__time-event-time">${escapeHtml(eventTimeText)}</span>
          </div>
        </div>
      `,
    }
  }

  if (info.view.type !== 'dayGridMonth') {
    return true
  }

  return {
    html: `
      <div class="app-calendar__month-event-shell">
        <div class="app-calendar__month-event-card">
          <span class="app-calendar__month-event-accent"></span>
          <span class="app-calendar__month-event-time">${escapeHtml(info.timeText)}</span>
          <span class="app-calendar__month-event-title">${escapeHtml(info.event.title)}</span>
        </div>
      </div>
    `,
  }
}

const handleEventDidMount = (info: EventDisplayInfo & { el: HTMLElement }) => {
  const extendedProps = info.event.extendedProps as CalendarEventExtendedProps

  if (extendedProps.variant !== 'schedule') {
    return
  }

  const { backgroundColor, borderColor, textColor } = getEventColors(extendedProps)

  info.el.style.setProperty('--app-calendar-event-bg', backgroundColor)
  info.el.style.setProperty('--app-calendar-event-border', borderColor)
  info.el.style.setProperty('--app-calendar-event-text', textColor)
  info.el.style.backgroundColor = 'transparent'
  info.el.style.borderColor = 'transparent'
  info.el.style.boxShadow = 'none'
  info.el.style.color = textColor

  info.el.classList.add('app-calendar__event')

  if (info.view.type === 'dayGridMonth') {
    info.el.classList.add('app-calendar__event--month')
  }

  if (isTimeGridView(info.view.type)) {
    info.el.classList.add('app-calendar__event--timegrid')
    info.el.parentElement?.classList.add('app-calendar__time-event-harness')

    const durationInMinutes = getEventDurationMinutes(info.event.start, info.event.end)

    if (durationInMinutes !== null && durationInMinutes <= 20) {
      info.el.classList.add('app-calendar__event--timegrid-compact')
    }

    if (durationInMinutes !== null && durationInMinutes <= 10) {
      info.el.classList.add('app-calendar__event--timegrid-minimal')
    }
  }

  if (info.view.type !== 'dayGridMonth') {
    return
  }

  const mainFrame = info.el.querySelector('.fc-event-main-frame')

  if (mainFrame instanceof HTMLElement) {
    mainFrame.style.backgroundColor = 'transparent'
    mainFrame.style.borderColor = 'transparent'
    mainFrame.style.boxShadow = 'none'
  }
}

const handleMoreLinkContent = () => ({
  html: '<span class="app-calendar__more-link">View more</span>',
})

const getMoreLinkClassName = () => 'app-calendar__more-link-container'

const getMoreLinkInnerClassName = () => 'app-calendar__more-link-inner'

const handleDatesSet = (info: DatesSetInfo) => {
  currentTitle.value = formatCalendarTitle(info)

  const nextView = info.view.type as CalendarViewMode

  if (selectedView.value !== nextView) {
    selectedView.value = nextView
  }
}

const calendarOptions = reactive<CalendarOptions>({
  plugins: [classicThemePlugin, dayGridPlugin, timeGridPlugin],
  initialDate: new Date(),
  initialView: 'dayGridMonth',
  height: '100%',
  headerToolbar: false,

  dayHeaderFormat: {
    weekday: 'short',
  },
  dayHeaderContent: handleDayHeaderContent,
  dayHeaderDidMount: handleDayHeaderMount,

  dayCellClass: getDayCellClassName,
  dayCellDidMount: handleDayCellMount,

  dayCellTopContent: handleDayCellTopContent,

  dayCellTopClass: 'app-calendar__fc-day-top',
  dayCellTopInnerClass: 'app-calendar__fc-day-top-inner',
  dayCellInnerClass: 'app-calendar__fc-day-inner',

  dayLaneClass: getDayLaneClassName,
  dayLaneDidMount: handleDayLaneMount,
  dayLaneWillUnmount: ({ el }) => {
    resetTodayLaneState(el)
  },

  weekends: true,
  fixedWeekCount: true,
  navLinks: false,
  allDaySlot: false,
  slotMinTime: '06:00:00',
  slotMaxTime: '20:00:00',
  slotDuration: '00:10:00',
  slotHeaderInterval: '00:10:00',
  slotHeaderFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short',
  },

  eventTimeFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short',
  },

  views: {
    dayGridMonth: {
      // Keep month cells focused on their cycle label. Events remain available
      // through the "View more" link, which opens the selected day.
      dayMaxEvents: 0,
      expandRows: true,
    },
  },

  moreLinkContent: handleMoreLinkContent,
  moreLinkClass: getMoreLinkClassName,
  moreLinkInnerClass: getMoreLinkInnerClassName,
  moreLinkClick: 'timeGridDay',

  eventContent: handleEventContent,
  eventDidMount: handleEventDidMount,

  events: props.events,
  datesSet: handleDatesSet,
})

const getCalendarApi = () => calendarRef.value?.getApi()

const goToPrevious = () => {
  getCalendarApi()?.prev()
}

const goToNext = () => {
  getCalendarApi()?.next()
}

const goToToday = () => {
  getCalendarApi()?.today()
}

const handleViewChange = (viewMode: string) => {
  const calendarApi = getCalendarApi()

  if (!calendarApi || calendarApi.view.type === viewMode) {
    return
  }

  calendarApi.changeView(viewMode)
}

watch(
  () => props.events,
  (events) => {
    calendarOptions.events = events
  },
)

watch(
  [
    () => props.cycleStartDate,
    () => props.cycleLength,
    () => props.startingCycleNumber,
    () => props.cyclePauseDateKeys,
    () => props.wholeDayEvents,
  ],
  () => {
    nextTick(() => {
      getCalendarApi()?.render()
    })
  },
)
</script>

<style scoped>
.app-calendar :deep(.fc) {
  --fc-border-color: #707070;
  --fc-button-bg-color: transparent;
  --fc-button-border-color: transparent;
  --fc-button-hover-bg-color: transparent;
  --fc-button-hover-border-color: transparent;
  --fc-button-active-bg-color: transparent;
  --fc-button-active-border-color: transparent;
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: #ffffff;
  --fc-classic-today: transparent;
  --fc-today-bg-color: transparent;
  height: 100%;
}

.app-calendar :deep(.fc-view-harness),
.app-calendar :deep(.fc-view-harness-active),
.app-calendar :deep(.fc-daygrid),
.app-calendar :deep(.fc-daygrid-body) {
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

.app-calendar :deep(.fc-daygrid .fc-scroller) {
  overflow: hidden !important;
}

.app-calendar :deep(.fc-daygrid-body table),
.app-calendar :deep(.fc-daygrid-body tbody) {
  height: 100% !important;
  table-layout: fixed;
}

/*
 * A month always renders six weeks. Give each week an equal share of the
 * available calendar height so empty days cannot collapse to their content.
 */
.app-calendar :deep(.fc-daygrid-body tr) {
  height: calc(100% / 6) !important;
}

.app-calendar :deep(.fc-daygrid) {
  --fc-event-bg-color: transparent;
  --fc-event-border-color: transparent;
  --fc-event-text-color: inherit;
}

.app-calendar :deep(.fc-scrollgrid) {
  height: 100%;
  border-radius: 0;
  overflow: hidden;
}

.app-calendar :deep([role='grid']) {
  border: 1px solid #707070;
  border-radius: 0;
  overflow: hidden;
}

.app-calendar :deep([role='gridcell']) {
  border-color: #707070 !important;
}

.app-calendar :deep([role='row']:has([role='gridcell'])) {
  border-bottom: 1px solid #707070 !important;
}

.app-calendar :deep(.fc-scrollgrid-section-header > *),
.app-calendar :deep(.fc-scrollgrid-section-header th),
.app-calendar :deep(.fc-scrollgrid-section-header td),
.app-calendar :deep(.fc-col-header-cell) {
  border: 0 !important;
  background: transparent !important;
}

.app-calendar :deep(.fc-col-header) {
  border-bottom: 1px solid #707070 !important;
}

.app-calendar :deep(.fc-scrollgrid-section-body > td),
.app-calendar :deep(.fc-scrollgrid-section-body table) {
  border-top: 0 !important;
}

.app-calendar :deep(.fc-col-header-cell-cushion) {
  display: block;
  width: 100%;
  padding: 0;
  text-decoration: none;
}

.app-calendar :deep([role='columnheader']:has(.app-calendar__month-header)) {
  background: var(--color-primary) !important;
}

.app-calendar :deep(.app-calendar__month-header) {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 0 0.62rem;
}

.app-calendar :deep(.app-calendar__month-header-label) {
  color: var(--color-on-primary);
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__time-header) {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.app-calendar :deep(.app-calendar__time-header--single-day) {
  padding: 0;
}

.app-calendar :deep(.app-calendar__time-header-cell--cycle) {
  background: var(--app-calendar-cycle-header-bg) !important;
  box-shadow: inset 0 -1px 0 rgba(15, 23, 42, 0.05);
}

.app-calendar :deep(.app-calendar__time-header-shell) {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.26rem;
  padding: 0.62rem 0.3rem 0.54rem;
}

.app-calendar :deep(.app-calendar__time-header--single-day .app-calendar__time-header-shell) {
  align-items: center;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.app-calendar :deep(.app-calendar__time-header-weekday) {
  color: rgba(15, 23, 42, 0.68);
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__time-header-date) {
  display: inline-flex;
  min-width: 1.8rem;
  height: 1.8rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #0f172a;
  font-size: 1.12rem;
  font-weight: 600;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__time-header-date--today) {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.app-calendar :deep(.app-calendar__time-header-date--class-suspension) {
  color: #c2410c;
}

.app-calendar :deep(.app-calendar__time-header-date--holiday) {
  color: #dc2626;
}

.app-calendar :deep(.app-calendar__time-header-cycle-pill) {
  display: inline-flex;
  align-items: center;
  min-height: 1rem;
  padding: 0.08rem 0.48rem;
  border: 1px solid color-mix(in srgb, var(--app-calendar-cycle-border) 88%, white);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.38);
  color: var(--app-calendar-cycle-text);
  font-size: 0.56rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.app-calendar :deep(.app-calendar__time-header-event-chip) {
  display: inline-flex;
  max-width: calc(100% - 0.75rem);
  align-items: center;
  padding: 0.12rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.56rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.app-calendar :deep(.app-calendar__fc-day-top),
.app-calendar :deep(.app-calendar__fc-day-top-inner) {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  overflow: visible !important;
}

.app-calendar :deep(.app-calendar__fc-day-inner) {
  min-height: 0 !important;
  min-width: 0;
  overflow: visible !important;
}

.app-calendar :deep(.app-calendar__day-top-content) {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 3rem;
  min-width: 0;
  flex-direction: column;
  overflow: visible;
}

.app-calendar :deep(.app-calendar__day-number-row) {
  display: flex;
  width: 100%;
  min-height: 1.58rem;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.4rem 0.5rem 0;
}

.app-calendar :deep(.app-calendar__day-number) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.15;
}

.app-calendar :deep(.app-calendar__day-number--other) {
  color: rgba(15, 23, 42, 0.4);
}

.app-calendar :deep(.app-calendar__day-number--today) {
  min-width: 1.7rem;
  height: 1.7rem;
  margin-top: -0.05rem;
  margin-right: -0.05rem;
  border: 1px solid var(--color-secondary);
  border-radius: 9999px;
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
  line-height: 1;
}

.app-calendar :deep(.app-calendar__day-cell--today) {
  background-color: transparent !important;
}

.app-calendar :deep(.app-calendar__day-cell--cycle) {
  background: var(--app-calendar-cycle-bg) !important;
}

.app-calendar :deep(.app-calendar__day-lane--today) {
  background-color: transparent !important;
}

.app-calendar :deep(.app-calendar__day-cycle-header) {
  position: absolute;
  right: 0;
  bottom: 0.08rem;
  left: 0;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  margin-top: 0;
  pointer-events: none;
}

.app-calendar :deep(.app-calendar__day-event-chip-row) {
  display: flex;
  justify-content: center;
  padding: 0.1rem 0.45rem 0.2rem;
  pointer-events: none;
}

.app-calendar :deep(.app-calendar__day-event-chip-row .app-calendar__event-chip) {
  display: block;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.14rem 0.42rem;
  border-radius: 9999px;
  font-size: 0.58rem;
  font-weight: 700;
  line-height: 1;
  overflow-wrap: anywhere;
  text-align: center;
  white-space: normal;
}

.app-calendar :deep(.app-calendar__time-header-event-chip) {
  display: block;
  width: fit-content;
  max-width: calc(100% - 0.75rem);
  min-width: 0;
  padding: 0.1rem 0.2rem;
  border-radius: 0;
  font-size: 0.56rem;
  font-weight: 700;
  line-height: 1;
  overflow-wrap: anywhere;
  text-align: center;
  white-space: normal;
}

.app-calendar :deep(.app-calendar__event-chip--class-suspension),
.app-calendar :deep(.app-calendar__event-chip--holiday) {
  background: transparent;
}

.app-calendar :deep(.app-calendar__event-chip--class-suspension) {
  color: #c2410c;
}

.app-calendar :deep(.app-calendar__event-chip--holiday) {
  color: #dc2626;
}

.app-calendar :deep(.app-calendar__cycle-pill) {
  display: inline-flex;
  align-items: center;
  min-height: 1.12rem;
  justify-content: center;
  align-self: center;
  padding: 0.1rem 0.46rem;
  border: 1px solid var(--app-calendar-cycle-border, rgba(15, 23, 42, 0.14));
  border-radius: 9999px;
  background: var(--app-calendar-cycle-header-bg, #e5e7eb);
  color: var(--app-calendar-cycle-text, #1f2937);
  font-size: 0.62rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.app-calendar :deep(.fc-daygrid-day-frame) {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.app-calendar :deep(.fc-daygrid-body [role='row']) {
  height: calc(100% / 6) !important;
  min-height: 0 !important;
}

.app-calendar :deep(.fc-daygrid-day-events) {
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  flex-direction: column;
  gap: 0.14rem;
  margin-top: -0.16rem;
  overflow: hidden;
}

.app-calendar :deep(.fc-daygrid-event-harness) {
  margin-top: 0 !important;
}

.app-calendar :deep(.fc-daygrid-day-bottom) {
  display: flex;
  justify-content: center;
  margin-top: 0.06rem;
}

.app-calendar :deep(.app-calendar__more-link-container) {
  display: flex !important;
  align-self: stretch;
  margin-top: 0.06rem;
  width: 100%;
  justify-content: center;
  z-index: 2;
}

.app-calendar :deep(.app-calendar__more-link-inner) {
  display: flex;
  width: 100%;
  justify-content: center;
}

.app-calendar :deep(.fc-daygrid-event),
.app-calendar :deep(.fc-daygrid-block-event),
.app-calendar :deep(.fc-h-event) {
  margin: 0;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none;
  color: inherit;
}

.app-calendar :deep(.fc-event-main) {
  padding: 0;
  background: transparent !important;
  background-color: transparent !important;
}

.app-calendar :deep(.fc-event-main-frame),
.app-calendar :deep(.fc-daygrid-event .fc-event-main-frame),
.app-calendar :deep(.fc-daygrid-block-event .fc-event-main-frame) {
  background: transparent !important;
  background-color: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

.app-calendar :deep(.app-calendar__month-event-shell) {
  display: block;
  width: 100%;
}

.app-calendar :deep(.app-calendar__month-event-card) {
  display: flex;
  min-height: 1.34rem;
  align-items: center;
  gap: 0.34rem;
  overflow: hidden;
  padding: 0.12rem 0.34rem;
  border: 1px solid var(--app-calendar-event-border);
  border-radius: 0.38rem;
  background: var(--app-calendar-event-bg);
  color: var(--app-calendar-event-text);
}

.app-calendar :deep(.app-calendar__month-event-accent) {
  width: 0.1rem;
  flex: none;
  align-self: stretch;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--app-calendar-event-bg) 78%, black);
}

.app-calendar :deep(.app-calendar__month-event-time) {
  flex: none;
  color: rgba(15, 23, 42, 0.82);
  font-size: 0.56rem;
  font-weight: 500;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__month-event-title) {
  min-width: 0;
  overflow: hidden;
  font-size: 0.62rem;
  font-weight: 600;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-calendar :deep(.app-calendar__more-link) {
  display: inline-flex;
  justify-content: center;
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.58rem;
  font-weight: 600;
  text-align: center;
}

.app-calendar :deep(.fc-timegrid-slot) {
  height: 1.38rem;
}

.app-calendar :deep(.fc-timegrid-axis) {
  width: 3rem;
  min-width: 3rem;
  border-right: 0 !important;
  background: #ffffff;
}

.app-calendar :deep(.fc-timegrid-axis-frame),
.app-calendar :deep(.fc-timegrid-slot-label-frame) {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 0.1rem;
}

.app-calendar :deep(.fc-timegrid-axis-cushion),
.app-calendar :deep(.fc-timegrid-slot-label-cushion) {
  padding: 0 0.7rem 0 0;
  color: rgba(15, 23, 42, 0.78);
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  text-transform: uppercase;
}

.app-calendar :deep(.fc-timegrid-slot-label) {
  vertical-align: top;
  border-right: 0 !important;
}

.app-calendar :deep(.fc-timegrid-slot-minor) {
  border-top-style: solid;
}

.app-calendar :deep(.fc-timegrid-divider) {
  display: none;
}

.app-calendar :deep(.fc-timegrid-cols table),
.app-calendar :deep(.fc-timegrid-body table) {
  border-left: 0 !important;
}

.app-calendar :deep(.fc-timegrid-col-frame) {
  background: #ffffff;
}

.app-calendar :deep(.fc-timegrid-col),
.app-calendar :deep(.fc-timegrid-slot-lane) {
  border-left: 1px solid #707070 !important;
}

.app-calendar :deep(.fc-timegrid-col:first-child),
.app-calendar :deep(.fc-timegrid-slot-lane:first-child) {
  border-left-width: 0 !important;
}

.app-calendar :deep(.app-calendar__time-event-harness) {
  /*
   * FullCalendar narrows an event harness whenever it calculates a stacked
   * lane. Schedule entries should always occupy the complete day column.
   */
  inset-inline-start: 0.4rem !important;
  inset-inline-end: auto !important;
  margin-inline-end: 0 !important;
  width: calc(100% - 0.8rem) !important;
}

.app-calendar :deep(.fc-timegrid-event),
.app-calendar :deep(.fc-v-event) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.app-calendar :deep(.fc-timegrid-event .fc-event-main),
.app-calendar :deep(.fc-v-event .fc-event-main),
.app-calendar :deep(.fc-timegrid-event .fc-event-main-frame),
.app-calendar :deep(.fc-v-event .fc-event-main-frame) {
  height: 100%;
  padding: 0;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

.app-calendar :deep(.app-calendar__event--timegrid) {
  margin: 0 !important;
}

.app-calendar :deep(.app-calendar__event--timegrid-compact .app-calendar__time-event-shell) {
  gap: 0.24rem;
  padding-top: 0.12rem;
  padding-bottom: 0.12rem;
}

.app-calendar :deep(.app-calendar__event--timegrid-compact .app-calendar__time-event-copy) {
  gap: 0.02rem;
}

.app-calendar :deep(.app-calendar__event--timegrid-compact .app-calendar__time-event-title) {
  font-size: 0.62rem;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__day-number--class-suspension) {
  color: #c2410c;
}

.app-calendar :deep(.app-calendar__day-number--holiday) {
  color: #dc2626;
}

.app-calendar :deep(.app-calendar__event--timegrid-compact .app-calendar__time-event-time) {
  font-size: 0.42rem;
  line-height: 1;
}

.app-calendar :deep(.app-calendar__event--timegrid-minimal .app-calendar__time-event-shell) {
  align-items: center;
  padding-top: 0.08rem;
  padding-bottom: 0.08rem;
}

.app-calendar :deep(.app-calendar__event--timegrid-minimal .app-calendar__time-event-copy) {
  justify-content: center;
}

.app-calendar :deep(.app-calendar__event--timegrid-minimal .app-calendar__time-event-time) {
  display: none;
}

.app-calendar :deep(.app-calendar__time-event-shell) {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100%;
  min-width: 0;
  flex: 1 1 auto;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.38rem;
  overflow: hidden;
  padding: 0.24rem 0.4rem 0.26rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-left: 0;
  border-radius: 0.18rem;
  background: var(--app-calendar-event-bg);
  color: var(--app-calendar-event-text);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.32) inset;
}

.app-calendar :deep(.app-calendar__time-event-shell--single-day) {
  margin-right: 0.35rem;
}

.app-calendar :deep(.app-calendar__time-event-accent) {
  width: 0.14rem;
  flex: none;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--app-calendar-event-bg) 78%, black);
}

.app-calendar :deep(.app-calendar__time-event-copy) {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.08rem;
}

.app-calendar :deep(.app-calendar__time-event-title) {
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.05;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-calendar :deep(.app-calendar__time-event-time) {
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.47rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.01em;
}
</style>
