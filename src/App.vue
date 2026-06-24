<script setup lang="ts">
import { onMounted, watch } from 'vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import { useTheme } from '@/composables/ui/useTheme'
import { useFoundationProfileStore } from '@/stores/foundationProfile'

const { initTheme } = useTheme()
const foundationProfileStore = useFoundationProfileStore()

onMounted(() => {
  initTheme()
  foundationProfileStore.fetchProfile()
})

// Dynamically update browser tab title
watch(
  () => foundationProfileStore.foundationName,
  (name) => {
    document.title = name
  },
  { immediate: true },
)

// Dynamically update browser favicon
watch(
  () => foundationProfileStore.icon,
  (iconUrl) => {
    if (!iconUrl) return
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = iconUrl
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ToastNotification />
</template>

<style scoped></style>
