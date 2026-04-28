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

// Get data dari query parameter
const programData = route.query.program ? JSON.parse(route.query.program as string) : null
const customerData = route.query.customer ? JSON.parse(route.query.customer as string) : null

// ======================
// 📄 PROGRAM & CUSTOMER INFO
// ======================
const programTitle = ref(programData?.namaProgram || 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan')
const customer = ref({
  name: customerData?.name || 'Annisa Salsabila',
  joinedDate: '1 Januari 2026',
  totalDonasi: programData?.totalDonasiProgram || 5000000
})

// ======================
// 🗓️ BILLING HISTORY DATA (Sesuai Foto)
// ======================
const billingHistory = ref([
  { no: 1, tagihan: 'Tagihan Bulan Oktober - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '10/02/2026', pukul: '6:55PM' },
  { no: 2, tagihan: 'Tagihan Bulan September - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '09/05/2026', pukul: '6:55PM' },
  { no: 3, tagihan: 'Tagihan Bulan Agustus - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '08/06/2026', pukul: '6:55PM' },
  { no: 4, tagihan: 'Tagihan Bulan Juli - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '07/05/2026', pukul: '6:55PM' },
  { no: 5, tagihan: 'Tagihan Bulan Juni - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '06/08/2026', pukul: '6:55PM' },
  { no: 6, tagihan: 'Tagihan Bulan Mei - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '05/09/2026', pukul: '6:55PM' },
  { no: 7, tagihan: 'Tagihan Bulan April - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '04/12/2026', pukul: '6:55PM' },
  { no: 8, tagihan: 'Tagihan Bulan Maret - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '03/10/2026', pukul: '6:55PM' },
  { no: 9, tagihan: 'Tagihan Bulan Februari - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '02/5/2026', pukul: '6:55PM' },
  { no: 10, tagihan: 'Tagihan Bulan Januari - Santunan Rutin Anak Yatim Piatu & Dhuafa', jumlah: 500000, tanggal: '01/12/2026', pukul: '6:55PM' },
])

// ======================
// 🔍 SEARCH
// ======================
const search = ref('')
const filteredHistory = computed(() => {
  return billingHistory.value.filter((item) =>
    item.tagihan.toLowerCase().includes(search.value.toLowerCase())
  )
})

// ======================
// 🎨 FORMATTERS
// ======================
const formatCurrency = (value: number) => {
  return 'Rp' + value.toLocaleString('id-ID')
}

const customerId = route.params.customerId as string

const handleBack = () => {
  router.push({
    name: 'dashboard-social-program-customers-detail',
    params: { id: customerId },
    query: { customer: JSON.stringify(customerData) },
  })
}

// ================== PAGINATION ==================
const limit = ref(10)
const limitOptions = [10, 25, 50]
</script>

<template>
  <DashboardLayout>
    <template #title>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft :size="18" class="cursor-pointer" @click="handleBack" />
        <span>Riwayat Pelanggan</span>
        <span class="text-gray-300">></span>
        <span class="text-gray-800 font-medium">Detail Pelanggan Program</span>
      </div>
    </template>

    <div class="mt-6">
      
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-5 flex items-center gap-4 shadow-sm">
  
        <!-- BACK BUTTON -->
        <button
            @click="handleBack"
            class="text-gray-600 hover:text-gray-900 transition"
        >
            <ArrowLeft :size="22" />
        </button>

        <!-- PROGRAM TITLE -->
        <h2 class="text-lg font-semibold text-gray-800">
            {{ programTitle }}
        </h2>

        </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h1 class="text-3xl font-bold text-gray-900">{{ customer.name }}</h1>
          <p class="text-sm text-gray-400 mt-1">Bergabung sejak {{ customer.joinedDate }}</p>
        </div>

        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 class="text-3xl font-bold text-[#0D6B44]">
            {{ formatCurrency(customer.totalDonasi) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        
        <div class="flex items-center justify-between mb-6">
          <div class="w-80">
            <BaseSearch v-model="search" placeholder="Cari Riwayat" />
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
            :is-empty="filteredHistory.length === 0"
            v-model:limit="limit"
            :limit-options="limitOptions"
          >
            <template #headers>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Tagihan</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Jumlah</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal Pembayaran</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Pukul</th>
            </template>

            <template #rows>
              <tr
                v-for="(item, index) in filteredHistory"
                :key="index"
                class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-5 text-sm text-gray-500">{{ item.no }}</td>
                <td class="px-4 py-5 text-sm text-gray-500">{{ item.tagihan }}</td>
                <td class="px-4 py-5 text-sm font-bold text-[#10B981]">
                  {{ formatCurrency(item.jumlah) }}
                </td>
                <td class="px-4 py-5 text-sm text-gray-500">{{ item.tanggal }}</td>
                <td class="px-4 py-5 text-sm text-gray-500">{{ item.pukul }}</td>
              </tr>
            </template>
          </BaseTable>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Menyamakan background header tabel sesuai desain */
:deep(thead) {
  background-color: #F8FAFC;
}
</style>