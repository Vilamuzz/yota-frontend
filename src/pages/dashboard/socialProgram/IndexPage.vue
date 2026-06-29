<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, Plus } from 'lucide-vue-next'

import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import { useQueryClient } from '@tanstack/vue-query'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { SocialProgram, SocialProgramParams } from '@/types/socialProgram'
import { ROLES } from '@/const/roles'

import { useRoute } from 'vue-router'

const route = useRoute()
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const router = useRouter()

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedStatus = ref('all')
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
  }, 500)
})

const currentNextCursor = ref<string | undefined>(undefined)
const currentPrevCursor = ref<string | undefined>(undefined)
const direction = ref<'next' | 'prev' | undefined>(undefined)
const pageOffset = ref(0)

const queryParams = computed<SocialProgramParams>(() => {
  const params: SocialProgramParams = { limit: limit.value }

  if (direction.value === 'next' && currentNextCursor.value) {
    params.next_cursor = currentNextCursor.value
  } else if (direction.value === 'prev' && currentPrevCursor.value) {
    params.prev_cursor = currentPrevCursor.value
  }

  if (debouncedSearchQuery.value) {
    params.search = debouncedSearchQuery.value
  }

  if (selectedStatus.value !== 'all') {
    // ✅ KS filter by status program, Ketua filter by submission_status
    if (isChairman.value) {
      params.submission_status = selectedStatus.value
    } else {
      params.status = selectedStatus.value
    }
  }

  return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedStatus, limit], () => {
  resetPagination()
})

const queryClient = useQueryClient()
const { socialProgramListQuery } = useSocialProgramList(queryParams)

const programs = computed<SocialProgram[]>(
  () => socialProgramListQuery.data.value?.data?.programs || [],
)
const pagination = computed(() => socialProgramListQuery.data.value?.data?.pagination)

const handleNextPage = () => {
  if (pagination.value?.has_next && pagination.value.next_cursor) {
    currentNextCursor.value = pagination.value.next_cursor
    direction.value = 'next'
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.has_prev && pagination.value.prev_cursor) {
    currentPrevCursor.value = pagination.value.prev_cursor
    direction.value = 'prev'
    pageOffset.value -= 1
  }
}

// ✅ Status color: KS pakai status program, Ketua pakai submission_status
const getStatusProgramColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':   return 'bg-[#D1FAE5] text-[#10B981]'
    case 'pending':  return 'bg-[#FEF3C7] text-[#F8B641]'
    case 'completed': return 'bg-[#FFE4E6] text-[#F43F5E]'
    default:         return 'bg-gray-100 text-gray-600'
  }
}

const getSubmissionStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'disetujui': return 'bg-[#D1FAE5] text-[#10B981]'
    case 'diajukan':  return 'bg-[#EFF6FF] text-[#3B82F6]'
    case 'ditolak':   return 'bg-[#FFE4E6] text-[#F43F5E]'
    case 'draft':     return 'bg-gray-100 text-gray-500'
    default:          return 'bg-gray-100 text-gray-600'
  }
}

const getStatusProgramLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':    return 'Berjalan'
    case 'pending':   return 'Pending'
    case 'completed': return 'Selesai'
    default:          return status
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// DELETE
const confirmShow = ref(false)
const confirmProgram = ref<SocialProgram | null>(null)

const deleteProgram = (program: SocialProgram) => {
  confirmProgram.value = program
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmProgram.value) return
  // TODO: delete API
  queryClient.invalidateQueries({ queryKey: ['socialprograms'] })
  confirmShow.value = false
  confirmProgram.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  selectedStatus.value = 'all'
}

// ✅ Filter options beda per role
const statusesKS = ['all', 'active', 'pending', 'completed']
const statusesKetua = ['all', 'draft', 'diajukan', 'disetujui', 'ditolak']
const statuses = computed(() => isChairman.value ? statusesKetua : statusesKS)

