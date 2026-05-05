<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Trash2, HandHeart, Plus, RotateCcw } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useDonationProgramTransactionList } from '@/composables/donationProgramTransaction/useDonationProgramTransactionList'
import { useDonationProgramTransactionDelete } from '@/composables/donationProgramTransaction/useDonationProgramTransactionDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { DonationProgramTransactionQueryParams } from '@/types/donationProgramTransaction'
import { getStatusColor } from '@/utils/statusColor'

const router = useRouter()
const { showToast } = useToast()
const { deleteMutation } = useDonationProgramTransactionDelete()

const donationId = router.currentRoute.value.params.id as string

const queryParams = reactive<DonationProgramTransactionQueryParams>({
  limit: 10,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const selectedTransactionId = ref<string | null>(null)

const { donationProgramTransactions, pagination, isLoading } = useDonationProgramTransactionList(
  donationId,
  queryParams,
)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const hasActiveFilters = computed(() => queryParams.status !== undefined)

watch(
  () => [queryParams.status, queryParams.limit],
  () => resetPagination(),
)
function clearFilters() {
  queryParams.status = undefined
  resetPagination()
}

function openDeleteModal(id: string) {
  selectedTransactionId.value = id
  isDeleteModalOpen.value = true
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
    <template #title>Manajemen Transaksi Donasi</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseFilter
            v-model="queryParams.status"
            :options="[
              { label: 'Semua Status', value: undefined },
              { label: 'Success', value: 'success' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed', value: 'failed' },
            ]"
            class="w-full sm:w-48"
          />
          <BaseButton
            v-if="hasActiveFilters"
            variant="outline"
            class="whitespace-nowrap"
            @click="clearFilters"
          >
            <RotateCcw :size="16" class="mr-2" />
            Reset Filter
          </BaseButton>
        </div>

        <BaseButton
          variant="primary"
          :to="{
            name: 'dashboard-donation-programs-transaction-create',
            params: { id: donationId },
          }"
          class="w-full sm:w-auto"
        >
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
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate text-gray-600 dark:text-gray-200"
            >
              {{ transaction.donorName }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ transaction.isOnline ? 'Online' : 'Offline' }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
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
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
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

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Transaksi"
      message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
      variant="danger"
      :primary-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </DashboardLayout>
</template>
