<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { Plus, Eye, Baby } from 'lucide-vue-next'
import type { FosterChildrenTransaction } from '@/types/fosterChildrenTransaction'
import { formatCurrency, formatDate } from '@/utils/format'

const router = useRouter()

const queryParams = reactive({
  search: '',
  method: 'all',
  status: 'all',
  limit: 10,
  page: 1,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val
    queryParams.page = 1
  }, 500)
})

const limitOptions = [10, 25, 50, 100]
const methods = ['Online', 'Offline']
const statuses = ['Menunggu Pembayaran', 'Berhasil', 'Gagal', 'Kedaluwarsa']

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = ''
  queryParams.method = 'all'
  queryParams.status = 'all'
  queryParams.page = 1
}

const handleCreate = () => {
  router.push({ name: 'dashboard-foster-children-donations-create' })
}

const hasActiveFilters = computed(() => {
  return queryParams.method !== 'all' || queryParams.status !== 'all'
})

// Mock data (replace with API call when ready)
const fosterChildrenTransactions = ref<FosterChildrenTransaction[]>([
  {
    id: '1',
    fosterChildrenId: 'a',
    donorName: 'Choi Youngjae',
    donorEmail: 'choi@example.com',
    grossAmount: 50000,
    isOnline: true,
    orderId: '',
    transactionId: '',
    snapToken: '',
    transactionStatus: 'Berhasil',
    paidAt: '',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    fosterChildrenId: 'b',
    donorName: 'Ahmad Subarjo',
    donorEmail: 'ahmad@example.com',
    grossAmount: 150000,
    isOnline: false,
    orderId: '',
    transactionId: '',
    snapToken: '',
    transactionStatus: 'Menunggu Pembayaran',
    paidAt: '',
    createdAt: '2024-01-15T14:30:00Z',
  },
])

const filteredTransactions = computed((): FosterChildrenTransaction[] => {
  return fosterChildrenTransactions.value.filter((donation: FosterChildrenTransaction) => {
    const matchesSearch = donation.donorName.toLowerCase().includes(queryParams.search.toLowerCase())
    const method = donation.isOnline ? 'Online' : 'Offline'
    const matchesMethod = queryParams.method === 'all' || method === queryParams.method
    const matchesStatus =
      queryParams.status === 'all' || donation.transactionStatus === queryParams.status

    return matchesSearch && matchesMethod && matchesStatus
  })
})

const pageOffset = computed(() => queryParams.page - 1)

const paginatedTransactions = computed((): FosterChildrenTransaction[] => {
  const start = pageOffset.value * queryParams.limit
  return filteredTransactions.value.slice(start, start + queryParams.limit)
})

watch([() => queryParams.limit], () => {
  queryParams.page = 1
})

const handlePrevPage = () => {
  if (queryParams.page > 1) {
    queryParams.page--
  }
}

const handleNextPage = () => {
  if (queryParams.page * queryParams.limit < filteredTransactions.value.length) {
    queryParams.page++
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Berhasil':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case 'Menunggu Pembayaran':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case 'Gagal':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case 'Kedaluwarsa':
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Baby :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Riwayat Donasi Anak Asuh</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Kelola dan pantau riwayat donasi anak asuh.</p>
          </div>
        </div>
        
        <BaseButton variant="primary" @click="handleCreate">
          <Plus :size="20" class="mr-1" />
          Tambah Donasi
        </BaseButton>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <BaseSearch v-model="searchInput" placeholder="Cari nama donatur..." class="w-full sm:max-w-xs" />
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Metode Donasi
                  </label>
                  <select
                    v-model="queryParams.method"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Metode</option>
                    <option v-for="method in methods" :key="method" :value="method">
                      {{ method }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Semua Status</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Content -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
        <BaseTable
          :loading="false"
          loading-message="Memuat data riwayat donasi anak asuh..."
          :is-empty="filteredTransactions.length === 0"
          empty-message="Tidak ada riwayat donasi anak asuh yang ditemukan."
          :has-prev="queryParams.page > 1"
          :has-next="queryParams.page * queryParams.limit < filteredTransactions.length"
          v-model:limit="queryParams.limit"
          :limit-options="limitOptions"
          @prev="handlePrevPage"
          @next="handleNextPage"
        >
          <template #empty-icon>
            <Baby :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
          </template>

          <template #headers>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">No</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nama Donatur</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nominal Donasi</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Metode Donasi</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tanggal Donasi</th>
            <th class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aksi</th>
          </template>

          <template #rows>
            <tr
              v-for="(transaction, index) in paginatedTransactions"
              :key="transaction.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ pageOffset * queryParams.limit + index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate">
                {{ transaction.donorName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                {{ formatCurrency(transaction.grossAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ transaction.isOnline ? 'Online' : 'Offline' }}
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
                  {{ transaction.transactionStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <RouterLink
                  :to="{
                    name: 'dashboard-foster-children-transactions-detail',
                    params: { id: transaction.id },
                  }"
                  class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="Lihat Detail"
                >
                  <Eye :size="18" />
                </RouterLink>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
