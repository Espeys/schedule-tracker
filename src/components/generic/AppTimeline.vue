<template>
  <ol class="app-timeline" aria-label="Onboarding progress">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="app-timeline__step"
      :class="{
        'app-timeline__step--completed': index < currentStep,
      }"
    >
      <span
        class="app-timeline__marker"
        :class="markerClass(index)"
        :aria-current="index === currentStep ? 'step' : undefined"
      >
        <CheckCircleIcon v-if="index < currentStep" class="app-timeline__icon" aria-hidden="true" />
        <span v-else>{{ index + 1 }}</span>
      </span>

      <span class="app-timeline__label">{{ step }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  currentStep: number
  steps: string[]
}>()

const markerClass = (index: number) => ({
  'app-timeline__marker--completed': index < props.currentStep,
  'app-timeline__marker--active': index === props.currentStep,
  'app-timeline__marker--upcoming': index > props.currentStep,
})
</script>

<style scoped>
.app-timeline {
  display: flex;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

.app-timeline__step {
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  text-align: center;
}

.app-timeline__step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 0.8125rem;
  left: calc(50% + 1.5rem);
  width: calc(100% - 3rem);
  height: 0.375rem;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-base-content) 10%, white);
}

.app-timeline__step--completed:not(:last-child)::after {
  background-color: var(--color-primary);
}

.app-timeline__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
}

.app-timeline__marker--completed,
.app-timeline__marker--active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.app-timeline__marker--upcoming {
  background-color: color-mix(in srgb, var(--color-base-content) 8%, white);
  color: var(--color-base-content);
}

.app-timeline__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.app-timeline__label {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  line-height: 1.25;
  text-align: center;
}
</style>
