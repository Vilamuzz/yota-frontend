<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye } from 'lucide-vue-next'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import { useSocialProgramSubscriber } from '@/composables/socialProgramSubscription/useSocialProgramSubscriber'
import { useSocialProgramSubscriptionListByAccount } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionListByAccount'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramSubscriptionQueryParams } from '@/types/socialProgramSubscription'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const subscriberId = route.params.id as string

const { subscriber, isLoading: isSubscriberLoading } = useSocialProgramSubscriber(subscriberId)

const queryParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
})

const {
  subscriptions,
  pagination,
  isLoading: isSubscriptionsLoading,
} = useSocialProgramSubscriptionListByAccount(subscriberId, queryParams)

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

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-[#D1FAE5] text-[#10B981] dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'inactive':
      return 'bg-[#FFE4E6] text-[#F43F5E] dark:bg-rose-900/30 dark:text-rose-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

const formatStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Aktif'
    case 'inactive':
      return 'Tidak Aktif'
    default:
      return status
  }
}

const handleBack = () => {
  router.push({ name: 'dashboard-social-programs-subscribers' })
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Search and Action Bar -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <button
          @click="handleBack"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft :size="22" />
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            Detail Pelanggan: {{ subscriber?.username || 'Memuat...' }}
          </h2>
        </button>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari Program..." class="w-full sm:w-64" />
          <BaseFilter />
        </div>
      </div>
      <!-- Stats Grid -->
      <div v-if="!isSubscriberLoading && subscriber" class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div
          class="md:col-span-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ subscriber.username }}
          </h1>
          <p class="text-sm text-gray-400 mt-1">Nama Pelanggan</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 class="text-3xl font-bold text-green-700 dark:text-green-500">
            {{ formatCurrency(subscriber.totalDonation) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div class="flex items-baseline gap-2">
            <h3 class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ subscriber.totalSubscription }}
            </h3>
            <span class="text-xl font-semibold text-gray-800 dark:text-gray-200">Program</span>
          </div>
          <p class="text-sm text-gray-400 mt-1">Total Program Diikuti</p>
        </div>
      </div>
      <div v-else-if="isSubscriberLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isSubscriptionsLoading"
        loading-message="Memuat data program..."
        :is-empty="subscriptions.length === 0"
        empty-message="Tidak ada data program"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Nama Program
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-32">
            Status Program
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Total Donasi Program
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Riwayat
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(item, index) in subscriptions"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {{ item.socialProgramTitle }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="['px-3 py-1 text-xs font-medium rounded-md', getStatusClass(item.status)]"
              >
                {{ formatStatus(item.status) }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-500"
            >
              {{ formatCurrency(item.totalDonation) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <RouterLink
                  :to="{
                    name: 'dashboard-social-programs-subscribers-program-detail',
                    params: {
                      subscriberId: subscriberId,
                      programId: item.id,
                    },
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
