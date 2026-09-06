import { createRouter, createWebHistory } from 'vue-router'

import { initializeAuth, useAuth } from '@/services/auth-service'
import { isFirebaseConfigured } from '@/services/firebase'
import { migrateStoredOnboarding } from '@/services/profile-service'

const { currentUser } = useAuth()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresOnboarding: true },
    },
    {
      path: '/schedule-version',
      name: 'schedule-version',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
      meta: { requiresOnboarding: true },
    },
    {
      path: '/quarter',
      name: 'quarter',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
      meta: { requiresOnboarding: true },
    },
    {
      path: '/holidays',
      name: 'holidays',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
      meta: { requiresOnboarding: true },
    },
    {
      path: '/class-suspensions',
      name: 'class-suspensions',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
      meta: { requiresOnboarding: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/ConfigurationPlaceholderView.vue'),
      meta: { requiresOnboarding: true },
    },
  ],
})

router.beforeEach(async (to) => {
  await initializeAuth()

  if (!isFirebaseConfigured) {
    return to.name === 'login' ? true : { name: 'login' }
  }

  const user = currentUser.value

  if (!user) {
    return to.meta.public ? true : { name: 'login' }
  }

  const onboarding = await migrateStoredOnboarding(user.uid)

  if (to.name === 'login') {
    return onboarding ? { name: 'calendar' } : { name: 'onboarding' }
  }

  if (to.meta.requiresOnboarding && !onboarding) {
    return { name: 'onboarding' }
  }

  if (to.name === 'onboarding' && onboarding) {
    return { name: 'calendar' }
  }

  return true
})

export default router
