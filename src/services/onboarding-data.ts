import type { OnboardingData } from '@/services/models/OnboardingData'

export const MAX_CYCLE_LENGTH = 6

export const isValidOnboardingData = (value: unknown): value is OnboardingData => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.cycleLength === 'number' &&
    Number.isFinite(candidate.cycleLength) &&
    candidate.cycleLength > 0 &&
    candidate.cycleLength <= MAX_CYCLE_LENGTH &&
    typeof candidate.cycleStartDate === 'string' &&
    !Number.isNaN(new Date(candidate.cycleStartDate).getTime())
  )
}
