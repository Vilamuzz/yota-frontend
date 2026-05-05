<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Heart, Plus, RotateCcw, Trash2, Eye } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useSocialProgramTransactionList } from '@/composables/socialProgramTransaction/useSocialProgramTransactionList'
import { useSocialProgramTransactionDelete } from '@/composables/socialProgramTransaction/useSocialProgramTransactionDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import DetailModal from '@/components/organisms/DetailModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { SocialProgramTransaction } from '@/types/socialProgramTransaction'
import type { SocialProgramTransactionQueryParams } from '@/types/socialProgramTransaction'
import { getStatusColor } from '@/utils/statusColor'

const router = useRouter()
const { showToast } = useToast()
const socialProgramId = router.currentRoute.value.params.id as string
const { deleteMutation } = useSocialProgramTransactionDelete()

const queryParams = reactive<SocialProgramTransactionQueryParams>({
  limit: 10,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedTransactionId = ref<string | null>(null)
const selectedTransaction = ref<SocialProgramTransaction | null>(null)

const { socialProgramTransactions, pagination, isLoading } = useSocialProgramTransactionList(
  socialProgramId,
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

function openDetailModal(transaction: SocialProgramTransaction) {
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
    <template #title>Transaksi Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseFilter
            v-model="queryParams.status"
            :options="[
              { label: 'Semua Status', value: undefined },
              { label: 'Success', value: 'settlement' },
              { label: 'Pending', value: 'pending' },
              { label: 'Failed', value: 'failure' },
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
            name: 'dashboard-social-programs-transaction-create',
            params: { id: socialProgramId },
          }"
          class="w-full sm:w-auto"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Transaksi Offline
        </BaseButton>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat transaksi program sosial..."
        :is-empty="socialProgramTransactions.length === 0"
        empty-message="Tidak ada data transaksi"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Heart :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
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
            v-for="(transaction, index) in socialProgramTransactions"
            :key="transaction.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate text-gray-600 dark:text-gray-200"
            >
              {{ transaction.orderId || '-' }}
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
      title="Detail Transaksi Program Sosial"
      @close="isDetailModalOpen = false"
    >
      <div v-if="selectedTransaction" class="grid grid-cols-[140px_auto] gap-y-4 gap-x-2 text-sm">
        <div class="text-gray-500 dark:text-gray-400 font-medium">Order ID</div>
        <div class="text-gray-900 dark:text-white font-bold break-all">
          : {{ selectedTransaction.orderId || '-' }}
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
      variant="danger"
      :primary-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </DashboardLayout>
</template>
