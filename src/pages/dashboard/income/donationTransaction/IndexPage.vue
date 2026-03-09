<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { SquarePen, HandHeart, Plus } from 'lucide-vue-next'
import { formatCurrency, formatDate } from '@/utils/format'
import { useDonationTransactionList } from '@/composables/donationTransaction/useDonationTransactionList'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import type { DonationTransaction, DonationTransactionParams } from '@/types/donationTransaction'

const router = useRouter()

const donation_id = router.currentRoute.value.params.id as string

const selectedStatus = ref('all')
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

const queryParams = computed<DonationTransactionParams>(() => {
  const params: DonationTransactionParams = { limit: limit.value, donation_id: donation_id }

  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value
  }

  return params
})

// Fetch donations via composable
const { donationTransactionListQuery } = useDonationTransactionList(queryParams.value)
const transactions = computed<DonationTransaction[]>(
  () => donationTransactionListQuery.data.value?.data?.transactions || [],
)
const pagination = computed(() => donationTransactionListQuery.data.value?.data?.pagination)

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'completed':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'closed':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Transaksi Donasi</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <!-- Search and Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseButton
                variant="primary"
                :to="{ name: 'dashboard-donation-transaction-create', params: { id: donation_id } }"
              >
                <Plus :size="20" class="mr-1" />
                Tambah Transaksi Donasi
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="donationTransactionListQuery.isPending.value"
        loading-message="Loading donation transactions..."
        :is-empty="transactions.length === 0"
        empty-message="No donation transactions available"
        :has-prev="pagination?.has_prev"
        :has-next="pagination?.has_next"
        v-model:limit="limit"
        :limit-options="limitOptions"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Metode Donasi
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Nominal Donasi
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Donasi
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Actions
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(transaction, index) in transactions"
            :key="transaction.id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate">
              {{ transaction.donor_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-center">
              {{ transaction.source ? 'Online' : 'Offline' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-right">
              {{ formatCurrency(transaction.gross_amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(transaction.transaction_status),
                ]"
              >
                {{
                  transaction.transaction_status.charAt(0).toUpperCase() +
                  transaction.transaction_status.slice(1)
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ formatDate(transaction.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center relative">
              <button
                :to="{ name: 'dashboard-donations-transaction-edit', params: { id: donation_id } }"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                title="Edit donation"
              >
                <SquarePen :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
