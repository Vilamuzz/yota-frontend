<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Trash2, Receipt, Plus, File, Eye } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useDonationProgramExpenseList } from '@/composables/donationProgramExpense/useDonationProgramExpenseList'
import { useDonationProgramExpenseDelete } from '@/composables/donationProgramExpense/useDonationProgramExpenseDelete'
import { useDonationProgramExpenseDetail } from '@/composables/donationProgramExpense/useDonationProgramExpenseDetail'
import { useDonationProgramAdminDetail } from '@/composables/donationProgram/useDonationProgramAdminDetail'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import ExpenseDetailModal from '@/components/molecules/ExpenseDetailModal.vue'
import FilePreviewModal from '@/components/molecules/FilePreviewModal.vue'
import type {
  DonationProgramExpense,
  DonationProgramExpenseQueryParams,
} from '@/types/donationProgramExpense'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const route = useRoute()
const { showToast } = useToast()
const donationId = route.params.id as string
const { deleteMutation } = useDonationProgramExpenseDelete(donationId)
const { detailQuery, isDonationLoading } = useDonationProgramAdminDetail(donationId)
const donation = computed(() => detailQuery.data.value?.data)

const queryParams = reactive<DonationProgramExpenseQueryParams>({
  limit: 10,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
  sortBy: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isFilePreviewModalOpen = ref(false)
const selectedFileUrl = ref<string | null>(null)
const selectedExpenseId = ref<string | null>(null)
const selectedExpenseDetail = ref<DonationProgramExpense | null>(null)
const selectedExpenseIdForDetail = ref<string>('')
const { detailQuery: expenseDetailQuery } = useDonationProgramExpenseDetail(
  selectedExpenseIdForDetail,
)
const modalExpenseData = computed(
  () => expenseDetailQuery.data.value?.data || selectedExpenseDetail.value,
)
const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { donationExpenses, pagination, isLoading } = useDonationProgramExpenseList(
  donationId,
  queryParams,
)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const hasActiveFilters = computed(
  () => queryParams.search !== undefined || queryParams.sortBy !== undefined,
)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.limit, queryParams.sortBy],
  () => resetPagination(),
)

function openDeleteModal(id: string) {
  selectedExpenseId.value = id
  isDeleteModalOpen.value = true
}

function openDetailModal(expense: DonationProgramExpense) {
  selectedExpenseDetail.value = expense
  selectedExpenseIdForDetail.value = expense.id
  isDetailModalOpen.value = true
}

function openFilePreviewModal(fileUrl: string) {
  selectedFileUrl.value = fileUrl
  isFilePreviewModalOpen.value = true
}

function handleConfirmDelete() {
  if (selectedExpenseId.value) {
    deleteMutation.mutate(selectedExpenseId.value, {
      onSuccess: () => {
        showToast('Pengeluaran berhasil dihapus', 'success')
        isDeleteModalOpen.value = false
        selectedExpenseId.value = null
      },
      onError: () => {
        showToast('Gagal menghapus pengeluaran', 'error')
      },
    })
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Pengeluaran Donasi</template>

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
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ formatCurrency(donation.collectedFund - (donation.totalExpense || 0)) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Sisa Saldo</p>
        </div>
      </div>
      <div v-else-if="isDonationLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchInput"
            placeholder="Cari pengeluaran..."
            class="flex-1 w-full"
          />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
                <!-- Sort filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-left"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama Dibuat</option>
                    <option value="title asc">Judul (A-Z)</option>
                    <option value="title desc">Judul (Z-A)</option>
                    <option value="amount asc">Nominal Terendah</option>
                    <option value="amount desc">Nominal Tertinggi</option>
                    <option value="expense_date desc">Tanggal Pengeluaran (Terbaru)</option>
                    <option value="expense_date asc">Tanggal Pengeluaran (Terlama)</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
        <BaseButton
          variant="primary"
          :to="{
            name: 'dashboard-donation-programs-expense-transaction-create',
            params: { id: donationId },
          }"
          class="w-full sm:w-auto justify-center"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Pengeluaran
        </BaseButton>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat pengeluaran donasi..."
        :is-empty="donationExpenses.length === 0"
        empty-message="Tidak ada data pengeluaran donasi"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Receipt :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Nominal
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Tanggal Pengeluaran
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Bukti</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(expense, index) in donationExpenses"
            :key="expense.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium max-w-xs truncate text-gray-600 dark:text-gray-200"
            >
              {{ expense.title }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ formatCurrency(expense.amount) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ formatDate(expense.expenseDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  variant="success"
                  v-if="expense.proofFile"
                  @click="openFilePreviewModal(expense.proofFile)"
                  title="Lihat bukti pengeluaran"
                >
                  <File :size="18" />
                </BaseIconButton>
                <span v-else class="text-gray-500 dark:text-gray-400">-</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  variant="primary"
                  @click="openDetailModal(expense)"
                  title="Lihat detail pengeluaran"
                >
                  <Eye :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  variant="danger"
                  title="Hapus pengeluaran"
                  @click="openDeleteModal(expense.id)"
                >
                  <Trash2 :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Pengeluaran"
      message="Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
      danger-button-text="Ya, Hapus"
      :danger-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @danger="handleConfirmDelete"
      @secondary="isDeleteModalOpen = false"
    />

    <!-- Expense Detail Modal -->
    <ExpenseDetailModal
      :show="isDetailModalOpen"
      :expense="modalExpenseData"
      @close="isDetailModalOpen = false"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
      :show="isFilePreviewModalOpen"
      :file-url="selectedFileUrl"
      @close="isFilePreviewModalOpen = false"
    />
  </DashboardLayout>
</template>
