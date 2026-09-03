import { computed, ref } from 'vue'

import { MAX_CYCLE_LENGTH } from '@/services/onboarding-data'
import type { OnboardingData } from '@/services/models/OnboardingData'
import {
  clearStoredOnboarding,
  readStoredOnboarding,
  saveStoredOnboarding,
} from '@/services/onboarding-storage'
import { useOnboardingProfile } from '@/services/profile-service'

const ONBOARDING_STEPS = ['Cycle Length', 'Cycle Days', "Let's go!"] as const

interface SaveOnboardingInput {
  cycleLength: number
  cycleStartDate: Date
}

export const hasOnboardingData = (): boolean => readStoredOnboarding() !== null

export function useOnboarding() {
  const onboardingProfile = useOnboardingProfile()
  const onboardingData = computed(() => onboardingProfile.value ?? readStoredOnboarding())
  const steps = [...ONBOARDING_STEPS]
  const currentStep = ref(0)
  const cycleLength = ref<number | ''>(1)
  const cycleStartDate = ref<Date | null>(new Date())

  const canGoNext = computed(() => {
    if (currentStep.value === 0) {
      return (
        cycleLength.value !== '' && cycleLength.value > 0 && cycleLength.value <= MAX_CYCLE_LENGTH
      )
    }

    if (currentStep.value === 1) {
      return cycleStartDate.value !== null
    }

    return false
  })

  const loadOnboarding = () => {
    return onboardingData.value
  }

  const saveOnboarding = ({ cycleLength, cycleStartDate }: SaveOnboardingInput) => {
    const nextValue: OnboardingData = {
      cycleLength,
      cycleStartDate: cycleStartDate.toISOString(),
    }

    saveStoredOnboarding(nextValue)
    return nextValue
  }

  const clearOnboarding = () => {
    clearStoredOnboarding()
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
