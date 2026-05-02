<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Heart } from 'lucide-vue-next'

import { useSocialProgramFilters } from '@/composables/socialProgram/useSocialProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { formatCurrency } from '@/utils/format'

const {
  queryParams,
  limitOptions,
  searchQuery,
  pageOffset,
  socialPrograms,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
  clearFilters,
} = useSocialProgramFilters()

const statuses = ['active', 'inactive']

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case 'inactive':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}
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
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Program Sosial</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pilih program sosial untuk melihat riwayat pengeluarannya.
            </p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <BaseSearch v-model="searchQuery" placeholder="Cari program sosial..." class="w-full sm:max-w-xs" />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                    >Status</label
                  >
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
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

      <!-- Social Programs Table -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
      >
        <BaseTable
          :loading="isLoading"
          loading-message="Memuat data program sosial..."
          :is-empty="socialPrograms.length === 0"
          empty-message="Tidak ada program sosial yang ditemukan."
          :has-prev="!!pagination?.prevCursor"
          :has-next="!!pagination?.nextCursor"
          v-model:limit="queryParams.limit"
          :limit-options="limitOptions"
          @prev="handlePrevPage"
          @next="handleNextPage"
        >
          <template #empty-icon>
            <Heart :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
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
              Minimal Iuran
            </th>
            <th
              class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Hari Penagihan
            </th>
            <th
              class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Aksi
            </th>
          </template>

          <template #rows>
            <tr
              v-for="(program, index) in socialPrograms"
              :key="program.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ pageOffset * queryParams.limit! + index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate"
              >
                {{ program.title }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-600 dark:text-gray-300"
              >
                {{ formatCurrency(program.minimumAmount) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300"
              >
                Tanggal {{ program.billingDay }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300',
                    getStatusColor(program.status),
                  ]"
                >
                  {{ program.status.charAt(0).toUpperCase() + program.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <RouterLink
                    :to="{
                      name: 'dashboard-social-programs-expense-transaction',
                      params: { id: program.id },
                    }"
                    class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                    title="Lihat Pengeluaran"
                  >
                    <Eye :size="18" />
                  </RouterLink>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
