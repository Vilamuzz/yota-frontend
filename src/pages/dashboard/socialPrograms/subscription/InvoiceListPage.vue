<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, ArrowLeft, Calendar, CreditCard, Clock } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useSocialProgramInvoiceList } from '@/composables/socialProgramInvoice/useSocialProgramInvoiceList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramInvoiceQueryParams } from '@/types/socialProgramInvoice'
import { InvoiceStatus } from '@/types/socialProgramInvoice'
import { getStatusColor } from '@/utils/statusColor'
import { formatCurrency, formatDate, formatMonth } from '@/utils/format'
import { useSocialProgramTransactionCreateOffline } from '@/composables/socialProgramTransaction/useSocialProgramTransactionCreateOffline'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import PayOfflineInvoiceModal from '@/components/molecules/PayOfflineInvoiceModal.vue'
import type { CreateSocialProgramTransactionRequest } from '@/types/socialProgramTransaction'
import type { SocialProgramInvoice } from '@/types/socialProgramInvoice'
import BaseButton from '@/components/atoms/BaseButton.vue'

const route = useRoute()
const subscriptionId = route.params.subscriptionId as string
const programId = route.params.id as string

const queryParams = reactive<SocialProgramInvoiceQueryParams>({
  limit: 10,
  status: undefined,
})

const { invoices, pagination, isLoading } = useSocialProgramInvoiceList(subscriptionId, queryParams)
const { pageOffset, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

const limitOptions = [10, 25, 50, 100]

// Offline Payment
const { showToast } = useToast()
const isPayModalOpen = ref(false)
const selectedInvoice = ref<SocialProgramInvoice>()
const { createMutation } = useSocialProgramTransactionCreateOffline()

const handleOpenPayModal = (invoice: SocialProgramInvoice) => {
  selectedInvoice.value = invoice
  isPayModalOpen.value = true
}

const handlePayOffline = (payload: CreateSocialProgramTransactionRequest) => {
  if (!selectedInvoice.value) return

  createMutation.mutate(
    {
      id: selectedInvoice.value.id,
      data: payload,
    },
    {
      onSuccess: () => {
        showToast('Pembayaran berhasil dicatat', 'success')
        isPayModalOpen.value = false
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal mencatat pembayaran', 'error')
      },
    },
  )
}

const getInvoiceStatusLabel = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.PAID:
      return 'Sudah Dibayar'
    case InvoiceStatus.PENDING:
      return 'Menunggu Pembayaran'
    case InvoiceStatus.OVERDUE:
      return 'Jatuh Tempo'
    default:
      return status
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Daftar Tagihan</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <RouterLink
          :to="{ name: 'dashboard-social-program-detail-subscriptions', params: { id: programId } }"
          class="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft :size="16" />
          Kembali ke Daftar Subscriber
        </RouterLink>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseFilter>
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option :value="InvoiceStatus.PAID">Sudah Dibayar</option>
                    <option :value="InvoiceStatus.PENDING">Menunggu Pembayaran</option>
                    <option :value="InvoiceStatus.OVERDUE">Jatuh Tempo</option>
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
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Jatuh Tempo
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Dibuat Pada
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
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
              <div
                class="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                <Calendar :size="14" class="text-gray-400" />
                Bulan {{ formatMonth(invoice.createdAt) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <CreditCard :size="14" class="text-gray-400" />
                {{ formatCurrency(invoice.minimumAmount) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
                  getStatusColor(invoice.status),
                ]"
              >
                {{ getInvoiceStatusLabel(invoice.status) }}
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
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <BaseButton
                v-if="invoice.status !== InvoiceStatus.PAID"
                variant="primary"
                size="sm"
                @click="handleOpenPayModal(invoice)"
              >
                Bayar Offline
              </BaseButton>
              <span v-else class="text-xs text-gray-400 dark:text-gray-500 font-medium"> - </span>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Pay Offline Modal -->
    <PayOfflineInvoiceModal
      :show="isPayModalOpen"
      :invoice="selectedInvoice"
      :loading="createMutation.isPending.value"
      @close="isPayModalOpen = false"
      @submit="handlePayOffline"
    />
  </DashboardLayout>
</template>
