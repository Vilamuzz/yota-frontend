<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBackups } from '@/composables/backup/useBackups'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { HardDrive, Plus, RefreshCw, Download, Trash2, Clock } from 'lucide-vue-next'

const {
  backups,
  backupsQuery,
  createBackupMutation,
  deleteBackupMutation,
  downloadBackup,
  isDownloading,
} = useBackups()

const backupsError = computed(() => (backupsQuery.error.value as any)?.message || '')
const backupsLoading = computed(() => backupsQuery.isPending.value)
const successMessage = ref('')

const handleCreateBackup = async () => {
  try {
    successMessage.value = ''
    await createBackupMutation.mutateAsync()
    successMessage.value = 'Backup created successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Backup creation failed:', err)
  }
}

const handleDeleteBackup = async (backupId: string) => {
  if (!confirm('Are you sure you want to delete this backup?')) return
  try {
    successMessage.value = ''
    await deleteBackupMutation.mutateAsync(backupId)
    successMessage.value = 'Backup deleted successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Backup deletion failed:', err)
  }
}

const handleDownloadBackup = async (backupId: string) => {
  try {
    await downloadBackup(backupId)
  } catch (err: any) {
    console.error('Backup download failed:', err)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}
</script>

<template>
  <DashboardLayout>
    <template #title>Settings</template>
    <!-- Success State -->
    <div class="max-w-4xl space-y-8">
      <!-- Success Message -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 transform translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-2"
      >
        <BaseAlert v-if="successMessage" type="success" dismissible>
          {{ successMessage }}
        </BaseAlert>
      </transition>

      <!-- Database Backups Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <HardDrive class="text-primary-300" :size="24" />
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Database Backups</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Create and manage database backups
            </p>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Create Backup Button -->
          <div class="flex gap-3">
            <BaseButton
              @click="handleCreateBackup"
              :disabled="createBackupMutation.isPending.value"
              :loading="createBackupMutation.isPending.value"
              variant="primary"
            >
              <Plus class="mr-2" :size="18" />
              Create Backup
            </BaseButton>

            <BaseButton
              @click="backupsQuery.refetch()"
              :disabled="backupsQuery.isFetching.value"
              variant="outline"
            >
              <RefreshCw class="mr-2" :size="18" />
              Refresh
            </BaseButton>
          </div>

          <!-- Error State -->
          <BaseAlert v-if="backupsError" type="error" title="Error loading backups">
            {{ backupsError }}
          </BaseAlert>

          <!-- Loading State -->
          <div v-if="backupsLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-300"></div>
          </div>

          <!-- Backups List -->
          <div v-else-if="backups.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead
                class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Created
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Duration
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="backup in backups"
                  :key="backup.id"
                  class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-200">
                    {{ formatDate(backup.createdAt) }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {{ formatFileSize(backup.size) }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span class="inline-flex items-center gap-1.5">
                      <Clock class="text-gray-400 dark:text-gray-500" :size="14" />
                      {{ formatDuration(backup.durationSeconds) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 space-x-2">
                    <button
                      @click="handleDownloadBackup(backup.id)"
                      :disabled="isDownloading"
                      class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 transition duration-200 text-sm font-medium"
                    >
                      <Download :size="14" />
                      Download
                    </button>
                    <button
                      @click="handleDeleteBackup(backup.id)"
                      :disabled="deleteBackupMutation.isPending.value"
                      class="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 transition duration-200 text-sm font-medium"
                    >
                      <Trash2 :size="14" />
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <HardDrive class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">No backups yet</h4>
            <p class="mt-1 text-gray-600 dark:text-gray-400">
              Create your first backup to get started.
            </p>
          </div>

          <!-- Backup Info -->
          <BaseAlert type="info" title="Backup Tips">
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li>Create regular backups to protect your data</li>
              <li>Download backups to store them locally</li>
              <li>Successful backups can be downloaded anytime</li>
              <li>Delete old backups to free up space</li>
            </ul>
          </BaseAlert>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
