<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { HandHeart, Plus, XCircle } from 'lucide-vue-next'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { useDonationProgramTransactionList } from '@/composables/donationProgramTransaction/useDonationProgramTransactionList'
import { useDonationProgramTransactionCancel } from '@/composables/donationProgramTransaction/useDonationProgramTransactionCancel'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import { createDonationProgramTransactionSchema } from '@/schemas/donationProgramTransaction.schema'
import { useDonationProgramTransactionCreateOffline } from '@/composables/donationProgramTransaction/useDonationProgramTransactionCreateOffline'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import {
  TransactionStatus,
  type DonationProgramTransactionQueryParams,
} from '@/types/donationProgramTransaction'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { useDonationProgramAdminDetail } from '@/composables/donationProgram'

const router = useRouter()
const { showToast } = useToast()
const { cancelMutation } = useDonationProgramTransactionCancel()
const { createMutation } = useDonationProgramTransactionCreateOffline()

const donationId = router.currentRoute.value.params.id as string

const { detailQuery, isDonationLoading } = useDonationProgramAdminDetail(donationId)
const donation = computed(() => detailQuery.data.value?.data)

const isCreateModalOpen = ref(false)
const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')
const errors = ref<Record<string, string>>({})
const isSubmitting = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

function resetForm() {
  donorName.value = ''
  donorEmail.value = ''
  grossAmount.value = ''
  errors.value = {}
}

function handleCreateTransaction() {
  const result = createDonationProgramTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
    donorName: donorName.value.trim(),
    donorEmail: donorEmail.value.trim(),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: donationId,
      data: {
        grossAmount: Number(grossAmount.value),
        donorName: donorName.value.trim() || undefined,
        donorEmail: donorEmail.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dibuat!', 'success')
        isCreateModalOpen.value = false
        resetForm()
      },
      onError: (err) => {
        const apiValidation = err.response?.data?.validation
        if (apiValidation) {
          const messages = Object.values(apiValidation).join(', ')
          if (messages) {
            showToast(messages, 'error')
            return
          }
        }
        showToast(
          extractError(err, 'Gagal membuat transaksi offline. Silahkan coba lagi.'),
          'error',
        )
      },
    },
  )
}

const queryParams = reactive<DonationProgramTransactionQueryParams>({
  limit: 10,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isCancelModalOpen = ref(false)
const selectedTransactionId = ref<string | null>(null)

const { donationProgramTransactions, pagination, isLoading } = useDonationProgramTransactionList(
  donationId,
  queryParams,
)

const { pageOffset, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

function openCancelModal(id: string) {
  selectedTransactionId.value = id
  isCancelModalOpen.value = true
}

function handleConfirmCancel() {
  if (selectedTransactionId.value) {
    cancelMutation.mutate(selectedTransactionId.value, {
      onSuccess: () => {
        showToast('Transaksi berhasil dibatalkan', 'success')
        isCancelModalOpen.value = false
        selectedTransactionId.value = null
      },
      onError: () => {
        showToast('Gagal membatalkan transaksi', 'error')
      },
    })
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Transaksi Donasi</template>

    <div class="space-y-6">
      <!-- Stats Grid -->
      <div v-if="!isDonationLoading && donation" class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div
          class="md:col-span-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ donation.title }}
          </h1>
          <p class="text-sm text-gray-400 mt-1">Program Donasi</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 class="text-3xl font-bold text-green-700 dark:text-green-500">
            {{ formatCurrency(donation.collectedFund) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <span
            :class="[
              'inline-flex items-center gap-1 px-3.5 py-0.5 rounded-full text-xl font-medium border',
              getStatusColor(donation.status),
            ]"
          >
            {{ formatStatus(donation.status) }}
          </span>
          <p class="text-sm text-gray-400 mt-1">Status Program Donasi</p>
        </div>
      </div>
      <div v-else-if="isDonationLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-start">
        <BaseButton variant="primary" class="w-full sm:w-auto" @click="isCreateModalOpen = true">
          <Plus :size="20" class="mr-1" />
          Tambah Transaksi Donasi
        </BaseButton>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat transaksi donasi..."
        :is-empty="donationProgramTransactions.length === 0"
        empty-message="Tidak ada data transaksi donasi"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Donatur</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Metode</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Nominal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(transaction, index) in donationProgramTransactions"
            :key="transaction.id"
            class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-semibold max-w-50 truncate text-gray-900 dark:text-white"
            >
              {{ transaction.donorName }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ transaction.isOnline ? 'Online' : 'Offline' }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-bold text-right text-gray-900 dark:text-white"
            >
              {{ formatCurrency(transaction.grossAmount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(transaction.transactionStatus),
                ]"
              >
                {{
                  transaction.transactionStatus.charAt(0).toUpperCase() +
                  transaction.transactionStatus.slice(1)
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
              {{ formatDate(transaction.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  v-if="
                    transaction.transactionStatus !== TransactionStatus.CANCEL &&
                    !transaction.isOnline
                  "
                  variant="danger"
                  @click="openCancelModal(transaction.id)"
                  title="Batalkan"
                >
                  <XCircle :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Cancel Confirmation Modal -->
    <ConfirmationModal
      :show="isCancelModalOpen"
      title="Batalkan Transaksi"
      message="Apakah Anda yakin ingin membatalkan transaksi ini? Saldo program donasi dan catatan keuangan akan disesuaikan secara otomatis."
      danger-button-text="Ya, Batalkan"
      :danger-button-loading="cancelMutation.isPending.value"
      @close="isCancelModalOpen = false"
      @danger="handleConfirmCancel"
      @secondary="isCancelModalOpen = false"
    />

    <!-- Create Transaction Modal -->
    <BaseModal
      :show="isCreateModalOpen"
      title="Tambah Transaksi Offline"
      description="Catat donasi yang diterima secara langsung."
      @close="isCreateModalOpen = false"
    >
      <form @submit.prevent="handleCreateTransaction" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="space-y-5">
            <!-- Amount -->
            <div>
              <label
                for="gross-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Amount (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="e.g. 100000"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100 outline-none"
                :class="
                  errors.grossAmount
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : ''
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.grossAmount" class="mt-1 text-xs text-red-600">
                {{ errors.grossAmount }}
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              Detail ini akan dicatat sebagai transaksi offline langsung ke sistem.
            </p>
          </div>

          <div class="space-y-5">
            <!-- Donor Name -->
            <BaseInput
              id="donor-name"
              v-model="donorName"
              label="Donor Name (Optional)"
              placeholder="e.g. Hamba Allah"
              :error="errors.donorName"
            />

            <!-- Donor Email -->
            <BaseInput
              id="donor-email"
              v-model="donorEmail"
              label="Donor Email (Optional)"
              placeholder="e.g. email@example.com"
              :error="errors.donorEmail"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <BaseButton
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            @click="isCreateModalOpen = false"
          >
            Batal
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isSubmitting">
            Catat Transaksi
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </DashboardLayout>
</template>
