<template>
  <main class="flex min-h-screen justify-center px-4 py-8">
    <div class="flex min-h-[720px] w-full max-w-5xl flex-col px-6 py-8 gap-y-32">
      <AppTimeline :steps="steps" :current-step="currentStep" />

      <div class="flex flex-col">
        <section class="flex min-h-[400px] w-full flex-col items-center text-center">
          <div class="w-full max-w-3xl">
            <OnboardingStepOne
              v-show="currentStep === 0"
              :model-value="cycleLength"
              @update:model-value="cycleLength = $event"
            />

            <OnboardingStepTwo
              v-show="currentStep === 1"
              :model-value="cycleStartDate"
              @update:model-value="cycleStartDate = $event"
            />

            <OnboardingStepThree v-show="currentStep === 2" @finish="finishOnboarding" />
          </div>
        </section>

        <div
          v-if="currentStep < steps.length - 1"
          class="mx-auto mt-12 grid w-full max-w-3xl grid-cols-2 items-center gap-4"
        >
          <AppButton
            v-if="currentStep > 0"
            variant="secondary"
            class="justify-self-start px-6 text-base"
            @click="goToPreviousStep"
          >
            Previous
          </AppButton>
          <div v-else />

          <AppButton
            v-if="currentStep < steps.length - 1"
            class="w-auto justify-self-end"
            :disabled="!canGoNext"
            @click="goToNextStep"
          >
            Next
          </AppButton>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import AppButton from '@/components/generic/AppButton.vue'
import AppTimeline from '@/components/generic/AppTimeline.vue'
import OnboardingStepOne from '@/components/view/onboarding/OnboardingStepOne.vue'
import OnboardingStepThree from '@/components/view/onboarding/OnboardingStepThree.vue'
import OnboardingStepTwo from '@/components/view/onboarding/OnboardingStepTwo.vue'
import { useOnboarding } from '@/composables/useOnboarding'
import { useAuth } from '@/services/auth-service'
import { saveOnboardingProfile } from '@/services/profile-service'

const router = useRouter()
const {
  canGoNext,
  currentStep,
  cycleLength,
  cycleStartDate,
  finishOnboarding: saveOnboardingState,
  goToNextStep,
  goToPreviousStep,
  steps,
} = useOnboarding()
const { currentUser } = useAuth()

const finishOnboarding = async () => {
  const onboarding = saveOnboardingState()
  const user = currentUser.value

  if (!onboarding || !user) {
    return
  }

  await saveOnboardingProfile(user.uid, onboarding)
  await router.push({ name: 'calendar' })
}
</script>
