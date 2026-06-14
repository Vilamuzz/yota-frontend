<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, HandHeart } from 'lucide-vue-next'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import {
  donationProgramCategoryOptions,
  donationProgramStatusOptions,
  formatDonationProgramCategory,
} from '@/types/donationProgram'
import { formatCurrency, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const {
  queryParams,
  limitOptions,
  searchQuery,
  pageOffset,
  donationPrograms: donationPrograms,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
} = useDonationProgramFilters()
</script>

<template>
  <DashboardLayout>
    <template #title>Donation Management</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <!-- Search and Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Search donations..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter :has-active-filters="hasActiveFilters">
                <template #default>
                  <div class="space-y-4 w-64">
                    <!-- Category filter -->
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                      >
                        Kategori
                      </label>
                      <select
                        v-model="queryParams.category"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Semua Kategori</option>
                        <option
                          v-for="category in donationProgramCategoryOptions"
                          :key="category.value"
                          :value="category.value"
                        >
                          {{ category.label }}
                        </option>
                      </select>
                    </div>

                    <!-- Status filter -->
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                      >
                        Status
                      </label>
                      <select
                        v-model="queryParams.status"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Semua Status</option>
                        <option
                          v-for="status in donationProgramStatusOptions"
                          :key="status.value"
                          :value="status.value"
                        >
                          {{ status.label }}
                        </option>
                      </select>
                    </div>

                    <!-- Sort filter -->
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                      >
                        Urutkan
                      </label>
                      <select
                        v-model="queryParams.sortBy"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Bawaan (Terbaru)</option>
                        <option value="created_at asc">Terlama</option>
                        <option value="fund_target desc">Target Dana Tertinggi</option>
                        <option value="fund_target asc">Target Dana Terendah</option>
                        <option value="start_date desc">Tanggal Mulai (Terbaru)</option>
                        <option value="start_date asc">Tanggal Mulai (Terlama)</option>
                        <option value="end_date asc">Tanggal Selesai (Terdekat)</option>
                        <option value="end_date desc">Tanggal Selesai (Terlama)</option>
                      </select>
                    </div>
                  </div>
                </template>
              </BaseFilter>
            </div>
          </div>
        </div>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Loading donations..."
        :is-empty="donationPrograms.length === 0"
        empty-message="No donations available"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Target Dana
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Dana Terkumpul
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
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
              {{ formatDonationProgramCategory(donationProgram.category) }}
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
                {{ formatStatus(donationProgram.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-donation-programs-transaction',
                    params: { id: donationProgram.id },
                  }"
                  title="Lihat detail"
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
