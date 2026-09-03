import { createRouter, createWebHistory } from 'vue-router'

import { hasOnboardingData } from '@/composables/useOnboarding'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'onboarding',
      beforeEnter: () => {
        if (hasOnboardingData()) {
          return { name: 'calendar' }
        }

        return true
      },
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      beforeEnter: () => {
        if (!hasOnboardingData()) {
          return { name: 'onboarding' }
        }

        return true
      },
      component: () => import('@/views/CalendarView.vue'),
    },
    {
      path: '/schedule-version',
      name: 'schedule-version',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
    },
    {
      path: '/quarter',
      name: 'quarter',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
    },
    {
      path: '/holidays',
      name: 'holidays',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
    },
    {
      path: '/class-suspensions',
      name: 'class-suspensions',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
    },
  ],
})

export default router
