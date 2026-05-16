<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, HandHeart } from 'lucide-vue-next'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { DonationProgramCategoryEnum, DonationProgramStatusEnum } from '@/types/donationProgram'
import { formatCurrency, formatDate } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'

const {
  queryParams,
  limitOptions,
  searchQuery,
  pageOffset,
  donationPrograms,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
  clearFilters,
} = useDonationProgramFilters()

const categories = Object.values(DonationProgramCategoryEnum)
const statuses = Object.values(DonationProgramStatusEnum)
</script>

<template>
  <DashboardLayout>
    <template #title>Pengeluaran Donasi</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari donasi..." class="w-full sm:w-64" />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Kategori</label
                  >
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data donasi..."
        :is-empty="donationPrograms.length === 0"
        empty-message="Tidak ada data donasi"
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
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Target Dana
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Dana Terkumpul
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Berakhir
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(donationProgram, index) in donationPrograms"
            :key="donationProgram.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate text-gray-600 dark:text-gray-200"
            >
              {{ donationProgram.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{
                donationProgram.category.charAt(0).toUpperCase() + donationProgram.category.slice(1)
              }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              {{ formatCurrency(donationProgram.fundTarget) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              {{ formatCurrency(donationProgram.collectedFund) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(donationProgram.status),
                ]"
              >
                {{
                  donationProgram.status.charAt(0).toUpperCase() + donationProgram.status.slice(1)
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ formatDate(donationProgram.endDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <RouterLink
                  :to="{
                    name: 'dashboard-donation-programs-expense-transaction',
                    params: { id: donationProgram.id },
                  }"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Lihat transaksi"
                >
                  <Eye :size="18" />
                </RouterLink>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
