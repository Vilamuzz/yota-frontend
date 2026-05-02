<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Heart, Plus } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useSocialProgramTransactionList } from '@/composables/socialProgramTransaction/useSocialProgramTransactionList'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import type { SocialProgramTransactionQueryParams } from '@/types/socialProgramTransaction'

const router = useRouter()

const socialProgramId = router.currentRoute.value.params.id as string

const selectedStatus = ref('all')
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

const queryParams = computed<SocialProgramTransactionQueryParams>(() => {
  const params: SocialProgramTransactionQueryParams = { limit: limit.value }

  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value
  }

  return params
})

// Fetch social program transactions via composable
const { socialProgramTransactions, pagination, isLoading } = useSocialProgramTransactionList(
  socialProgramId,
  queryParams,
)

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'settlement':
    case 'capture':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case 'deny':
    case 'cancel':
    case 'failure':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case 'expire':
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Transaksi Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Heart :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau riwayat transaksi program sosial.
            </p>
          </div>
        </div>

        <BaseButton
          variant="primary"
          :to="{
            name: 'dashboard-social-programs-transaction-create',
            params: { id: socialProgramId },
          }"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Transaksi
        </BaseButton>
      </div>

      <!-- Transactions Table -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
      >
        <BaseTable
          :loading="isLoading"
          loading-message="Memuat data transaksi program sosial..."
          :is-empty="socialProgramTransactions.length === 0"
          empty-message="Tidak ada transaksi program sosial yang ditemukan."
          :has-prev="!!pagination?.prevCursor"
          :has-next="!!pagination?.nextCursor"
          v-model:limit="limit"
          :limit-options="limitOptions"
        >
          <template #empty-icon>
            <Heart :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
          </template>

          <template #headers>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              No
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Order ID
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Metode
            </th>
            <th
              class="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Nominal
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Tanggal
            </th>
            <th
              class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Status
            </th>
          </template>

          <template #rows>
            <tr
              v-for="(transaction, index) in socialProgramTransactions"
              :key="transaction.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium max-w-xs truncate text-gray-600 dark:text-gray-200"
              >
                {{ transaction.orderId || '-' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300"
              >
                {{ transaction.isOnline ? 'Online' : 'Offline' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-600 dark:text-gray-300"
              >
                {{ formatCurrency(transaction.grossAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300',
                    getStatusColor(transaction.transactionStatus),
                  ]"
                >
                  {{
                    transaction.transactionStatus.charAt(0).toUpperCase() +
                    transaction.transactionStatus.slice(1)
                  }}
                </span>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
