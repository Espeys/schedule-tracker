<template>
  <aside
    class="flex h-screen w-[270px] shrink-0 flex-col border-r border-white/25 bg-primary px-4 py-8"
    aria-label="Main navigation"
  >
    <div class="flex items-center gap-4 px-4 text-3xl font-bold text-white tracking-wider">
      <ArrowPathIcon class="size-10" aria-hidden="true" />
      <span>CYCLE</span>
    </div>

    <nav class="mt-8 space-y-8" aria-label="Schedule navigation">
      <section aria-labelledby="general-navigation-heading">
        <h2
          id="general-navigation-heading"
          class="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/65"
        >
          General
        </h2>

        <RouterLink
          :to="{ name: 'calendar' }"
          class="flex items-center gap-4 rounded-md px-4 py-3 text-sm font-normal text-white transition-colors hover:bg-white/15"
          active-class="!bg-white !text-primary !font-bold hover:!bg-white"
        >
          <CalendarDaysIcon class="size-4" aria-hidden="true" />
          <span>Calendar</span>
        </RouterLink>
      </section>

      <section aria-labelledby="configuration-navigation-heading">
        <h2
          id="configuration-navigation-heading"
          class="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-white/65"
        >
          Configuration
        </h2>

        <div class="space-y-1">
          <RouterLink
            v-for="item in configurationItems"
            :key="item.label"
            :to="{ name: item.routeName }"
            class="flex w-full items-center gap-4 rounded-md px-4 py-3 text-left text-sm font-normal text-white transition-colors hover:bg-white/15"
            active-class="!bg-white !text-primary !font-bold hover:!bg-white"
          >
            <component :is="item.icon" class="size-4" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </section>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  ArrowPathIcon,
  CakeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  NoSymbolIcon,
  Squares2X2Icon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import { RouterLink } from 'vue-router'

const configurationItems = [
  { label: 'Schedule Version', routeName: 'schedule-version', icon: ClipboardDocumentListIcon },
  { label: 'Quarter', routeName: 'quarter', icon: Squares2X2Icon },
  { label: 'Holidays', routeName: 'holidays', icon: CakeIcon },
  { label: 'Class Suspensions', routeName: 'class-suspensions', icon: NoSymbolIcon },
  { label: 'Categories', routeName: 'categories', icon: TagIcon },
]
</script>
