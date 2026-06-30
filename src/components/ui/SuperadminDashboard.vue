<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useLogList } from '@/composables/log/useLogList'
import { useAccountList } from '@/composables/account/useAccountList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { Activity, Eye, Clipboard, AlertCircle, Check } from 'lucide-vue-next'
import type { Log, LogQueryParams } from '@/types/log'

const { showToast } = useToast()

// Query params for audit logs API
const queryParams = reactive<LogQueryParams>({
  limit: 10,
  action: undefined,
  entityType: undefined,
  userId: undefined,
  entityId: undefined,
  nextCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

// Fetch audit logs list
const { logs, pagination, isLoading } = useLogList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

// Fetch user accounts list to map User ID to Username
const accountsParams = reactive({ limit: 100 })
const { accounts } = useAccountList(accountsParams)

const userMap = computed(() => {
  const map: Record<string, string> = {}
  accounts.value.forEach((acc) => {
    map[acc.id] = acc.username
  })
  return map
})

const getActorName = (userId?: string) => {
  if (!userId) return 'Sistem'
  return userMap.value[userId] || `User (${userId.substring(0, 8)})`
}

// Action options for filter
const actionOptions = [
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
]

// Entity Type options for filter
const entityTypeOptions = [
  { value: 'social_program', label: 'Program Sosial' },
  { value: 'social_program_expense', label: 'Pengeluaran Program Sosial' },
  { value: 'news', label: 'Berita' },
  { value: 'gallery', label: 'Galeri' },
  { value: 'foster_children_transaction', label: 'Transaksi Anak Asuh' },
  { value: 'foundation_profile', label: 'Profil Yayasan' },
  { value: 'foster_children_expense', label: 'Pengeluaran Anak Asuh' },
  { value: 'foster_children_candidate', label: 'Calon Anak Asuh' },
  { value: 'foster_children', label: 'Anak Asuh' },
  { value: 'donation_program', label: 'Program Donasi' },
  { value: 'donation', label: 'Program Donasi (Alt)' },
  { value: 'donation_program_transaction', label: 'Transaksi Program Donasi' },
  { value: 'donation_program_expense', label: 'Pengeluaran Program Donasi' },
]

const formatEntityType = (type: string): string => {
  const match = entityTypeOptions.find((opt) => opt.value === type)
  if (match) return match.label
  return type.replace(/_/g, ' ')
}

const hasActiveFilters = computed(
  () =>
    queryParams.action !== undefined ||
    queryParams.entityType !== undefined ||
    queryParams.userId !== undefined ||
    !!queryParams.entityId,
)

// Reset all filter options
function handleResetFilters() {
  queryParams.action = undefined
  queryParams.entityType = undefined
  queryParams.userId = undefined
  queryParams.entityId = undefined
  searchQuery.value = ''
  resetPagination()
}

// Watchers for immediate filter application
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.entityId = val ? val.trim() : undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.action, queryParams.entityType, queryParams.userId, queryParams.limit],
  () => resetPagination(),
)

// Log Details Modal state
const selectedLog = ref<Log | null>(null)
const isDetailModalOpen = ref(false)

function showDetails(log: Log) {
  selectedLog.value = log
  isDetailModalOpen.value = true
}

const formatJSON = (val?: string) => {
  if (!val) return ''
  try {
    const parsed = JSON.parse(val)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return val
  }
}

// Formatting date and time
const formatTimestamp = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Copy functionality for IDs and full JSON
const copiedId = ref<string | null>(null)
const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = type
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
    showToast('Teks berhasil disalin!', 'success')
  } catch {
    showToast('Gagal menyalin teks', 'error')
  }
}
</script>

