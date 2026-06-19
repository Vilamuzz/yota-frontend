<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Heart } from 'lucide-vue-next'
import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import type { SocialProgramQueryParams } from '@/types/socialProgram'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { getStatusColor } from '@/utils/statusColor'
import { formatDate, formatStatus } from '@/utils/format'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const statuses = Object.values(SocialProgramStatusEnum)

const queryParams = reactive<SocialProgramQueryParams>({
  limit: 10,
  page: 1,
  search: undefined,
  status: undefined,
  sortBy: undefined,
})

const limitOptions = [10, 25, 50, 100]

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const { socialPrograms, pagination, isLoading } = useSocialProgramList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  pagination,
)

watch(
  () => [queryParams.status, queryParams.sortBy, queryParams.limit],
  () => resetPagination(),
)

const hasActiveFilters = computed(
  () => queryParams.status !== undefined || queryParams.sortBy !== undefined,
)
</script>

<template>
  <DashboardLayout>
    <template #title>Data Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 justify-end items-start md:items-center">
        <!-- Search and Filter Controls -->
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari Program..." class="flex-1 w-full" />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </option>
                  </select>
                </div>

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

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data program..."
        :is-empty="socialPrograms.length === 0"
        empty-message="Tidak ada data program"
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
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Nama Program
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Total Subscriber
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Ditambahkan
          </th>
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
              class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ program.totalSubscribers }}
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(program.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-social-program-detail-subscriptions',
                    params: { id: program.id },
                  }"
                  title="Lihat detail"
                  variant="info"
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
