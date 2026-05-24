<script setup lang="ts">
import { useRoute } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye } from 'lucide-vue-next'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import { useSocialProgramSubscriber } from '@/composables/socialProgramSubscription/useSocialProgramSubscriber'
import { useSocialProgramSubscriptionListByAccount } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionListByAccount'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramSubscriptionQueryParams } from '@/types/socialProgramSubscription'
import { formatCurrency, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const route = useRoute()
const subscriberId = route.params.subscriberId as string

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
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
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

      <!-- Search and Action Bar -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari Program..." class="w-full sm:w-64" />
          <BaseFilter />
        </div>
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
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Lama Berlangganan
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
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(item.status),
                ]"
              >
                {{ formatStatus(item.status) }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-500"
            >
              {{ formatCurrency(item.totalDonation) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600 dark:text-green-500"
            >
              {{ item.totalPaidPeriods }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-social-program-subscribers-invoices',
                    params: {
                      subscriberId: subscriberId,
                      programId: item.id,
                    },
                  }"
                  title="Lihat Detail"
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
