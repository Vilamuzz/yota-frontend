<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft } from 'lucide-vue-next'
import BaseTable from '@/components/molecules/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()

const selectedStatus = ref('all')
const statuses = ['all', 'active', 'pending', 'inactive']

const clearFilters = () => {
  search.value = ''
  selectedStatus.value = 'all'
}

// ambil data program dari halaman sebelumnya
const program = route.query.subscription
  ? JSON.parse(route.query.subscription as string)
  : null

// ======================
// 💰 SUMMARY DATA (DUMMY)
// ======================
const summary = ref({
  totalSubscriber: 100,
  totalDanaTerkumpul: 12500000,
  totalDanaDigunakan: 2500000,
  totalDanaAkhir: 10000000,
})

// ======================
// 👥 SUBSCRIBER DATA
// ======================
const subscribers = ref([
  {
    name: 'Annisa Salsabila',
    status: 'active',
    lastDonation: 500000,
    lastDonationDate: '2026-02-05',
    totalDonation: 2500000,
    joinedAt: '2025-10-05',
  },
  {
    name: 'Amina Azzara',
    status: 'pending',
    lastDonation: 500000,
    lastDonationDate: '2026-02-09',
    totalDonation: 2500000,
    joinedAt: '2026-02-09',
  },
  {
    name: 'Balqis Soraya',
    status: 'inactive',
    lastDonation: 500000,
    lastDonationDate: '2026-01-09',
    totalDonation: 2500000,
    joinedAt: '2025-02-09',
  },
  {
    name: 'Dinar Asmita',
    status: 'active',
    lastDonation: 500000,
    lastDonationDate: '2026-02-09',
    totalDonation: 2500000,
    joinedAt: '2026-02-09',
  },
])

// ======================
// 🔍 SEARCH
// ======================
const search = ref('')

const filteredSubscribers = computed(() => {
  return subscribers.value.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const matchStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchSearch && matchStatus
  })
})

// ======================
// 🎨 FORMAT
// ======================
const formatCurrency = (value: number) => {
  return 'Rp' + value.toLocaleString('id-ID')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID')
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Sudah Donasi'
    case 'pending':
      return 'Belum Donasi'
    case 'inactive':
      return 'Tidak Aktif'
    default:
      return status
  }
}

// ======================
// 🔙 NAVIGATION
// ======================
const handleBack = () => {
  router.back()
}

// ================== PAGINATION ==================
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]
const pageOffset = ref(0)

const paginatedSubscribers = computed(() => {
  const start = pageOffset.value * limit.value
  return filteredSubscribers.value.slice(start, start + limit.value)
})

const hasNext = computed(() => {
  return (pageOffset.value + 1) * limit.value < filteredSubscribers.value.length
})

const hasPrev = computed(() => {
  return pageOffset.value > 0
})

const handleNextPage = () => {
  if (hasNext.value) pageOffset.value++
}

const handlePrevPage = () => {
  if (hasPrev.value) pageOffset.value--
}
</script>

