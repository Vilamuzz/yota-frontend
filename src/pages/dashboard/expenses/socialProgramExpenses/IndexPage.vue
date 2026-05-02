<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Heart, Plus, FileText } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useSocialProgramExpenseList } from '@/composables/socialProgramExpense'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import type { PaginationParams } from '@/types/response'

const router = useRouter()

const socialProgramId = router.currentRoute.value.params.id as string

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

const queryParams = computed<PaginationParams>(() => ({
  limit: limit.value,
}))

// Fetch social program expenses via composable
const { socialProgramExpenses, pagination, isLoading } = useSocialProgramExpenseList(
  socialProgramId,
  queryParams,
)
</script>

<template>
  <DashboardLayout>
    <template #title>Pengeluaran Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Heart :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Riwayat Pengeluaran</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau riwayat pengeluaran program sosial.
            </p>
          </div>
        </div>

        <BaseButton
          variant="primary"
          :to="{
            name: 'dashboard-social-programs-expense-transaction-create',
            params: { id: socialProgramId },
          }"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Pengeluaran
        </BaseButton>
      </div>

      <!-- Expenses Table -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
      >
        <BaseTable
          :loading="isLoading"
          loading-message="Memuat data pengeluaran program sosial..."
          :is-empty="socialProgramExpenses.length === 0"
          empty-message="Tidak ada pengeluaran program sosial yang ditemukan."
          :has-prev="!!pagination?.prevCursor"
          :has-next="!!pagination?.nextCursor"
          v-model:limit="limit"
          :limit-options="limitOptions"
        >
          <template #empty-icon>
            <FileText :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
          </template>

          <template #headers>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              No
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Judul
            </th>
            <th
              class="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Nominal
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Tanggal Pengeluaran
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Catatan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Tanggal Dibuat
            </th>
          </template>

          <template #rows>
            <tr
              v-for="(expense, index) in socialProgramExpenses"
              :key="expense.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate"
              >
                {{ expense.title }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-600 dark:text-gray-300"
              >
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(expense.expenseDate) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
              >
                {{ expense.note || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(expense.createdAt) }}
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
