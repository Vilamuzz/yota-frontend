<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, Calendar, CreditCard, Clock } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useSocialProgramInvoiceList } from '@/composables/socialProgramInvoice/useSocialProgramInvoiceList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramInvoiceQueryParams } from '@/types/socialProgramInvoice'
import { getStatusColor } from '@/utils/statusColor'
import { formatBillingPeriodLabel, formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { useSubscriptionDetail } from '@/composables/socialProgramSubscription/useSubscriptionDetail'

const route = useRoute()
const subscriptionId = route.params.subscriptionId as string

const { detailQuery, isLoading: isSubscriptionLoading } = useSubscriptionDetail(subscriptionId)
const subscription = computed(() => detailQuery.data.value?.data)

const queryParams = reactive<SocialProgramInvoiceQueryParams>({
  limit: 10,
  status: undefined,
})

const { invoices, pagination, isLoading } = useSocialProgramInvoiceList(subscriptionId, queryParams)
const { pageOffset, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

const limitOptions = [10, 25, 50, 100]
</script>

<template>
  <DashboardLayout>
    <template #title>Riwayat Tagihan Pelanggan</template>

    <div class="space-y-6">
      <!-- Stats Grid -->
      <div v-if="!isSubscriptionLoading && subscription" class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div class="md:col-span-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ subscription.username }}</h1>
          <p class="text-sm text-gray-400 mt-1">Nama Pelanggan</p>
        </div>
        <div class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 class="text-3xl font-bold text-green-700 dark:text-green-500">
            {{ formatCurrency(subscription.totalDonation) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>
        <div class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div class="flex items-baseline gap-2">
            <h3 class="text-4xl font-bold text-gray-900 dark:text-white">{{ subscription.totalPaidPeriods }}</h3>
            <span class="text-xl font-semibold text-gray-800 dark:text-gray-200">Bulan</span>
          </div>
          <p class="text-sm text-gray-400 mt-1">Lama Berlangganan</p>
        </div>
      </div>
      <div v-else-if="isSubscriptionLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data tagihan..."
        :is-empty="invoices.length === 0"
        empty-message="Tidak ada tagihan ditemukan"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <FileText :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Periode</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nominal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Jatuh Tempo</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dibuat Pada</th>
        </template>

        <template #rows>
          <tr
            v-for="(invoice, index) in invoices"
            :key="invoice.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Calendar :size="14" class="text-gray-400" />
                {{ formatBillingPeriodLabel(invoice.billingPeriod, invoice.createdAt) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <CreditCard :size="14" class="text-gray-400" />
                {{ formatCurrency(invoice.minimumAmount) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wider', getStatusColor(invoice.status)]">
                {{ formatStatus(invoice.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <Clock :size="14" class="text-gray-400" />
                {{ formatDate(invoice.dueDate) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(invoice.createdAt) }}
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
