<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Trash2, Receipt, Plus, RotateCcw } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useFosterChildrenExpenseList } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseList'
import { useFosterChildrenExpenseDelete } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { PaginationParams } from '@/types/response'

const route = useRoute()
const { showToast } = useToast()
const { deleteMutation } = useFosterChildrenExpenseDelete()

const childId = route.params.id as string

const queryParams = reactive<PaginationParams>({
  limit: 10,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isDeleteModalOpen = ref(false)
const selectedExpenseId = ref<string | null>(null)
const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { fosterChildrenExpenses, pagination, isLoading } = useFosterChildrenExpenseList(childId, queryParams)

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
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Nominal</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
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
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              {{ formatCurrency(expense.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ formatDate(expense.expenseDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <button
                  class="p-1 hover:bg-red-50 text-red-500 rounded transition-colors duration-150 inline-block dark:hover:bg-red-900/20"
                  title="Hapus pengeluaran"
                  @click="openDeleteModal(expense.id)"
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
      title="Hapus Pengeluaran"
      message="Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
      danger-button-text="Ya, Hapus"
      :danger-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @danger="handleConfirmDelete"
      @secondary="isDeleteModalOpen = false"
    />
  </DashboardLayout>
</template>
