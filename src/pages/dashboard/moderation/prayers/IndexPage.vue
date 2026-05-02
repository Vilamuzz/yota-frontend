<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  MessageCircleHeart,
  Trash2,
  Flag,
  HandHeart,
  Heart,
  ChevronRight,
  ShieldAlert,
  X,
} from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import { usePrayerList } from '@/composables/prayer/usePrayerList'
import { usePrayerDelete } from '@/composables/prayer/usePrayerDelete'
import { usePrayerReport } from '@/composables/prayer/usePrayerReport'
import type { Prayer } from '@/types/prayer'
import type { DonationProgram } from '@/types/donationProgram'
import { formatDate } from '@/utils/format'

// ── Donation programs panel ────────────────────────────────────────────────
const {
  queryParams: programParams,
  searchQuery: programSearch,
  donationPrograms,
  pagination: programPagination,
  isLoading: programsLoading,
  handleNextPage: programNext,
  handlePrevPage: programPrev,
} = useDonationProgramFilters()

const selectedProgram = ref<DonationProgram | null>(null)

function selectProgram(program: DonationProgram) {
  selectedProgram.value = program
  prayerSearch.value = ''
  prayerCursors.nextCursor = undefined
  prayerCursors.prevCursor = undefined
  prayerPageOffset.value = 0
}

// ── Prayer list panel ─────────────────────────────────────────────────────
const prayerSearch = ref('')
const prayerCursors = reactive({
  nextCursor: undefined as string | undefined,
  prevCursor: undefined as string | undefined,
})
const prayerPageOffset = ref(0)
const prayerLimit = ref(10)
const prayerLimitOptions = [10, 25, 50]

let prayerSearchTimeout: ReturnType<typeof setTimeout>
watch(prayerSearch, (val) => {
  clearTimeout(prayerSearchTimeout)
  prayerSearchTimeout = setTimeout(() => {
    prayerCursors.nextCursor = undefined
    prayerCursors.prevCursor = undefined
    prayerPageOffset.value = 0
  }, 400)
})

const selectedProgramId = computed(() => selectedProgram.value?.id ?? '')

const {
  prayers,
  pagination: prayerPagination,
  isLoading: prayersLoading,
} = usePrayerList(selectedProgramId as unknown as string)

function handlePrayerNext() {
  if (prayerPagination.value?.nextCursor) {
    prayerCursors.nextCursor = prayerPagination.value.nextCursor
    prayerCursors.prevCursor = undefined
    prayerPageOffset.value += 1
  }
}

function handlePrayerPrev() {
  if (prayerPagination.value?.prevCursor) {
    prayerCursors.prevCursor = prayerPagination.value.prevCursor
    prayerCursors.nextCursor = undefined
    prayerPageOffset.value -= 1
  }
}

// Filter prayers locally by search query (service doesn't support server-side search for prayers)
const filteredPrayers = computed(() => {
  if (!prayerSearch.value.trim()) return prayers.value
  const q = prayerSearch.value.toLowerCase()
  return prayers.value.filter(
    (p) => p.username.toLowerCase().includes(q) || p.content.toLowerCase().includes(q),
  )
})

// ── Delete ────────────────────────────────────────────────────────────────
const { deleteMutation } = usePrayerDelete()
const confirmDeleteShow = ref(false)
const confirmDeletePrayer = ref<Prayer | null>(null)

function openDeleteConfirm(prayer: Prayer) {
  confirmDeletePrayer.value = prayer
  confirmDeleteShow.value = true
}

async function handleConfirmDelete() {
  if (!confirmDeletePrayer.value) return
  await deleteMutation.mutateAsync(confirmDeletePrayer.value.id)
  confirmDeleteShow.value = false
  confirmDeletePrayer.value = null
}

// ── Report ────────────────────────────────────────────────────────────────
const { createMutation: reportMutation } = usePrayerReport()
const reportShow = ref(false)
const reportPrayer = ref<Prayer | null>(null)
const reportReason = ref('')

function openReportModal(prayer: Prayer) {
  reportPrayer.value = prayer
  reportReason.value = ''
  reportShow.value = true
}

