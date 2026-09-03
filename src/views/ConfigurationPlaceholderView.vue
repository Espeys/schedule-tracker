<template>
  <div class="flex h-screen max-h-screen overflow-hidden bg-base-100">
    <TheSidebar v-if="isSidebarVisible" />

    <div class="flex min-w-0 flex-1 flex-col">
      <TheHeader @toggle-sidebar="isSidebarVisible = !isSidebarVisible" />

      <main class="min-h-0 flex-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheSidebar from '@/components/layout/TheSidebar.vue'

const isSidebarVisible = ref(true)
</script>
