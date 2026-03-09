<script setup lang="ts">
import { computed } from 'vue'
import { useAuthGuard } from '@/composables/auth/useAuthGuard'

const props = defineProps<{
  requireAuth?: boolean
  roles?: string[]
}>()

const { isAuthenticated, hasAnyRole } = useAuthGuard()

const isAuthorized = computed(() => {
  const needsAuth = props.requireAuth || !!props.roles?.length
  if (!needsAuth) return true
  if (!isAuthenticated.value) return false
  if (props.roles?.length) return hasAnyRole(props.roles)
  return true
})
</script>

<template>
  <slot v-if="isAuthorized" />
  <slot v-else name="fallback">
    <!-- Default fallback: nothing rendered -->
  </slot>
</template>
