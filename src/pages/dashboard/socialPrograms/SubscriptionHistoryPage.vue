<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye } from 'lucide-vue-next'

import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'

// ================== ROUTER ==================
const router = useRouter()

// ================== STATE ==================
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedStatus = ref('all')
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

// ================== DEBOUNCE ==================
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = val
  }, 500)
})

// ================== DUMMY DATA ==================
const allData = ref([
  {
    id: 1,
    name: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    total_subscriber: 100,
    status: 'active',
    created_at: '2026-02-09',
  },
  {
    id: 2,
    name: 'Jum’at Berkah Masjid Kota',
    total_subscriber: 200,
    status: 'pending',
    created_at: '2026-02-09',
  },
  {
    id: 3,
    name: 'Sedekah Subuh',
    total_subscriber: 190,
    status: 'completed',
    created_at: '2026-02-09',
  },
  {
    id: 4,
    name: 'Bantuan Pendidikan Anak Dhuafa',
    total_subscriber: 120,
    status: 'active',
    created_at: '2026-02-10',
  },
  {
    id: 5,
    name: 'Program Kesehatan Gratis',
    total_subscriber: 80,
    status: 'completed',
    created_at: '2026-02-11',
  },
])

// ================== FILTER ==================
const filteredData = computed(() => {
  return allData.value.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(debouncedSearchQuery.value.toLowerCase())

    const matchStatus =
      selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchSearch && matchStatus
  })
})

// ================== PAGINATION ==================
const pageOffset = ref(0)

const paginatedData = computed(() => {
  const start = pageOffset.value * limit.value
  return filteredData.value.slice(start, start + limit.value)
})

const hasNext = computed(() => {
  return (pageOffset.value + 1) * limit.value < filteredData.value.length
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

watch([debouncedSearchQuery, selectedStatus, limit], () => {
  pageOffset.value = 0
})

// ================== STATUS STYLE ==================
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-[#D1FAE5] text-[#10B981] border-transparent'
    case 'pending':
      return 'bg-[#FEF3C7] text-[#F8B641] border-transparent'
    case 'completed':
      return 'bg-[#FFE4E6] text-[#F43F5E] border-transparent'
    default:
      return 'bg-gray-100 text-gray-600 border-transparent'
  }
}

// ================== FORMAT DATE ==================
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ================== DELETE ==================
const confirmShow = ref(false)
const selectedItem = ref<any>(null)

const deleteItem = (item: any) => {
  selectedItem.value = item
  confirmShow.value = true
}

const handleConfirmDelete = () => {
  allData.value = allData.value.filter((i) => i.id !== selectedItem.value.id)
  confirmShow.value = false
}

// ================== FILTER OPTION ==================
const statuses = ['all', 'active', 'pending', 'completed']

const clearFilters = () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  selectedStatus.value = 'all'
}

// ================== VIEW DETAIL ==================
const handleView = (subscription: any) => {
  router.push({
    name: 'dashboard-social-program-subscription-detail',
    params: { id: subscription.id.toString() },
    query: { subscription: JSON.stringify(subscription) },
  })
}
</script>

<template>
  <DashboardLayout>
    <!-- TITLE -->
    <template #title>
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Riwayat Langganan</h1>
        <p class="text-sm text-gray-400 mt-1">
          Manajemen Program > Riwayat Langganan
        </p>
      </div>
    </template>

    <!-- CONTAINER -->
    <div class="mt-6 bg-gray-50 p-5 rounded-2xl">
      <!-- CARD -->
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-5">

        <!-- TOP BAR (TIDAK UBAH LOGIC) -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-gray-700">
            Data Riwayat Langganan Program Sosial
          </h2>

          <div class="flex items-center gap-2">
            <!-- SEARCH (ASLI) -->
            <div class="w-64">
              <BaseSearch v-model="searchQuery" placeholder="Cari Program" />
            </div>

            <!-- FILTER (ASLI) -->
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

            <!-- ⚠️ TIDAK ADA TAMBAH BUTTON, BIAR LOGIC AMAN -->
          </div>
        </div>

        <!-- TABLE (100% ASLI, JANGAN DISENTUH) -->
        <div class="overflow-hidden rounded-lg border border-gray-200">
          <BaseTable
            :loading="false"
            loading-message="Loading programs..."
            :is-empty="paginatedData.length === 0"
            empty-message="No programs available"
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
              <th class="px-5 py-3 text-left">Nama Program</th>
              <th class="px-5 py-3 text-right">Total Subscriber</th>
              <th class="px-5 py-3 text-center">Status</th>
              <th class="px-5 py-3 text-left">Tanggal Ditambahkan</th>
              <th class="px-5 py-3 text-center">Aksi</th>
            </template>

            <!-- ROW -->
            <template #rows>
              <tr
                v-for="(program, index) in paginatedData"
                :key="program.id"
                class="border-t border-gray-100 hover:bg-gray-50"
              >
                <td class="px-5 py-4 text-sm text-gray-500">
                  {{ pageOffset * limit + index + 1 }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-700 font-medium">
                  {{ program.name }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-600 text-right">
                  {{ program.total_subscriber }}
                </td>

                <td class="px-5 py-4 text-center">
                  <span
                    :class="['px-2.5 py-1 text-xs rounded-full', getStatusColor(program.status)]"
                  >
                    {{
                      program.status === 'active'
                        ? 'Berjalan'
                        : program.status === 'pending'
                        ? 'Pending'
                        : program.status === 'completed'
                        ? 'Selesai'
                        : program.status
                    }}
                  </span>
                </td>

                <td class="px-5 py-4 text-sm text-gray-500">
                  {{ formatDate(program.created_at) }}
                </td>

                <td class="px-5 py-4">
                  <div class="flex justify-center items-center gap-3 text-gray-400">
                    <button @click="handleView(program)" class="hover:text-gray-600">
                      <Eye :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>
  </DashboardLayout>

  <!-- MODAL (ASLI) -->
  <ConfirmationModal
    :show="confirmShow"
    :title="`Delete ${selectedItem?.name}?`"
    message="This program will be permanently deleted."
    primary-button-text="Delete"
    secondary-button-text="Cancel"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>