const handleCreate = () => {
  router.push({ name: 'dashboard-social-program-create' })
}
const handleView = (program: SocialProgram) => {
  router.push({
    name: 'dashboard-social-program-detail',
    params: { id: program.id.toString() },
    query: { program: JSON.stringify(program) },
  })
}
const handleEdit = (program: SocialProgram) => {
  router.push({
    name: 'dashboard-social-program-edit',
    params: { id: program.id.toString() },
    query: { program: JSON.stringify(program) },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Data Program</h1>
        <p class="text-sm text-gray-400 mt-1">Manajemen Program > Data Program</p>
      </div>
    </template>

    <div class="mt-6 bg-gray-50 p-5 rounded-2xl">
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-5">
        <!-- TOP BAR -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-gray-700">Kelola Data Program Sosial</h2>

          <div class="flex items-center gap-2">
            <div class="w-64">
              <BaseSearch v-model="searchQuery" placeholder="Cari Program" />
            </div>

            <BaseFilter :has-active-filters="selectedStatus !== 'all'">
              <template #default="{ closeDropdown }">
                <div class="space-y-4">
                  <div>
                    <!-- ✅ Label filter beda per role -->
                    <label class="text-xs text-gray-500">
                      {{ isChairman ? 'Status Pengajuan' : 'Status Program' }}
                    </label>
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

            <!-- ✅ Tombol tambah hanya untuk KS -->
            <BaseButton
              v-if="!isChairman"
              variant="primary"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700"
              @click="handleCreate"
            >
              <Plus :size="16" />
              Tambah Program
            </BaseButton>
          </div>
        </div>

        <!-- TABLE -->
        <div class="overflow-hidden rounded-lg border border-gray-200">
          <BaseTable
            :loading="socialProgramListQuery.isPending.value"
            loading-message="Loading programs..."
            :is-empty="programs.length === 0"
            empty-message="Tidak ada program tersedia"
            :has-prev="pagination?.has_prev"
            :has-next="pagination?.has_next"
            v-model:limit="limit"
            :limit-options="limitOptions"
            @prev="handlePrevPage"
            @next="handleNextPage"
          >
            <!-- ✅ HEADER: beda kolom per role -->
            <template #headers>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">No</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Program</th>

              <!-- KS: Total Subscriber | Ketua: Nominal Minimal -->
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {{ isChairman ? 'Nominal Minimal' : 'Total Subscriber' }}
              </th>

              <!-- KS: Status Program + Status Pengajuan | Ketua: Status Pengajuan saja -->
              <th v-if="!isChairman" class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status Program
              </th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status Pengajuan
              </th>

              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal Ditambahkan</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </template>

            <!-- ✅ ROWS: beda konten per role -->
            <template #rows>
              <tr
                v-for="(program, index) in programs"
                :key="program.id"
                class="border-t border-gray-100 hover:bg-gray-50"
              >
                <td class="px-5 py-4 text-sm text-gray-500">
                  {{ pageOffset * limit + index + 1 }}
                </td>

                <td class="px-5 py-4 text-sm text-gray-700 font-medium">
                  {{ program.name }}
                </td>

                <!-- KS: Total Subscriber | Ketua: Nominal Minimal -->
                <td class="px-5 py-4 text-sm text-gray-600 text-right">
                  <span v-if="isChairman">
                    Rp {{ program.minimum_nominal?.toLocaleString('id-ID') }}
                  </span>
                  <span v-else>
                    {{ program.total_subscriber }}
                  </span>
                </td>

                <!-- Status Program — hanya KS -->
                <td v-if="!isChairman" class="px-5 py-4 text-center">
                  <span :class="['px-2.5 py-1 text-xs rounded-full', getStatusProgramColor(program.status)]">
                    {{ getStatusProgramLabel(program.status) }}
                  </span>
                </td>

                <!-- Status Pengajuan — KS dan Ketua -->
                <td class="px-5 py-4 text-center">
                  <span :class="['px-2.5 py-1 text-xs rounded-full', getSubmissionStatusColor(program.submission_status)]">
                    {{ program.submission_status }}
                  </span>
                </td>

                <td class="px-5 py-4 text-sm text-gray-500">
                  {{ formatDate(program.created_at) }}
                </td>

                <!-- Aksi -->
                <td class="px-5 py-4">
                  <div class="flex justify-center items-center gap-3 text-gray-400">
                    <button @click="handleView(program)" class="hover:text-gray-600" title="Lihat detail">
                      <Eye :size="18" />
                    </button>

                    <!-- Edit & Delete hanya untuk KS -->
                    <template v-if="!isChairman">
                      <button @click="handleEdit(program)" class="hover:text-gray-600" title="Edit">
                        <SquarePen :size="18" />
                      </button>
                      <button @click="deleteProgram(program)" class="hover:text-red-500" title="Hapus">
                        <Trash2 :size="18" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>
  </DashboardLayout>

  <ConfirmationModal
    :show="confirmShow"
    :title="`Hapus ${confirmProgram?.name}?`"
    message="Program ini akan dihapus secara permanen."
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>