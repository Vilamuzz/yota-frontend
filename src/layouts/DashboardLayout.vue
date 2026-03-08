<script setup lang="ts">
import AppSidebar from '@/layouts/partials/AppSidebar.vue'
import AppHeader from '@/layouts/partials/AppHeader.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <AppSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader />

      <main class="flex-1 overflow-y-auto bg-white font-sf-pro">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
