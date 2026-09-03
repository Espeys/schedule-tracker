export type WholeDayEventType = 'holiday' | 'class-suspension'

export interface WholeDayEvent {
  date: string
  title: string
  type: WholeDayEventType
}

/*
 * Whole-day events pause the academic cycle. Keep the dates in one place so
 * the calendar display and schedule generator always agree.
 */
export const wholeDayEvents: WholeDayEvent[] = [
  { date: '2026-08-06', title: 'Class Suspension', type: 'class-suspension' },
  { date: '2026-08-07', title: 'Class Suspension', type: 'class-suspension' },
  { date: '2026-08-10', title: 'Class Suspension', type: 'class-suspension' },
  { date: '2026-08-17', title: 'Assumption Feast Day Celebration', type: 'holiday' },
  { date: '2026-08-21', title: 'Ninoy Aquino Day', type: 'holiday' },
  { date: '2026-08-31', title: 'National Heroes Day', type: 'holiday' },
]

export const cyclePauseDateKeys = wholeDayEvents.map((event) => event.date)
