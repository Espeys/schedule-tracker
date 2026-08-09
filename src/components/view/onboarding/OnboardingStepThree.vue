<template>
  <div class="flex w-full flex-col items-center gap-20 -mt-12">
    <div class="flex flex-col items-center gap-12">
      <img
        :src="onboardingAllSetImg"
        alt="Person sitting with a laptop, indicating the schedule workspace is ready"
        class="h-auto w-full max-w-[240px]"
      />

      <div class="flex flex-col items-center gap-4 text-center">
        <h1 class="text-4xl font-bold text-secondary">We&apos;re all set!</h1>
        <p class="max-w-2xl text-lg leading-8">
          Your scheduling workspace has been prepared. Continue to start creating class schedules,
          managing events, and organizing your calendar.
        </p>
      </div>
    </div>
    <AppButton class="min-w-48" @click="emit('finish')">Let&apos;s go!</AppButton>
  </div>
</template>

<script setup lang="ts">
import onboardingAllSetImg from '@/assets/img/onboarding-all-set.png'
import AppButton from '@/components/generic/AppButton.vue'

const emit = defineEmits<{ finish: [] }>()
</script>
