<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye } from 'lucide-vue-next'
import BaseTable from '@/components/molecules/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const customerId = route.params.id as string
const customerData = route.query.customer ? JSON.parse(route.query.customer as string) : null

// ======================
// 👤 CUSTOMER DATA (Sesuai Foto: Annisa Salsabila)
// ======================
const customer = ref({
  name: customerData?.name || 'Annisa Salsabila',
  totalDonasi: customerData?.total_donation || 7500000,
  totalProgram: customerData?.total_program || 3
})

// ======================
// 📊 PROGRAM HISTORY DATA (Isi Tabel Sesuai Foto)
// ======================
const programHistory = ref([
  {
    id: 1, // 👈 TAMBAH INI
    no: 1,
    namaProgram: 'Santunan Rutin Anak Yatim Piatu & Dhuafa',
    status: 'Berjalan',
    donasiBulanIni: 500000,
    totalDonasiProgram: 5000000,
  },
  {
    id: 2,
    no: 2,
    namaProgram: "Jum'at Berkah Masjid Kota",
    status: 'Pending',
    donasiBulanIni: 500000,
    totalDonasiProgram: 500000,
  },
  {
    id: 3,
    no: 3,
    namaProgram: 'Sedekah Subuh',
    status: 'Selesai',
    donasiBulanIni: 500000,
    totalDonasiProgram: 2000000,
  },
])

// ======================
// 🔍 SEARCH & FILTER
// ======================
const search = ref('')
const filteredPrograms = computed(() => {
  return programHistory.value.filter((item) =>
    item.namaProgram.toLowerCase().includes(search.value.toLowerCase())
  )
})

// ======================
// 🎨 FORMATTERS
// ======================
const formatCurrency = (value: number) => {
  return 'Rp' + value.toLocaleString('id-ID')
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'berjalan':
      return 'bg-[#D1FAE5] text-[#10B981]' // Hijau
    case 'pending':
      return 'bg-[#FEF3C7] text-[#F8B641]' // Kuning/Oranye
    case 'selesai':
      return 'bg-[#FFE4E6] text-[#F43F5E]' // Merah Muda
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const handleBack = () => {
  router.push({ name: 'dashboard-social-program-customers' })
}

// ================== PAGINATION SETTINGS ==================
const limit = ref(10)
const limitOptions = [10, 25, 50]

const handleView = (program: any) => {
  router.push({
    name: 'dashboard-social-program-customers-detail-detail',
    params: {
      customerId: customerId,
      programId: program.id.toString(),
    },
    query: {
      program: JSON.stringify(program),
      customer: JSON.stringify(customer.value),
    },
  })
}

</script>

<template>
  <DashboardLayout>
    <div class="mt-6">

        <div class="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-5 flex items-center gap-4 shadow-sm">
        
        <!-- BACK BUTTON -->
        <button
            @click="handleBack"
            class="text-gray-600 hover:text-gray-900 transition"
        >
            <ArrowLeft :size="22" />
        </button>

        <!-- TITLE -->
        <h2 class="text-lg font-semibold text-gray-800">
            Detail Pelanggan: {{ customer.name }}
        </h2>

        </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        <div class="md:col-span-6 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h1 class="text-3xl font-bold text-gray-900">{{ customer.name }}</h1>
          <p class="text-sm text-gray-400 mt-1">Nama Pelanggan</p>
        </div>

        <div class="md:col-span-3 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 class="text-3xl font-bold text-green-700">
            {{ formatCurrency(customer.totalDonasi) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>

        <div class="md:col-span-3 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div class="flex items-baseline gap-2">
            <h3 class="text-4xl font-bold text-gray-900">{{ customer.totalProgram }}</h3>
            <span class="text-xl font-semibold text-gray-800">Program</span>
          </div>
          <p class="text-sm text-gray-400 mt-1">Total Program Diikuti</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        
        <div class="flex items-center justify-between mb-6">
          <div class="w-80">
            <BaseSearch v-model="search" placeholder="Cari Subscriber" />
          </div>

          <div class="flex items-center gap-3">
            <BaseFilter />
            <BaseButton variant="primary" class="!bg-[#0D6B44] hover:!bg-[#0a5636]">
              Export PDF
            </BaseButton>
          </div>
        </div>

        <div class="overflow-x-auto">
          <BaseTable
            :loading="false"
            :is-empty="filteredPrograms.length === 0"
            v-model:limit="limit"
            :limit-options="limitOptions"
          >
            <template #headers>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Program</th>
              <th class="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Program</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donasi Bulan Ini</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Donasi Program</th>
              <th class="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Riwayat</th>
            </template>

            <template #rows>
              <tr
                v-for="(item, index) in filteredPrograms"
                :key="index"
                class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-5 text-sm text-gray-600">{{ item.no }}</td>
                <td class="px-4 py-5 text-sm text-gray-700 font-medium">{{ item.namaProgram }}</td>
                <td class="px-4 py-5 text-center">
                  <span :class="['px-3 py-1 text-xs font-medium rounded-md', getStatusClass(item.status)]">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-4 py-5 text-sm text-gray-600">
                  {{ formatCurrency(item.donasiBulanIni) }}
                </td>
                <td class="px-4 py-5 text-sm font-bold text-green-600">
                  {{ formatCurrency(item.totalDonasiProgram) }}
                </td>
                <td class="px-4 py-5 text-center">
                  <button @click="handleView(item)" class="hover:text-gray-600">
                      <Eye :size="18" />
                    </button>
                </td>
              </tr>
            </template>
          </BaseTable>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Menyesuaikan style jika diperlukan agar benar-benar mirip */
:deep(.base-table th) {
  background-color: #fcfcfc;
}
</style>