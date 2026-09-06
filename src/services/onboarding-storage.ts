import { isValidOnboardingData } from '@/services/onboarding-data'
import type { OnboardingData } from '@/services/models/OnboardingData'

const ONBOARDING_STORAGE_KEY = 'schedule-tracker.onboarding'

export const readStoredOnboarding = (): OnboardingData | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown

    if (!isValidOnboardingData(parsedValue)) {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
      return null
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    return null
  }
}

export const clearStoredOnboarding = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  }
}

export const saveStoredOnboarding = (onboarding: OnboardingData): void => {
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboarding))
}
