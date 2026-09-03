import type { CycleScheduleEntry } from '@/services/models/CycleScheduleEntry'

export interface CycleScheduleDayTemplate {
  dayNumber: number
  entries: CycleScheduleEntry[]
}
