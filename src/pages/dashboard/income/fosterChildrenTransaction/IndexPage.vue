<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import { Plus, Eye, Baby } from 'lucide-vue-next'
import type { DonationChild } from '@/types/donationChildren'

const router = useRouter()
const searchQuery = ref('')
const selectedMethod = ref('all')
const selectedStatus = ref('all')
const methods = ['all', 'Online', 'Offline']
const statuses = ['all', 'Menunggu Pembayaran', 'Berhasil', 'Gagal', 'Kedaluwarsa']

const clearFilters = () => {
  selectedMethod.value = 'all'
  selectedStatus.value = 'all'
}

const handleCreate = () => {
  router.push({ name: 'dashboard-foster-children-donations-create' })
}

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]
const pageOffset = ref(0)
const pagination = ref({
  has_prev: false,
  has_next: false,
})

const donationChildren = ref<DonationChild[]>([
  {
    id: '1',
    child_id: 'child1',
    order_id: 'order1',
    donor_name: 'Choi Youngjae',
    donor_email: 'choi@example.com',
    gross_amount: 50000,
    source: true,
    transaction_status: 'Berhasil',
    transaction_id: 'txn1',
    snap_token: 'snap1',
    paid_at: '2024-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    child_id: 'child2',
    order_id: 'order2',
    donor_name: 'Jung Woojin',
    donor_email: 'jung@example.com',
    gross_amount: 75000,
    source: false,
    transaction_status: 'Menunggu Pembayaran',
    transaction_id: 'txn2',
    snap_token: 'snap2',
    paid_at: null,
    created_at: '2024-01-02',
  },
])

const filteredDonationChildren = computed((): DonationChild[] => {
  return donationChildren.value.filter((donation: DonationChild) => {
    const matchesSearch = donation.donor_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const method = donation.source ? 'Online' : 'Offline'
    const matchesMethod = selectedMethod.value === 'all' || method === selectedMethod.value
    const matchesStatus = selectedStatus.value === 'all' || donation.transaction_status === selectedStatus.value

    return matchesSearch && matchesMethod && matchesStatus
  })
})

const paginatedDonationChildren = computed((): DonationChild[] => {
  const start = pageOffset.value * limit.value
  return filteredDonationChildren.value.slice(start, start + limit.value)
})

const handleView = (donation: DonationChild) => {
  router.push({
    name: 'dashboard-foster-children-donations-detail',
    params: { id: donation.id },
  })
}

watch([pageOffset, limit, filteredDonationChildren], () => {
  pagination.value.has_prev = pageOffset.value > 0
  pagination.value.has_next = (pageOffset.value + 1) * limit.value < filteredDonationChildren.value.length
}, { immediate: true })

watch(limit, () => {
  pageOffset.value = 0

  pagination.value.has_prev = false
  pagination.value.has_next = limit.value < filteredDonationChildren.value.length
})

watch(
  [searchQuery, selectedMethod, selectedStatus],
  () =>
    pageOffset.value = 0
)

const handlePrevPage = () => {
  if (pagination.value.has_prev) {
    pageOffset.value -= 1
  }
}

const handleNextPage = () => {
  if (pagination.value.has_next) {
    pageOffset.value += 1
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Berhasil':
      return 'bg-green-100 text-green-800'
    case 'Menunggu Pembayaran':
      return 'bg-yellow-100 text-yellow-800'
    case 'Gagal':
      return 'bg-red-100 text-red-800'
    case 'Kedaluwarsa':
      return 'bg-gray-100 text-gray-800'
    default:
      return ''
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Riwayat Donasi Anak Asuh</template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Cari riwayat donasi..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="
                  selectedMethod !== 'all' || selectedStatus !== 'all'
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

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="status in statuses" :key="status" :value="status">
                          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
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

              <BaseButton variant="primary" @click="handleCreate">
                <Plus :size="20" class="mr-1" />
                Tambah Donasi Anak Asuh
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseTable
      class="mt-6"
      :loading="false"
      loading-message="Memuat data riwayat donasi anak asuh..."
      :is-empty="filteredDonationChildren.length === 0"
      empty-message="Tidak ada riwayat donasi anak asuh yang ditemukan."
      :has-prev="pagination?.has_prev"
      :has-next="pagination?.has_next"
      v-model.limit="limit"
      :limit-options="limitOptions"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <Baby :size="64" class="text-gray-400" />
      </template>

      <template #headers>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">No</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Nama Donatur</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Nominal Donasi</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Metode Donasi</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Tanggal Donasi</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Status</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(donationChild, index) in paginatedDonationChildren"
          :key="donationChild.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins max-w-50 truncate">
            {{ donationChild.donor_name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            Rp {{ donationChild.gross_amount.toLocaleString('id-ID') }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ donationChild.source ? 'Online' : 'Offline' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ new Date(donationChild.created_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-poppins border',
                getStatusColor(donationChild.transaction_status),
              ]"
            >
              {{ donationChild.transaction_status.charAt(0).toUpperCase() + donationChild.transaction_status.slice(1) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <button
              @click="handleView(donationChild)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
            >
              <Eye :size="18" />
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </DashboardLayout>
</template>
