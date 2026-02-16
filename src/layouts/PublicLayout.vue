<script setup lang="ts">
import PublicNavbar from '@/components/ui/PublicNavbar.vue'
import PublicFooter from '@/components/ui/PublicFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <PublicNavbar />

    <main>
      <slot />
    </main>

    <PublicFooter />
  </div>
</template>
