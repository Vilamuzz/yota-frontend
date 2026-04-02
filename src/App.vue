<script setup lang="ts">
import { onMounted } from 'vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { useTheme } from '@/composables/ui/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <RouterView />
  <ToastNotification />
</template>

<style scoped></style>