<template>
  <DashboardLayout>
    <!-- TITLE -->
    <template #title>
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Detail Langganan Program</h1>
        <p class="text-sm text-gray-400 mt-1">Riwayat Langganan > Detail</p>
      </div>
    </template>

    <div class="mt-6">

      <!-- HEADER -->
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-5 flex items-center gap-4">
        <button @click="handleBack" class="text-gray-600 hover:text-gray-900">
          <ArrowLeft :size="24" />
        </button>

        <h2 class="text-lg font-semibold text-gray-800">
          {{ program?.name }}
        </h2>
      </div>

      <!-- SUMMARY CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-sm text-gray-500">Total Subscriber</p>
            <h3 class="text-3xl font-semibold mt-2">
            {{ summary.totalSubscriber }}
            </h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-sm text-gray-500">Total Dana Terkumpul</p>
            <h3 class="text-2xl font-semibold mt-2">
            {{ formatCurrency(summary.totalDanaTerkumpul) }}
            </h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-sm text-gray-500">Total Dana Digunakan</p>
            <h3 class="text-2xl font-semibold text-red-500 mt-2">
            {{ formatCurrency(summary.totalDanaDigunakan) }}
            </h3>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-gray-100">
            <p class="text-sm text-gray-500">Total Dana Akhir</p>
            <h3 class="text-2xl font-semibold mt-2">
            {{ formatCurrency(summary.totalDanaAkhir) }}
            </h3>
        </div>

        </div>

      <!-- TABLE -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">

        <!-- SEARCH + ACTION -->
        <div class="flex items-center justify-between mb-5">

        <h2 class="text-base font-semibold text-gray-700">
            Data Subscriber Program
        </h2>

        <div class="flex items-center gap-2">

            <!-- SEARCH -->
            <div class="w-64">
            <BaseSearch v-model="search" placeholder="Cari Subscriber" />
            </div>

            <!-- FILTER -->
            <BaseFilter :has-active-filters="selectedStatus !== 'all'">
            <template #default="{ closeDropdown }">
                <div class="space-y-4">
                
                <div>
                    <label class="text-xs text-gray-500">Status</label>
                    <select
                    v-model="selectedStatus"
                    class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                    <option v-for="status in statuses" :key="status" :value="status">
                        {{ status }}
                    </option>
                    </select>
                </div>

                <div class="flex gap-2">
                    <button
                    @click="clearFilters"
                    class="flex-1 text-sm border border-gray-200 py-2 rounded-lg hover:bg-gray-50"
                    >
                    Clear
                    </button>
                    <button
                    @click="closeDropdown"
                    class="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg"
                    >
                    Apply
                    </button>
                </div>

                </div>
            </template>
            </BaseFilter>

            <!-- EXPORT PDF -->
            <BaseButton variant="primary">
            Export PDF
          </BaseButton>

        </div>
        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto">
         <div class="overflow-hidden rounded-lg border border-gray-200">
  <BaseTable
    :loading="false"
    loading-message="Loading subscribers..."
    :is-empty="paginatedSubscribers.length === 0"
    empty-message="No subscribers available"
    :has-prev="hasPrev"
    :has-next="hasNext"
    v-model:limit="limit"
    :limit-options="limitOptions"
    @prev="handlePrevPage"
    @next="handleNextPage"
  >

    <!-- HEADER -->
    <template #headers>
      <th class="px-5 py-3 text-left">No</th>
      <th class="px-5 py-3 text-left">Nama</th>
      <th class="px-5 py-3 text-center">Status</th>
      <th class="px-5 py-3 text-left">Donasi Terakhir</th>
      <th class="px-5 py-3 text-left">Tanggal Donasi Terakhir</th>
      <th class="px-5 py-3 text-left">Total Donasi</th>
      <th class="px-5 py-3 text-left">Bergabung Sejak</th>
    </template>

    <!-- ROW -->
    <template #rows>
      <tr
        v-for="(item, index) in paginatedSubscribers"
        :key="index"
        class="border-t border-gray-100 hover:bg-gray-50"
      >
        <td class="px-5 py-4 text-sm text-gray-500">
          {{ pageOffset * limit + index + 1 }}
        </td>

        <td class="px-5 py-4 text-sm text-gray-700 font-medium">
          {{ item.name }}
        </td>

        <td class="px-5 py-4 text-center">
          <span
            :class="[
              'px-2.5 py-1 text-xs rounded-full',
              item.status === 'active'
                ? 'bg-[#D1FAE5] text-[#10B981]'
                : item.status === 'pending'
                ? 'bg-[#FEF3C7] text-[#F8B641]'
                : 'bg-[#FFE4E6] text-[#F43F5E]'
            ]"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </td>

        <td class="px-5 py-4 text-sm text-gray-600">
          {{ formatCurrency(item.lastDonation) }}
        </td>

        <td class="px-5 py-4 text-sm text-gray-500">
          {{ formatDate(item.lastDonationDate) }}
        </td>

        <td class="px-5 py-4 text-sm text-gray-600">
          {{ formatCurrency(item.totalDonation) }}
        </td>

        <td class="px-5 py-4 text-sm text-gray-500">
          {{ formatDate(item.joinedAt) }}
        </td>
      </tr>
    </template>

  </BaseTable>
</div>
        </div>

      </div>

    </div>
  </DashboardLayout>
</template>