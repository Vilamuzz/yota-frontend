<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, HandHeart, RotateCcw, Trash2, Eye } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useFosterChildrenTransactionList } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionList'
import { useFosterChildrenTransactionDelete } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import DetailModal from '@/components/organisms/DetailModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { FosterChildrenTransaction } from '@/types/fosterChildrenTransaction'
import type { FosterChildrenTransactionQueryParams } from '@/types/fosterChildrenTransaction'
import { getStatusColor } from '@/utils/statusColor'

const router = useRouter()

const queryParams = reactive<FosterChildrenTransactionQueryParams>({
  limit: 10,
  status: undefined,
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
    <template #title>Manajemen Transaksi Anak Asuh</template>

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

        <BaseButton variant="primary" @click="handleCreate">
          <Plus :size="20" class="mr-1" />
          Tambah Transaksi Offline
        </BaseButton>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <BaseSearch v-model="searchInput" placeholder="Cari nama donatur..." class="w-full sm:max-w-xs" />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Metode Donasi
                  </label>
                  <select
                    v-model="queryParams.method"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Metode</option>
                    <option v-for="method in methods" :key="method" :value="method">
                      {{ method }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Status</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Content -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
        <BaseTable
          :loading="false"
          loading-message="Memuat data riwayat donasi anak asuh..."
          :is-empty="filteredTransactions.length === 0"
          empty-message="Tidak ada riwayat donasi anak asuh yang ditemukan."
          :has-prev="queryParams.page > 1"
          :has-next="queryParams.page * queryParams.limit < filteredTransactions.length"
          v-model:limit="queryParams.limit"
          :limit-options="limitOptions"
          @prev="handlePrevPage"
          @next="handleNextPage"
        >
          <template #empty-icon>
            <Baby :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
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
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ transaction.donorName || 'Anonim' }}
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
      title="Detail Transaksi Dana Anak Asuh"
      @close="isDetailModalOpen = false"
    >
      <div v-if="selectedTransaction" class="grid grid-cols-[140px_auto] gap-y-4 gap-x-2 text-sm">
        <div class="text-gray-500 dark:text-gray-400 font-medium">ID Transaksi</div>
        <div class="text-gray-900 dark:text-white font-bold break-all">
          : {{ selectedTransaction.transactionId || selectedTransaction.orderId }}
        </div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Nama Donatur</div>
        <div class="text-gray-900 dark:text-white font-bold">: {{ selectedTransaction.donorName || 'Anonim' }}</div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Nominal Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">: {{ formatCurrency(selectedTransaction.grossAmount) }}</div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Tanggal Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">: {{ formatDate(selectedTransaction.createdAt) }}</div>

        <div class="text-gray-500 dark:text-gray-400 font-medium">Metode Donasi</div>
        <div class="text-gray-900 dark:text-white font-bold">: {{ selectedTransaction.isOnline ? 'Online' : 'Offline' }}</div>

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
  </DashboardLayout>
</template>
