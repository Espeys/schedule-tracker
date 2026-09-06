<template>
  <header
    class="flex items-center gap-4 border-b border-base-content/20 bg-base-100 pr-6 pl-3 py-3"
  >
    <AppButton variant="icon" aria-label="Toggle sidebar" @click="emit('toggle-sidebar')">
      <Bars3Icon class="size-5" aria-hidden="true" />
    </AppButton>

    <time
      class="ml-auto flex items-center gap-5 text-sm font-medium text-base-content"
      :datetime="now.toISOString()"
    >
      <span class="flex items-center gap-2">
        <CalendarDaysIcon class="size-4" aria-hidden="true" />
        {{ formattedDate }}
      </span>
      <span class="flex w-[7.5rem] items-center gap-2 tabular-nums">
        <ClockIcon class="size-4" aria-hidden="true" />
        {{ formattedTime }}
      </span>
    </time>

    <details class="dropdown dropdown-end">
      <summary
        class="btn btn-ghost btn-sm flex items-center gap-2 rounded-sm px-2 text-base-content shadow-none"
        aria-label="Open user menu"
      >
        <UserCircleIcon class="size-7" aria-hidden="true" />
        <ChevronDownIcon class="size-4" aria-hidden="true" />
      </summary>

      <ul class="dropdown-content menu z-20 mt-3 w-44 rounded-sm border border-base-content/15 bg-base-100 p-2 shadow-lg">
        <li>
          <button type="button" class="gap-3" @click="handleSignOut">
            <ArrowRightStartOnRectangleIcon class="size-4" aria-hidden="true" />
            Sign out
          </button>
        </li>
      </ul>
    </details>
  </header>
</template>

<script setup lang="ts">
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import { useNow } from '@vueuse/core'
import { computed } from 'vue'

import AppButton from '@/components/generic/AppButton.vue'
import { signOutUser } from '@/services/auth-service'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const router = useRouter()

const now = useNow({ interval: 1000 })

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
})

const formattedDate = computed(() => dateFormatter.format(now.value))
const formattedTime = computed(() => timeFormatter.format(now.value))

const handleSignOut = async () => {
  await signOutUser()
  await router.replace({ name: 'login' })
}
</script>
