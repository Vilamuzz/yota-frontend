<script setup lang="ts">
import PublicNavbar from '@/components/ui/PublicNavbar.vue'
import PublicFooter from '@/components/ui/PublicFooter.vue'
</script>

<template>
  <div class="min-h-screen">
    <PublicNavbar />

    <main class="font-poppins">
      <slot />
    </main>

    <PublicFooter />
  </div>
</template>
