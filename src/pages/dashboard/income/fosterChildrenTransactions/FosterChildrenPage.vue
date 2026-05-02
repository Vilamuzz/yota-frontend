<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, CirclePoundSterling } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import { useFosterChildrenTransactionList } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionList'
import type { FosterChildrenTransactionQueryParams } from '@/types/fosterChildrenTransaction'
import type { FosterChildrenTransaction } from '@/types/fosterChildrenTransaction'

const router = useRouter()
const route = useRoute()

const id = computed(() => route.params.id as string)

const childrenMap: Record<string, string> = {
  child1: 'Faris Ahad',
  child2: 'Tia Mutiara',
}

const dummyTransactions = ref<FosterChildrenTransaction[]>([
  {
    id: '1',
    fosterChildrenId: 'child1',
    orderId: 'order1',
    donorName: 'Choi Youngjae',
    donorEmail: 'choi@example.com',
    grossAmount: 50000,
    isOnline: true,
    transactionStatus: 'Berhasil',
    transactionId: 'txn1',
    snapToken: 'snap1',
    paidAt: '2024-01-01',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    fosterChildrenId: 'child2',
    orderId: 'order2',
    donorName: 'Jung Woojin',
    donorEmail: 'jung@example.com',
    grossAmount: 75000,
    isOnline: false,
    transactionStatus: 'Menunggu Pembayaran',
    transactionId: 'txn2',
    snapToken: 'snap2',
    paidAt: null,
    createdAt: '2024-01-02',
  },
   {
    id: '3',
    fosterChildrenId: 'child1',
    orderId: 'order2',
    donorName: 'Jang Juwang',
    donorEmail: 'jang@example.com',
    grossAmount: 100000,
    isOnline: true,
    transactionStatus: 'Menunggu Pembayaran',
    transactionId: 'txn2',
    snapToken: 'snap2',
    paidAt: null,
    createdAt: '2024-01-02',
  },
])

const useDummy = ref(true) // ubah ke false kalau mau pakai API

const transactionsSource = computed(() => {
  return useDummy.value
    ? dummyTransactions.value
    : fosterChildrenTransactions.value
})

const incomeData = computed(() => {
  const map = new Map()
  transactionsSource.value.forEach((trx: FosterChildrenTransaction) => {

    const date = new Date(trx.createdAt)

    const period = date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    })

    const key = `${trx.fosterChildrenId}-${period}`

    if (!map.has(key)) {
      map.set(key, {
        id: trx.fosterChildrenId,
        name: childrenMap[trx.fosterChildrenId] || 'Tidak diketahui', // sementara (atau mapping ke nama anak)
        totalTransactions: 0,
        totalAmount: 0,
        period,
      })
    }

    const item = map.get(key)
    item.totalTransactions += 1
    item.totalAmount += trx.grossAmount
  })

  return Array.from(map.values())
})

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedMethod = ref('all')
const methods = ['all', 'Online', 'Offline']

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
  }, 500)
})

// Cursor pagination state
const currentNextCursor = ref<string | undefined>(undefined)
const currentPrevCursor = ref<string | undefined>(undefined)
const direction = ref<'next' | 'prev' | undefined>(undefined)
const pageOffset = ref(0)

const queryParams = computed<FosterChildrenTransactionQueryParams>(() => {
  const params: FosterChildrenTransactionQueryParams = { limit: limit.value }

  if (direction.value === 'next' && currentNextCursor.value) {
    params.nextCursor = currentNextCursor.value
  } else if (direction.value === 'prev' && currentPrevCursor.value) {
    params.prevCursor = currentPrevCursor.value
  }

  if (debouncedSearchQuery.value) {
    params.search = debouncedSearchQuery.value
  }

  if (selectedMethod.value !== 'all') {
  params.isOnline = selectedMethod.value === 'Online'
  }

  return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedMethod, limit], () => {
  resetPagination()
})


const { fosterChildrenTransactionListQuery, fosterChildrenTransactions, pagination } = useFosterChildrenTransactionList(id, queryParams)

const displayChildren = computed(() => incomeData.value)

const handleNextPage = () => {
  if (pagination.value?.nextCursor) {
    currentNextCursor.value = pagination.value.nextCursor
    direction.value = 'next'
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.prevCursor) {
    currentPrevCursor.value = pagination.value.prevCursor
    direction.value = 'prev'
    pageOffset.value -= 1
  }
}

const clearFilters = () => {
  searchQuery.value = ''
}

type IncomeItem = {
  id: string
  name: string
  totalTransactions: number
  totalAmount: number
  period: string
}

const handleView = (child: IncomeItem) => {
    router.push({
      name: 'dashboard-foster-children-transaction-detail',
      params: { id: child.id },
    })
}

</script>

<template>
  <DashboardLayout>
    <template #title>Pemasukan Anak Asuh </template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Cari anak asuh..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="
                  selectedMethod !== 'all'
                "
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Metode Donasi</label>
                      <select
                        v-model="selectedMethod"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="method in methods" :key="method" :value="method">
                          {{ method.charAt(0).toUpperCase() + method.slice(1) }}
                        </option>
                      </select>
                    </div>


                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </template>
              </BaseFilter>

            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseTable
      class="mt-6"
      :loading="fosterChildrenTransactionListQuery.isPending.value && displayChildren.length === 0"
      loading-message="Memuat data pemasukkan anak asuh..."
      :is-empty="displayChildren.length === 0"
      empty-message="Tidak ada pemasukkan anak asuh yang ditemukan."
      :has-prev="!!pagination?.prevCursor"
      :has-next="!!pagination?.nextCursor"
      v-model:limit="limit"
      :limit-options="limitOptions"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <CirclePoundSterling :size="64" class="text-gray-400" />
      </template>

      <template #headers>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">No</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">
          Nama Anak Asuh
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Jumlah Pemasukkan
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Total Pemasukkan</th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Periode
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in displayChildren"
          :key="child.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins capitalize">
            {{ child.totalTransactions }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            Rp{{ child.totalAmount.toLocaleString('id-ID') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.period }}
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-center relative">
            <button
              @click="handleView(child)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
              title="Lihat Detail"
            >
              <Eye :size="18" />
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </DashboardLayout>
</template>
