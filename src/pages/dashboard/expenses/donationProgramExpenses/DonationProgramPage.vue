<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, HandHeart } from 'lucide-vue-next'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { DonationProgramCategoryEnum, DonationProgramStatusEnum } from '@/types/donationProgram'
import { formatCurrency, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

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

const formatCategory = (cat: DonationProgramCategoryEnum) => {
  if (cat === DonationProgramCategoryEnum.EDUCATION) return 'Pendidikan'
  if (cat === DonationProgramCategoryEnum.HEALTH) return 'Kesehatan'
  if (cat === DonationProgramCategoryEnum.ENVIRONMENT) return 'Lingkungan'
  if (cat === DonationProgramCategoryEnum.SOCIAL) return 'Sosial'
  if (cat === DonationProgramCategoryEnum.DISASTER) return 'Bencana'
  if (cat === DonationProgramCategoryEnum.HUMANITY) return 'Kemanusiaan'
  if (cat === DonationProgramCategoryEnum.OTHER) return 'Lainnya'
  return cat
}
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
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <!-- Category filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Kategori
                  </label>
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ formatCategory(category) }}
                    </option>
                  </select>
                </div>

                <!-- Status filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ formatStatus(status) }}
                    </option>
                  </select>
                </div>

                <!-- Sort filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="title asc">Judul (A-Z)</option>
                    <option value="title desc">Judul (Z-A)</option>
                    <option value="fund_target desc">Target Dana Tertinggi</option>
                    <option value="fund_target asc">Target Dana Terendah</option>
                    <option value="start_date desc">Tanggal Mulai (Terbaru)</option>
                    <option value="start_date asc">Tanggal Mulai (Terlama)</option>
                    <option value="end_date asc">Tanggal Selesai (Terdekat)</option>
                    <option value="end_date desc">Tanggal Selesai (Terlama)</option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-300 text-white rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
                  >
                    APPLY
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
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
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
              {{ formatCategory(donationProgram.category) }}
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
                    name: 'dashboard-donation-programs-expense-transaction',
                    params: { id: donationProgram.id },
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
