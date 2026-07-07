<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBackups } from '@/composables/backup/useBackups'
import { usePaymentMethods } from '@/composables/paymentMethod/usePaymentMethods'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import { formatCurrency } from '@/utils/format'
import { getZodErrors } from '@/utils/zodError'
import { updatePaymentMethodSchema } from '@/schemas/paymentMethod.schema'
import { PaymentMethodFeeType, type PaymentMethod } from '@/types/paymentMethod'
import {
  HardDrive,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  CreditCard,
  Edit,
} from 'lucide-vue-next'

const { paymentMethods, paymentMethodsQuery, updatePaymentMethodMutation } = usePaymentMethods()

const paymentMethodsError = computed(() => (paymentMethodsQuery.error.value as any)?.message || '')
const paymentMethodsLoading = computed(() => paymentMethodsQuery.isLoading.value)

// Modal states
const isEditModalOpen = ref(false)
const selectedMethod = ref<PaymentMethod | null>(null)
const feeType = ref<PaymentMethodFeeType>(PaymentMethodFeeType.Flat)
const feeValueDisplay = ref<number>(0)
const isActive = ref(true)
const validationErrors = ref<Record<string, string>>({})

const openEditModal = (method: PaymentMethod) => {
  selectedMethod.value = method
  feeType.value = method.feeType
  feeValueDisplay.value =
    method.feeType === PaymentMethodFeeType.Percentage
      ? Number((method.feeValue * 100).toFixed(2))
      : method.feeValue
  isActive.value = method.isActive
  validationErrors.value = {}
  isEditModalOpen.value = true
}

const getBackendFeeValue = () => {
  if (feeType.value === PaymentMethodFeeType.Percentage) {
    return feeValueDisplay.value / 100
  }
  return feeValueDisplay.value
}

const handleUpdatePaymentMethod = async () => {
  if (!selectedMethod.value) return

  const backendFeeValue = getBackendFeeValue()

  const result = updatePaymentMethodSchema.safeParse({
    feeType: feeType.value,
    feeValue: backendFeeValue,
    isActive: isActive.value,
  })

  if (!result.success) {
    validationErrors.value = getZodErrors(result)
    return
  }

  try {
    successMessage.value = ''
    await updatePaymentMethodMutation.mutateAsync({
      id: selectedMethod.value.id,
      data: {
        feeType: feeType.value,
        feeValue: backendFeeValue,
        isActive: isActive.value,
      },
    })
    successMessage.value = `Payment method ${selectedMethod.value.name} updated successfully!`
    isEditModalOpen.value = false
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Payment method update failed:', err)
  }
}

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

      <!-- Payment Methods Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <CreditCard class="text-primary-300" :size="24" />
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Configure transaction fees and active state for payment methods
            </p>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Error State -->
          <BaseAlert v-if="paymentMethodsError" type="error" title="Error loading payment methods">
            {{ paymentMethodsError }}
          </BaseAlert>

          <!-- Loading State -->
          <div v-if="paymentMethodsLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-300"></div>
          </div>

          <!-- Payment Methods List -->
          <div v-else-if="paymentMethods.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead
                class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Method Name
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Fee Type
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Fee Value
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
                >
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-200 font-medium">
                    {{ method.name }}
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">
                    {{ method.feeType }}
                  </td>
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-200 font-bold">
                    {{
                      method.feeType === PaymentMethodFeeType.Percentage
                        ? `${Number((method.feeValue * 100).toFixed(2))}%`
                        : formatCurrency(method.feeValue)
                    }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider',
                        method.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                      ]"
                    >
                      {{ method.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      @click="openEditModal(method)"
                      class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/40 transition duration-200 text-sm font-semibold"
                    >
                      <Edit :size="14" />
                      Configure
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <CreditCard class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
              No payment methods found
            </h4>
            <p class="mt-1 text-gray-600 dark:text-gray-400">
              Check database configuration or backend payment settings.
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Edit Payment Method Modal -->
    <BaseModal
      :show="isEditModalOpen"
      title="Configure Payment Method"
      description="Update transaction fee and toggle payment gateway availability."
      @close="isEditModalOpen = false"
    >
      <form @submit.prevent="handleUpdatePaymentMethod" class="space-y-5">
        <div class="space-y-4">
          <!-- Method Name (Readonly) -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
            >
              Method Name
            </label>
            <input
              type="text"
              :value="selectedMethod?.name"
              disabled
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed outline-none"
            />
          </div>

          <!-- Active State -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
            >
              Gateway Status
            </label>
            <label class="inline-flex items-center cursor-pointer gap-3">
              <input type="checkbox" v-model="isActive" class="sr-only peer" />
              <div
                class="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
              ></div>
              <span class="text-sm font-medium text-gray-900 dark:text-gray-300">
                {{ isActive ? 'Active (Visible to users)' : 'Inactive (Hidden from checkout)' }}
              </span>
            </label>
          </div>

          <!-- Fee Type -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
            >
              Fee Type
            </label>
            <select
              v-model="feeType"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option :value="PaymentMethodFeeType.Flat">Flat Fee (IDR)</option>
              <option :value="PaymentMethodFeeType.Percentage">Percentage Fee (%)</option>
            </select>
          </div>

          <!-- Fee Value -->
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
            >
              {{
                feeType === PaymentMethodFeeType.Percentage
                  ? 'Fee Percentage (%)'
                  : 'Fee Amount (IDR)'
              }}
            </label>
            <input
              type="number"
              v-model.number="feeValueDisplay"
              step="any"
              min="0"
              class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100 outline-none"
              :class="
                validationErrors.feeValue
                  ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-700'
              "
            />
            <p v-if="validationErrors.feeValue" class="mt-1 text-xs text-red-600 dark:text-red-500">
              {{ validationErrors.feeValue }}
            </p>
            <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span v-if="feeType === PaymentMethodFeeType.Percentage">
                Value will be saved as a fraction in the backend (e.g. 2% is saved as 0.02). Limit:
                0% to 5%.
              </span>
              <span v-else> Flat deduction amount per transaction. Limit: Rp 0 to Rp 10.000. </span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <BaseButton
            type="submit"
            variant="primary"
            :loading="updatePaymentMethodMutation.isPending.value"
          >
            Save Changes
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </DashboardLayout>
</template>
