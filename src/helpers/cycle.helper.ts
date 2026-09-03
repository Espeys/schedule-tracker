import type { CycleScheduleDayTemplate } from '@/services/models/CycleScheduleDayTemplate'
import type { CycleScheduleEntry } from '@/services/models/CycleScheduleEntry'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const sharedScheduleEntries: CycleScheduleEntry[] = [
  {
    title: 'Morning Talk',
    startTime: '07:20',
    endTime: '07:45',
    backgroundColor: '#f4f1ff',
  },
  {
    title: 'Break',
    startTime: '08:30',
    endTime: '08:35',
    backgroundColor: '#fff5cc',
  },
  {
    title: 'Recess',
    startTime: '09:20',
    endTime: '09:40',
    backgroundColor: '#fff0b8',
  },
  {
    title: 'Break',
    startTime: '10:25',
    endTime: '10:30',
    backgroundColor: '#fff5cc',
  },
  {
    title: 'Lunch',
    startTime: '11:15',
    endTime: '12:05',
    backgroundColor: '#ffeec2',
  },
]

const mergeScheduleEntries = (entries: CycleScheduleEntry[]) =>
  [...sharedScheduleEntries, ...entries].sort((leftEntry, rightEntry) =>
    leftEntry.startTime.localeCompare(rightEntry.startTime),
  )

export const cycleScheduleTemplate: CycleScheduleDayTemplate[] = [
  {
    dayNumber: 1,
    entries: mergeScheduleEntries([
      {
        title: '1 - 1',
        startTime: '07:45',
        endTime: '08:30',
        backgroundColor: '#d8f5fb',
      },
      {
        title: '1 - 2',
        startTime: '09:40',
        endTime: '10:25',
        backgroundColor: '#fff1bf',
      },
      {
        title: '1 - 3',
        startTime: '10:30',
        endTime: '11:15',
        backgroundColor: '#d7f7e7',
      },
    ]),
  },
  {
    dayNumber: 2,
    entries: mergeScheduleEntries([
      {
        title: '1 - 5',
        startTime: '07:45',
        endTime: '08:30',
        backgroundColor: '#d8f5fb',
      },
      {
        title: '1 - 1',
        startTime: '09:40',
        endTime: '10:25',
        backgroundColor: '#d8defd',
      },
      {
        title: '1 - 3',
        startTime: '10:30',
        endTime: '11:15',
        backgroundColor: '#d7f7e7',
      },
    ]),
  },
  {
    dayNumber: 3,
    entries: mergeScheduleEntries([
      {
        title: '1 - 5',
        startTime: '07:45',
        endTime: '08:30',
        backgroundColor: '#d8f5fb',
      },
      {
        title: '1 - 1 Lab',
        startTime: '09:40',
        endTime: '10:25',
        backgroundColor: '#d8defd',
      },
      {
        title: '1 - 2',
        startTime: '10:30',
        endTime: '11:15',
        backgroundColor: '#fff1bf',
      },
      {
        title: '2 - 5',
        startTime: '12:05',
        endTime: '12:50',
        backgroundColor: '#d7f7e7',
      },
    ]),
  },
  {
    dayNumber: 4,
    entries: mergeScheduleEntries([
      {
        title: '1 - 4',
        startTime: '08:35',
        endTime: '09:20',
        backgroundColor: '#fff1bf',
      },
      {
        title: '2 - 5 Lab',
        startTime: '09:40',
        endTime: '10:25',
        backgroundColor: '#d8defd',
      },
      {
        title: '1 - 2 Lab',
        startTime: '10:30',
        endTime: '11:15',
        backgroundColor: '#d7f7e7',
      },
    ]),
  },
  {
    dayNumber: 5,
    entries: mergeScheduleEntries([
      {
        title: '2 - 5',
        startTime: '07:45',
        endTime: '08:30',
        backgroundColor: '#d8defd',
      },
      {
        title: '1 - 4',
        startTime: '08:35',
        endTime: '09:20',
        backgroundColor: '#fff1bf',
      },
      {
        title: '1 - 3 Lab',
        startTime: '10:30',
        endTime: '11:15',
        backgroundColor: '#d7f7e7',
      },
      {
        title: 'Team Meeting',
        startTime: '13:00',
        endTime: '15:00',
        backgroundColor: '#ece7ff',
      },
    ]),
  },
  {
    dayNumber: 6,
    entries: mergeScheduleEntries([
      {
        title: '1 - 5 Lab',
        startTime: '07:45',
        endTime: '08:30',
        backgroundColor: '#d8f5fb',
      },
      {
        title: '1 - 4 Lab',
        startTime: '08:35',
        endTime: '09:20',
        backgroundColor: '#fff1bf',
      },
      {
        title: '2 - 5',
        startTime: '09:40',
        endTime: '10:25',
        backgroundColor: '#d8defd',
      },
    ]),
  },
]

export const buildDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const startOfDay = (date: Date) => {
  const nextDate = new Date(date)

  nextDate.setHours(0, 0, 0, 0)

  return nextDate
}

export const dateKeyToDate = (dateKey: string) => {
  const [yearString, monthString, dayString] = dateKey.split('-')

  const year = Number(yearString)
  const month = Number(monthString)
  const day = Number(dayString)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return startOfDay(date)
}

export const isWeekend = (date: Date) => {
  const day = date.getDay()

  return day === 0 || day === 6
}

const toUtcDayIndex = (date: Date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_IN_MS)

const getUtcWeekday = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).getUTCDay()

const countWeekdaysInRange = (startDate: Date, endDate: Date) => {
  const startDayIndex = toUtcDayIndex(startDate)
  const endDayIndex = toUtcDayIndex(endDate)

  if (endDayIndex < startDayIndex) {
    return 0
  }

  const totalDays = endDayIndex - startDayIndex + 1
  const fullWeeks = Math.floor(totalDays / 7)

  let weekdayCount = fullWeeks * 5
  let weekday = getUtcWeekday(startDate)

  for (let remainingDays = totalDays % 7; remainingDays > 0; remainingDays -= 1) {
    if (weekday !== 0 && weekday !== 6) {
      weekdayCount += 1
    }

    weekday = (weekday + 1) % 7
  }

  return weekdayCount
}

export const getCycleOffset = (
  cycleStartDate: Date,
  currentDate: Date,
  excludedDateKeys: readonly string[] = [],
) => {
  const normalizedStartDate = startOfDay(cycleStartDate)
  const normalizedCurrentDate = startOfDay(currentDate)

  if (toUtcDayIndex(normalizedCurrentDate) < toUtcDayIndex(normalizedStartDate)) {
    return null
  }

  const excludedDates = new Set(excludedDateKeys)

  if (isWeekend(normalizedCurrentDate) || excludedDates.has(buildDateKey(normalizedCurrentDate))) {
    return null
  }

  let weekdayCount = countWeekdaysInRange(normalizedStartDate, normalizedCurrentDate)

  excludedDateKeys.forEach((dateKey) => {
    const excludedDate = dateKeyToDate(dateKey)

    if (
      excludedDate &&
      !isWeekend(excludedDate) &&
      toUtcDayIndex(excludedDate) >= toUtcDayIndex(normalizedStartDate) &&
      toUtcDayIndex(excludedDate) <= toUtcDayIndex(normalizedCurrentDate)
    ) {
      weekdayCount -= 1
    }
  })

  if (weekdayCount === 0) {
    return null
  }

  return weekdayCount - 1
}
