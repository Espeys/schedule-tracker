import { computed, ref } from 'vue'

import type { OnboardingData } from '@/services/models/OnboardingData'

const ONBOARDING_STORAGE_KEY = 'schedule-tracker.onboarding'
const ONBOARDING_STEPS = ['Cycle Length', 'Cycle Days', "Let's go!"] as const
const MAX_CYCLE_LENGTH = 6

interface SaveOnboardingInput {
  cycleLength: number
  cycleStartDate: Date
}

const isValidOnboardingData = (value: unknown): value is OnboardingData => {
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

const readStoredOnboarding = (): OnboardingData | null => {
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

export const hasOnboardingData = (): boolean => readStoredOnboarding() !== null

export function useOnboarding() {
  const onboardingData = ref<OnboardingData | null>(readStoredOnboarding())
  const steps = [...ONBOARDING_STEPS]
  const currentStep = ref(0)
  const cycleLength = ref<number | ''>(1)
  const cycleStartDate = ref<Date | null>(new Date())

  const canGoNext = computed(() => {
    if (currentStep.value === 0) {
      return (
        cycleLength.value !== '' &&
        cycleLength.value > 0 &&
        cycleLength.value <= MAX_CYCLE_LENGTH
      )
    }

    if (currentStep.value === 1) {
      return cycleStartDate.value !== null
    }

    return false
  })

  const loadOnboarding = () => {
    onboardingData.value = readStoredOnboarding()
    return onboardingData.value
  }

  const saveOnboarding = ({ cycleLength, cycleStartDate }: SaveOnboardingInput) => {
    const nextValue: OnboardingData = {
      cycleLength,
      cycleStartDate: cycleStartDate.toISOString(),
    }

    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextValue))
    onboardingData.value = nextValue

    return nextValue
  }

  const clearOnboarding = () => {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    onboardingData.value = null
  }

  const goToNextStep = () => {
    if (!canGoNext.value) {
      return
    }

    currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
  }

  const goToPreviousStep = () => {
    currentStep.value = Math.max(currentStep.value - 1, 0)
  }

  const finishOnboarding = () => {
    if (
      cycleLength.value === '' ||
      cycleLength.value > MAX_CYCLE_LENGTH ||
      cycleStartDate.value === null
    ) {
      return null
    }

    return saveOnboarding({
      cycleLength: cycleLength.value,
      cycleStartDate: cycleStartDate.value,
    })
  }

  const storedCycleStartDate = computed(() => {
    if (!onboardingData.value) {
      return null
    }

    return new Date(onboardingData.value.cycleStartDate)
  })

  return {
    canGoNext,
    currentStep,
    cycleLength,
    cycleStartDate,
    finishOnboarding,
    goToNextStep,
    goToPreviousStep,
    onboardingData,
    hasOnboardingData: computed(() => onboardingData.value !== null),
    clearOnboarding,
    loadOnboarding,
    saveOnboarding,
    steps,
    storedCycleStartDate,
  }
}
