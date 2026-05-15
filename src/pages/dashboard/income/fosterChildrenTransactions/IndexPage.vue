<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Eye, HandHeart } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useFosterChildrenTransactionList } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionList'
import { useFosterChildrenTransactionDelete } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionDelete'
import { useFosterChildrenTransactionCreateOffline } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionCreateOffline'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import DetailModal from '@/components/organisms/DetailModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { FosterChildrenTransaction } from '@/types/fosterChildrenTransaction'
import type { FosterChildrenTransactionQueryParams } from '@/types/fosterChildrenTransaction'
import { getStatusColor } from '@/utils/statusColor'

const route = useRoute()
const { showToast } = useToast()
const childId = route.params.id as string

const queryParams = reactive<FosterChildrenTransactionQueryParams>({
  limit: 10,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedTransactionId = ref<string | null>(null)
const selectedTransaction = ref<FosterChildrenTransaction | null>(null)

const { fosterChildrenTransactions, pagination, isLoading } = useFosterChildrenTransactionList(
  childId,
  queryParams,
)
const { deleteMutation } = useFosterChildrenTransactionDelete()
const { createMutation } = useFosterChildrenTransactionCreateOffline()

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
  if (!grossAmount.value || Number(grossAmount.value) < 1000) {
    errors.value = { grossAmount: 'Nominal minimal Rp 1.000' }
    return
  }

  createMutation.mutate(
    {
      id: childId,
      data: {
        grossAmount: Number(grossAmount.value),
        donorName: donorName.value.trim() || undefined,
        donorEmail: donorEmail.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dicatat!', 'success')
        isCreateModalOpen.value = false
        resetForm()
      },
      onError: (err) => {
        showToast(
          extractError(err, 'Gagal mencatat transaksi offline. Silahkan coba lagi.'),
          'error',
        )
      },
    },
  )
}

const handleCreate = () => {
  isCreateModalOpen.value = true
}

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

watch(
  () => queryParams.limit,
  () => resetPagination(),
)

function openDeleteModal(id: string) {
  selectedTransactionId.value = id
  isDeleteModalOpen.value = true
}

function openDetailModal(transaction: FosterChildrenTransaction) {
  selectedTransaction.value = transaction
  isDetailModalOpen.value = true
}

function handleConfirmDelete() {
  if (selectedTransactionId.value) {
    deleteMutation.mutate(selectedTransactionId.value, {
      onSuccess: () => {
        showToast('Transaksi berhasil dihapus', 'success')
        isDeleteModalOpen.value = false
        selectedTransactionId.value = null
      },
      onError: () => {
        showToast('Gagal menghapus transaksi', 'error')
      },
    })
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
        <BaseButton variant="primary" @click="handleCreate">
          <Plus :size="20" class="mr-1" />
          Tambah Transaksi Offline
        </BaseButton>
      </div>

      <!-- Table Content -->

      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data riwayat donasi anak asuh..."
        :is-empty="fosterChildrenTransactions.length === 0"
        empty-message="Tidak ada riwayat donasi anak asuh yang ditemukan."
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
            v-for="(transaction, index) in fosterChildrenTransactions"
            :key="transaction.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-semibold max-w-50 truncate text-gray-900 dark:text-white"
            >
              {{ transaction.donorName || 'Anonim' }}
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
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ formatDate(transaction.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Lihat detail"
                  @click="openDetailModal(transaction)"
                >
                  <Eye :size="18" />
                </button>
                <button
                  class="p-1 hover:bg-red-50 text-red-500 rounded transition-colors duration-150 inline-block dark:hover:bg-red-900/20"
                  title="Hapus transaksi"
                  @click="openDeleteModal(transaction.id)"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Detail Modal -->
    <DetailModal
      :show="isDetailModalOpen"
      title="Detail Transaksi Dana Anak Asuh"
      @close="isDetailModalOpen = false"
    >
      <div v-if="selectedTransaction" class="grid grid-cols-[140px_auto] gap-y-4 gap-x-2 text-sm">
        <div class="text-gray-500 dark:text-gray-400 font-medium">ID Transaksi</div>
        <div class="text-gray-900 dark:text-white font-bold break-all">
          : {{ selectedTransaction.transactionId || selectedTransaction.orderId }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Nama Donatur</div>
        <div class="text-gray-900 dark:text-white font-bold">
          : {{ selectedTransaction.donorName || 'Anonim' }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Nominal Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">
          : {{ formatCurrency(selectedTransaction.grossAmount) }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Tanggal Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">
          : {{ formatDate(selectedTransaction.createdAt) }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Metode Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">
          : {{ selectedTransaction.isOnline ? 'Online' : 'Offline' }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Status</div>
        <div class="flex items-center gap-1">
          <span class="text-gray-900 dark:text-white font-bold mr-1">:</span>
          <span
            :class="[
              'px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border',
              getStatusColor(selectedTransaction.transactionStatus),
            ]"
          >
            {{ selectedTransaction.transactionStatus }}
          </span>
        </div>
      </div>
    </DetailModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Transaksi"
      message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
      danger-button-text="Ya, Hapus"
      :danger-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @danger="handleConfirmDelete"
      @secondary="isDeleteModalOpen = false"
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