async function handleConfirmReport() {
  if (!reportPrayer.value || !reportReason.value.trim()) return
  await reportMutation.mutateAsync({
    prayerID: reportPrayer.value.id,
    reason: reportReason.value.trim(),
  })
  reportShow.value = false
  reportPrayer.value = null
  reportReason.value = ''
}

// ── Utilities ─────────────────────────────────────────────────────────────
function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + '…' : text
}
</script>

<template>
  <DashboardLayout>
    <template #title>Moderasi Doa</template>

    <div class="flex flex-col gap-6">
      <!-- Page description banner -->
      <div
        class="flex items-start gap-4 rounded-xl border border-violet-200 bg-liniear-to-r from-violet-50 to-purple-50 p-4 dark:border-violet-800 dark:from-violet-950/40 dark:to-purple-950/40"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow"
        >
          <ShieldAlert :size="20" />
        </div>
        <div>
          <p class="text-sm font-semibold text-violet-900 dark:text-violet-200">
            Moderasi Doa Program Donasi
          </p>
          <p class="mt-0.5 text-xs text-violet-700 dark:text-violet-400">
            Pilih program donasi di panel kiri untuk melihat dan mengelola doa yang dikirimkan
            pengguna. Anda dapat menghapus atau melaporkan doa yang tidak sesuai.
          </p>
        </div>
      </div>

      <!-- Two-panel layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <!-- LEFT: Donation programs selector -->
        <div
          class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
        >
          <div class="flex items-center gap-2">
            <HandHeart :size="18" class="text-violet-600" />
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">Program Donasi</h2>
          </div>

          <!-- Search programs -->
          <BaseSearch v-model="programSearch" placeholder="Cari program..." />

          <!-- Programs loading skeleton -->
          <div v-if="programsLoading" class="space-y-2">
            <div
              v-for="i in 5"
              :key="i"
              class="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          </div>

          <!-- Programs empty state -->
          <div
            v-else-if="donationPrograms.length === 0"
            class="flex flex-col items-center justify-center py-10 text-center text-gray-400"
          >
            <HandHeart :size="40" class="mb-2 opacity-40" />
            <p class="text-sm">Tidak ada program ditemukan.</p>
          </div>

          <!-- Programs list -->
          <ul v-else class="flex flex-col gap-1.5 overflow-y-auto" style="max-height: 480px">
            <li v-for="program in donationPrograms" :key="program.id">
              <button
                @click="selectProgram(program)"
                :class="[
                  'group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150',
                  selectedProgram?.id === program.id
                    ? 'bg-violet-600 text-white shadow'
                    : 'hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                ]"
              >
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-medium"
                    :class="
                      selectedProgram?.id === program.id
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    "
                  >
                    {{ program.title }}
                  </p>
                  <p
                    class="mt-0.5 truncate text-xs capitalize"
                    :class="
                      selectedProgram?.id === program.id
                        ? 'text-violet-200'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  >
                    {{ program.category }} · {{ program.status }}
                  </p>
                </div>
                <ChevronRight
                  :size="16"
                  :class="
                    selectedProgram?.id === program.id
                      ? 'text-violet-200'
                      : 'text-gray-400 group-hover:text-gray-600'
                  "
                />
              </button>
            </li>
          </ul>

          <!-- Programs pagination controls -->
          <div
            v-if="programPagination?.prevCursor || programPagination?.nextCursor"
            class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700"
          >
            <button
              :disabled="!programPagination?.prevCursor"
              @click="programPrev(programPagination)"
              class="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Sebelumnya
            </button>
            <button
              :disabled="!programPagination?.nextCursor"
              @click="programNext(programPagination)"
              class="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Berikutnya
            </button>
          </div>
        </div>

        <!-- RIGHT: Prayers panel -->
        <div
          class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
        >
          <!-- Header -->
          <div
            class="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2">
              <MessageCircleHeart :size="18" class="text-violet-600" />
              <div>
                <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {{ selectedProgram ? selectedProgram.title : 'Doa' }}
                </h2>
                <p v-if="selectedProgram" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ filteredPrayers.length }} doa ditemukan
                </p>
              </div>
            </div>

            <!-- Prayer search (only visible when a program is selected) -->
            <div v-if="selectedProgram" class="w-full sm:w-64">
              <BaseSearch v-model="prayerSearch" placeholder="Cari doa atau pengguna..." />
            </div>
          </div>

          <!-- No program selected -->
          <div
            v-if="!selectedProgram"
            class="flex flex-col items-center justify-center py-20 text-center text-gray-400"
          >
            <MessageCircleHeart :size="56" class="mb-3 opacity-30" />
            <p class="text-base font-medium text-gray-500 dark:text-gray-400">
              Pilih program donasi
            </p>
            <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Pilih program dari panel kiri untuk menampilkan doa.
            </p>
          </div>

          <!-- Prayers table -->
          <div v-else class="overflow-hidden">
            <BaseTable
              :loading="prayersLoading"
              loading-message="Memuat data doa..."
              :is-empty="!prayersLoading && filteredPrayers.length === 0"
              empty-message="Tidak ada doa yang ditemukan."
              :has-prev="!!prayerPagination?.prevCursor"
              :has-next="!!prayerPagination?.nextCursor"
              v-model:limit="prayerLimit"
              :limit-options="prayerLimitOptions"
              @prev="handlePrayerPrev"
              @next="handlePrayerNext"
            >
              <template #empty-icon>
                <MessageCircleHeart :size="56" class="mb-2 text-gray-300" />
              </template>

              <template #headers>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  No
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Pengguna
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Isi Doa
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  <Heart :size="14" class="inline" /> Amin
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tanggal
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Aksi
                </th>
              </template>

              <template #rows>
                <tr
                  v-for="(prayer, index) in filteredPrayers"
                  :key="prayer.id"
                  class="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <!-- No -->
                  <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ prayerPageOffset * prayerLimit + index + 1 }}
                  </td>

                  <!-- Username -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                      >
                        {{ prayer.username.charAt(0).toUpperCase() }}
                      </div>
                      <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {{ prayer.username }}
                      </span>
                    </div>
                  </td>

                  <!-- Content -->
                  <td class="max-w-xs px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ truncate(prayer.content) }}
                  </td>

                  <!-- Amen count -->
                  <td class="px-4 py-3 text-center">
                    <span
                      class="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300"
                    >
                      <Heart :size="11" class="fill-pink-500 text-pink-500" />
                      {{ prayer.amenCount }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ formatDate(prayer.createdAt) }}
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="openReportModal(prayer)"
                        class="rounded p-1.5 text-amber-500 transition-colors duration-150 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        title="Laporkan doa"
                      >
                        <Flag :size="16" />
                      </button>
                      <button
                        @click="openDeleteConfirm(prayer)"
                        class="rounded p-1.5 text-red-500 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Hapus doa"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </BaseTable>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>

  <!-- Delete Confirmation Modal -->
  <ConfirmationModal
    :show="confirmDeleteShow"
    title="Hapus Doa?"
    :message="`Doa dari @${confirmDeletePrayer?.username} akan dihapus secara permanen.\nTindakan ini tidak dapat dibatalkan.`"
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    :primary-button-loading="deleteMutation.isPending.value"
    @primary="handleConfirmDelete"
    @secondary="confirmDeleteShow = false"
    @close="confirmDeleteShow = false"
  />

  <!-- Report Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="reportShow"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="reportShow = false"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="reportShow"
          class="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        >
          <button
            @click="reportShow = false"
            class="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X :size="18" />
          </button>

          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40"
            >
              <Flag :size="20" class="text-amber-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Laporkan Doa</h3>
              <p v-if="reportPrayer" class="text-xs text-gray-500 dark:text-gray-400">
                dari @{{ reportPrayer.username }}
              </p>
            </div>
          </div>

          <!-- Prayer preview -->
          <div
            v-if="reportPrayer"
            class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <p class="text-sm italic text-gray-600 dark:text-gray-300">
              "{{ truncate(reportPrayer.content, 120) }}"
            </p>
          </div>

          <div class="mb-5">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Alasan Laporan <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="reportReason"
              rows="3"
              placeholder="Jelaskan mengapa doa ini perlu dilaporkan..."
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition-shadow focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-violet-400"
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="reportShow = false"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              @click="handleConfirmReport"
              :disabled="!reportReason.trim() || reportMutation.isPending.value"
              class="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {{ reportMutation.isPending.value ? 'Melaporkan...' : 'Kirim Laporan' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
