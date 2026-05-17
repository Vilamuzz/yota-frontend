<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Users } from 'lucide-vue-next'

import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useSocialProgramSubscriberList } from '@/composables/socialProgramSubscription/useSocialProgramSubscriberList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramSubscriptionQueryParams } from '@/types/socialProgramSubscription'
import { formatCurrency } from '@/utils/format'

const queryParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
})

const { subscribers, pagination, isLoading } = useSocialProgramSubscriberList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

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
</script>

<template>
  <DashboardLayout>
    <template #title>Pelanggan Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari Pelanggan..."
            class="w-full sm:w-64"
          />
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data pelanggan..."
        :is-empty="subscribers.length === 0"
        empty-message="Tidak ada data pelanggan"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Users :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Total Program Diikuti
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Total Donasi
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Riwayat
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(item, index) in subscribers"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {{ item.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ item.email }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              {{ item.totalSubscription }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-300"
            >
              {{ formatCurrency(item.totalDonation) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <RouterLink
                  :to="{
                    name: 'dashboard-social-programs-subscribers-detail',
                    params: { id: item.id },
                  }"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Lihat detail"
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
