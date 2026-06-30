<script setup lang="ts">
import { computed } from 'vue'
import FinanceDashboard from '@/components/ui/FinanceDashboard.vue'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import { ROLES } from '@/const/roles'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AmbulanceManagerDashboard from '@/components/ui/AmbulanceManagerDashboard.vue'
import AmbulanceDriverDashboard from '@/components/ui/AmbulanceDriverDashboard.vue'
import PublicationManagerDashboard from '@/components/ui/PublicationManagerDashboard.vue'
import SuperadminDashboard from '@/components/ui/SuperadminDashboard.vue'

const authStore = useAuthStore()
const { user } = useCurrentUser()
const activeRole = computed(() => authStore.activeRole)
</script>

<template>
  <DashboardLayout>
    <template #title>Dashboard</template>

    <div class="space-y-6">
      <!-- Welcome Card -->
      <FinanceDashboard v-if="activeRole === ROLES.FINANCE" />
      <AmbulanceManagerDashboard v-else-if="activeRole === ROLES.AMBULANCE_MANAGER" />
      <AmbulanceDriverDashboard v-else-if="activeRole === ROLES.AMBULANCE_DRIVER" />
      <PublicationManagerDashboard v-else-if="activeRole === ROLES.PUBLICATION_MANAGER" />
      <SuperadminDashboard v-else-if="activeRole === ROLES.SUPERADMIN" />
      <div
        v-else
        class="bg-white rounded-xl shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <h2 class="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
          Selamat datang kembali, {{ user?.username }}! 👋
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Berikut adalah aktivitas yang terjadi di akun Anda hari ini.
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>