<template>
  <div class="space-y-8 font-sf-pro">
    <!-- Logs Filter and Table Section -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col">
          <h3 class="text-lg font-bold text-gray-955 dark:text-white font-poppins">
            Audit Trail & Log Perubahan
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Daftar jejak audit log atas modifikasi data sistem yayasan
          </p>
        </div>

        <div class="flex flex-row gap-3 w-full sm:w-auto items-center">
          <!-- BaseFilter with Dropdown options -->
          <BaseFilter :has-active-filters="hasActiveFilters" class="shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
                <!-- Action Filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Aktivitas
                  </label>
                  <select
                    v-model="queryParams.action"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Aktivitas</option>
                    <option v-for="opt in actionOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>

                <!-- Entity Type Filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Tipe Entitas
                  </label>
                  <select
                    v-model="queryParams.entityType"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Tipe Entitas</option>
                    <option v-for="opt in entityTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>

          <!-- Reset Filter Button -->
          <BaseButton
            v-if="hasActiveFilters"
            variant="outline"
            @click="handleResetFilters"
            size="sm"
            class="h-9.5 text-xs px-3 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Reset
          </BaseButton>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div
        class="border border-gray-150 dark:border-gray-800 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden"
      >
        <BaseTable
          :loading="isLoading"
          loading-message="Memuat jejak audit log..."
          :is-empty="logs.length === 0"
          empty-message="Tidak ada audit log yang sesuai dengan filter."
          :has-prev="!!pagination?.prevCursor"
          :has-next="!!pagination?.nextCursor"
          v-model:limit="queryParams.limit"
          :limit-options="limitOptions"
          @prev="handlePrevPage(pagination)"
          @next="handleNextPage(pagination)"
        >
          <template #empty-icon>
            <Activity :size="96" class="mx-auto mb-2 text-gray-300 opacity-60" />
          </template>

          <template #headers>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider w-16">
              No
            </th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
              Tanggal & Waktu
            </th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
              Aktor
            </th>
            <th class="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">
              Aktivitas
            </th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
              Entitas
            </th>
            <th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
              ID Entitas
            </th>
            <th class="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider w-24">
              Aksi
            </th>
          </template>

          <template #rows>
            <tr
              v-for="(log, index) in logs"
              :key="log.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-100 dark:border-gray-700/40 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {{ pageOffset * queryParams.limit! + index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium"
              >
                {{ formatTimestamp(log.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-955 dark:text-white">
                  {{ getActorName(log.userId) }}
                </span>
                <span
                  v-if="log.userId"
                  class="block text-[10px] text-gray-400 font-mono tracking-tight select-all"
                >
                  ID: {{ log.userId.substring(0, 8) }}...
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide"
                  :class="[
                    log.action === 'CREATE'
                      ? 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-900/30'
                      : log.action === 'UPDATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/30'
                        : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-900/30',
                  ]"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatEntityType(log.entityType) }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono"
              >
                <div class="flex items-center gap-2 group/id">
                  <span>{{ log.entityId.substring(0, 16) }}...</span>
                  <button
                    @click="copyToClipboard(log.entityId, `entity-${log.id}`)"
                    class="p-1 text-gray-400 hover:text-primary-300 rounded opacity-0 group-hover/id:opacity-100 focus:opacity-100 transition-opacity duration-150 cursor-pointer"
                    title="Salin ID Lengkap"
                  >
                    <Check
                      v-if="copiedId === `entity-${log.id}`"
                      class="w-3.5 h-3.5 text-emerald-500"
                    />
                    <Clipboard v-else class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <BaseIconButton variant="info" title="Lihat Detail Log" @click="showDetails(log)">
                  <Eye :size="18" />
                </BaseIconButton>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- Audit Log Details Modal -->
    <BaseModal
      :show="isDetailModalOpen"
      title="Detail Audit Log"
      maxWidth="max-w-4xl"
      @close="isDetailModalOpen = false"
    >
      <div v-if="selectedLog" class="space-y-6">
        <!-- Log Metadata -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-150 dark:border-gray-700/60"
        >
          <div>
            <span
              class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider"
              >Aktor</span
            >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
              getActorName(selectedLog.userId)
            }}</span>
            <span
              v-if="selectedLog.userId"
              class="block text-[10px] text-gray-500 dark:text-gray-400 font-mono"
              >{{ selectedLog.userId }}</span
            >
          </div>
          <div>
            <span
              class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider"
              >Tanggal & Waktu</span
            >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
              formatTimestamp(selectedLog.createdAt)
            }}</span>
            <span class="block text-[10px] text-gray-505 dark:text-gray-400 font-mono">{{
              new Date(selectedLog.createdAt).toISOString()
            }}</span>
          </div>
          <div>
            <span
              class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider"
              >Aktivitas</span
            >
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border tracking-wide mt-0.5"
              :class="[
                selectedLog.action === 'CREATE'
                  ? 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-900/30'
                  : selectedLog.action === 'UPDATE'
                    ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/30'
                    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-405 dark:border-rose-900/30',
              ]"
            >
              {{ selectedLog.action }}
            </span>
          </div>
          <div>
            <span
              class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider"
              >Tipe Entitas</span
            >
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
              formatEntityType(selectedLog.entityType)
            }}</span>
            <span class="block text-[10px] text-gray-550 dark:text-gray-400 font-mono">{{
              selectedLog.entityType
            }}</span>
          </div>
          <div class="md:col-span-2">
            <span
              class="block text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-wider"
              >ID Entitas</span
            >
            <div class="flex items-center gap-2 mt-0.5">
              <span
                class="text-xs font-semibold text-gray-800 dark:text-gray-200 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 select-all"
                >{{ selectedLog.entityId }}</span
              >
              <button
                @click="copyToClipboard(selectedLog.entityId, 'modal-entity')"
                class="p-1.5 text-gray-500 hover:text-primary-300 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm cursor-pointer"
                title="Salin ID Entitas"
              >
                <Check v-if="copiedId === 'modal-entity'" class="w-3.5 h-3.5 text-emerald-500" />
                <Clipboard v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Value Difference Viewer -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Old Value column -->
          <div class="space-y-2 flex flex-col">
            <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nilai Sebelumnya
            </h4>
            <div class="flex-1 flex flex-col">
              <pre
                v-if="
                  selectedLog.oldValue &&
                  selectedLog.oldValue !== 'null' &&
                  selectedLog.oldValue !== ''
                "
                class="p-4 bg-gray-950 dark:bg-gray-900/80 text-emerald-400/90 rounded-xl text-xs font-mono overflow-auto max-h-[360px] border border-gray-900 flex-1 leading-relaxed"
                >{{ formatJSON(selectedLog.oldValue) }}</pre
              >
              <div
                v-else
                class="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center min-h-[160px]"
              >
                <AlertCircle class="w-8 h-8 text-gray-300 dark:text-gray-500 mb-2" />
                <p class="text-xs text-gray-400 italic">
                  Tidak ada nilai sebelumnya (Data Baru dibuat)
                </p>
              </div>
            </div>
          </div>

          <!-- New Value column -->
          <div class="space-y-2 flex flex-col">
            <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Nilai Sesudahnya
            </h4>
            <div class="flex-1 flex flex-col">
              <pre
                v-if="
                  selectedLog.newValue &&
                  selectedLog.newValue !== 'null' &&
                  selectedLog.newValue !== ''
                "
                class="p-4 bg-gray-950 dark:bg-gray-900/80 text-sky-400/90 rounded-xl text-xs font-mono overflow-auto max-h-[360px] border border-gray-900 flex-1 leading-relaxed"
                >{{ formatJSON(selectedLog.newValue) }}</pre
              >
              <div
                v-else
                class="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center min-h-[160px]"
              >
                <AlertCircle class="w-8 h-8 text-gray-300 dark:text-gray-500 mb-2" />
                <p class="text-xs text-gray-400 italic">
                  Tidak ada nilai sesudahnya (Data telah Dihapus)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <BaseButton variant="outline" @click="isDetailModalOpen = false">Tutup</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
