<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Trash2, Receipt, Plus, RotateCcw, File, Eye } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useFosterChildrenExpenseList } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseList'
import { useFosterChildrenExpenseDelete } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseDelete'
import { useFosterChildrenExpenseDetail } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseDetail'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import ExpenseDetailModal from '@/components/molecules/ExpenseDetailModal.vue'
import FilePreviewModal from '@/components/molecules/FilePreviewModal.vue'
import type { PaginationParams } from '@/types/response'
import type { FosterChildrenExpense } from '@/types/fosterChildrenExpense'
import { useAdminFosterChildrenDetail } from '@/composables/fosterChildren/useFosterChildrenAdminDetail'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const route = useRoute()
const { showToast } = useToast()
const { deleteMutation } = useFosterChildrenExpenseDelete()

const childId = route.params.id as string
const { detailQuery } = useAdminFosterChildrenDetail(childId)

const child = computed(() => detailQuery.data.value?.data)

const queryParams = reactive<PaginationParams>({
  limit: 10,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isFilePreviewModalOpen = ref(false)
const selectedFileUrl = ref<string | null>(null)
const selectedExpenseId = ref<string | null>(null)
const selectedExpenseDetail = ref<FosterChildrenExpense | null>(null)
const selectedExpenseIdForDetail = ref<string>('')
const { detailQuery: expenseDetailQuery } = useFosterChildrenExpenseDetail(
  selectedExpenseIdForDetail,
)
const modalExpenseData = computed(
  () => expenseDetailQuery.data.value?.data || selectedExpenseDetail.value,
)
const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { fosterChildrenExpenses, pagination, isLoading } = useFosterChildrenExpenseList(
  childId,
  queryParams,
)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const hasActiveFilters = computed(() => queryParams.search !== undefined)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => queryParams.limit,
  () => resetPagination(),
)

function clearFilters() {
  searchInput.value = ''
  queryParams.search = undefined
  resetPagination()
}

function openDeleteModal(id: string) {
  selectedExpenseId.value = id
  isDeleteModalOpen.value = true
}

function openDetailModal(expense: FosterChildrenExpense) {
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
    <template #title>Manajemen Pengeluaran Anak Asuh</template>

    <div class="space-y-6">
      <div
        v-if="child"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6"
      >
        <div class="flex flex-col">
          <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Anak Asuh</span>
          <span
            class="text-lg font-semibold text-gray-900 dark:text-white truncate"
            :title="child.name"
            >{{ child.name }}</span
          >
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Dana Terkumpul</span>
          <span class="text-lg font-semibold text-green-600 dark:text-green-400">{{
            formatCurrency(child.collectedFund)
          }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Dana Tersisa</span>
          <span class="text-lg font-semibold text-red-600 dark:text-red-400">{{
            formatCurrency(child.collectedFund - (child.totalExpense || 0))
          }}</span>
        </div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton
          variant="primary"
          :to="{
            name: 'dashboard-foster-children-expense-transaction-create',
            params: { id: childId },
          }"
          class="w-full sm:w-auto"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Pengeluaran
        </BaseButton>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchInput"
            placeholder="Cari pengeluaran..."
            class="w-full sm:w-64"
          />
          <BaseButton
            v-if="hasActiveFilters"
            variant="outline"
            class="whitespace-nowrap"
            @click="clearFilters"
          >
            <RotateCcw :size="16" class="mr-2" />
            Reset
          </BaseButton>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat pengeluaran anak asuh..."
        :is-empty="fosterChildrenExpenses.length === 0"
        empty-message="Tidak ada data pengeluaran anak asuh"
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
            v-for="(expense, index) in fosterChildrenExpenses"
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
                <button
                  v-if="expense.proofFile"
                  @click="openFilePreviewModal(expense.proofFile)"
                  class="p-1 hover:bg-green-50 text-green-500 rounded transition-colors duration-150 inline-block dark:hover:bg-green-900/20"
                  title="Lihat bukti pengeluaran"
                >
                  <File :size="18" />
                </button>
                <span v-else class="text-gray-500 dark:text-gray-400">-</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  @click="openDetailModal(expense)"
                  title="Lihat detail pengeluaran"
                  variant="primary"
                >
                  <Eye :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  title="Hapus pengeluaran"
                  @click="openDeleteModal(expense.id)"
                  variant="danger"
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
