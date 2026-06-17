<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Heart } from 'lucide-vue-next'

import { useSocialProgramFilters } from '@/composables/socialProgram/useSocialProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { formatCurrency, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

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
} = useSocialProgramFilters()
</script>

<template>
  <DashboardLayout>
    <template #title>Pengeluaran Program Sosial</template>

    <div class="space-y-6">
      <div class="flex flex-col md:flex-row gap-4 justify-end items-start md:items-center">
        <!-- Search and Filter Controls -->
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari program sosial..."
            class="flex-1 w-full"
          />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Urutkan</label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at desc">Terbaru</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="title asc">Nama (A-Z)</option>
                    <option value="title desc">Nama (Z-A)</option>
                    <option value="total_subscribers desc">Pelanggan Terbanyak</option>
                    <option value="total_subscribers asc">Pelanggan Paling Sedikit</option>
                    <option value="minimum_amount asc">Donasi Terendah</option>
                    <option value="minimum_amount desc">Donasi Tertinggi</option>
                    <option value="billing_day asc">Hari Tagihan Terawal</option>
                  </select>
                </div>

              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data program sosial..."
        :is-empty="socialPrograms.length === 0"
        empty-message="Tidak ada data program sosial"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <Heart :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Minimal Iuran
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Hari Penagihan
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(program, index) in socialPrograms"
            :key="program.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {{ program.title }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              {{ formatCurrency(program.minimumAmount) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              Tanggal {{ program.billingDay }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(program.status),
                ]"
              >
                {{ formatStatus(program.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-social-programs-expense-transaction',
                    params: { id: program.id },
                  }"
                  title="Lihat transaksi"
                  variant="primary"
                >
                  <Eye :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
