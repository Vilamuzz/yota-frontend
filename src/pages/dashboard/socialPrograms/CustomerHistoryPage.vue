<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye } from 'lucide-vue-next'

import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'

// ================== ROUTER ==================
const router = useRouter()

// ================== STATE ==================
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedProgram = ref('all')

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
  { id: 1, name: 'Annisa Salsabila', total_program: 2, total_donation: 2500000 },
  { id: 2, name: 'Amina Azzara', total_program: 3, total_donation: 2500000 },
  { id: 3, name: 'Balqis Soraya', total_program: 2, total_donation: 2500000 },
  { id: 4, name: 'Dinar Asmita', total_program: 4, total_donation: 2500000 },
  { id: 5, name: 'Anastarika Kiara', total_program: 1, total_donation: 2500000 },
  { id: 6, name: 'Eira Alma', total_program: 1, total_donation: 2500000 },
  { id: 7, name: 'Fatihah Putri', total_program: 4, total_donation: 2500000 },
  { id: 8, name: 'Anisa Azzara', total_program: 2, total_donation: 2500000 },
  { id: 9, name: 'Amelia Puspita', total_program: 1, total_donation: 2500000 },
  { id: 10, name: 'Wirdyanto Bagaswara', total_program: 1, total_donation: 2500000 },
])

// ================== FILTER ==================
const filteredData = computed(() => {
  return allData.value.filter((item) =>
    item.name.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase())
  )
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

watch([debouncedSearchQuery, limit], () => {
  pageOffset.value = 0
})

// ================== FORMAT ==================
const formatCurrency = (value: number) => {
  return 'Rp' + value.toLocaleString('id-ID')
}

// ================== VIEW DETAIL ==================
const handleView = (customer: any) => {
  router.push({
    name: 'dashboard-social-program-customers-detail',
    params: { id: customer.id.toString() },
    query: { customer: JSON.stringify(customer) },
  })
}

// ================== FILTER ==================
const clearFilters = () => {
  searchQuery.value = ''
}
</script>

<template>
  <DashboardLayout>
    <!-- TITLE -->
    <template #title>
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Riwayat Pelanggan</h1>
        <p class="text-sm text-gray-400 mt-1">
          Manajemen Program > Riwayat Pelanggan
        </p>
      </div>
    </template>

    <!-- CONTAINER -->
    <div class="mt-6 bg-gray-50 p-5 rounded-2xl">
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-5">

        <!-- TOP BAR (SAMA PERSIS STYLE REFERENSI) -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-gray-700">
            Data Riwayat Pelanggan Program Sosial
          </h2>

          <div class="flex items-center gap-2">
            <!-- SEARCH -->
            <div class="w-64">
              <BaseSearch v-model="searchQuery" placeholder="Cari Pelanggan" />
            </div>

            <!-- FILTER (opsional, biar konsisten UI) -->
            <BaseFilter :has-active-filters="false">
              <template #default="{ closeDropdown }">
                <div class="space-y-4">
                  <p class="text-sm text-gray-500">Belum ada filter tambahan</p>

                  <button
                    @click="closeDropdown"
                    class="w-full text-sm bg-green-600 text-white py-2 rounded-lg"
                  >
                    Tutup
                  </button>
                </div>
              </template>
            </BaseFilter>
          </div>
        </div>

        <!-- TABLE -->
        <div class="overflow-hidden rounded-lg border border-gray-200">
          <BaseTable
            :loading="false"
            loading-message="Loading customers..."
            :is-empty="paginatedData.length === 0"
            empty-message="No customers available"
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
              <th class="px-5 py-3 text-right">Total Program Diikuti</th>
              <th class="px-5 py-3 text-right">Total Donasi</th>
              <th class="px-5 py-3 text-center">Riwayat</th>
            </template>

            <!-- ROW -->
            <template #rows>
              <tr
                v-for="(item, index) in paginatedData"
                :key="item.id"
                class="border-t border-gray-100 hover:bg-gray-50"
              >
                <td class="px-5 py-4 text-sm text-gray-500">
                  {{ pageOffset * limit + index + 1 }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-700 font-medium">
                  {{ item.name }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-600 text-right">
                  {{ item.total_program }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-600 text-right">
                  {{ formatCurrency(item.total_donation) }}
                </td>

                <td class="px-5 py-4">
                  <div class="flex justify-center items-center text-gray-400">
                    <button @click="handleView(item)" class="hover:text-gray-600">
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
</template>