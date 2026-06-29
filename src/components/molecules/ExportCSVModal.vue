<script setup lang="ts">
import { ref, watch } from 'vue'
import { Download, Calendar, X } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    isExporting?: boolean
    sortByOptions?: { value: string; label: string }[]
  }>(),
  {
    sortByOptions: () => [
      { value: 'created_at desc', label: 'Tanggal Dibuat (Terbaru)' },
      { value: 'created_at asc', label: 'Tanggal Dibuat (Terlama)' },
      { value: 'expense_date desc', label: 'Tanggal Pengeluaran (Terbaru)' },
      { value: 'expense_date asc', label: 'Tanggal Pengeluaran (Terlama)' },
      { value: 'amount desc', label: 'Nominal Pengeluaran (Tertinggi)' },
      { value: 'amount asc', label: 'Nominal Pengeluaran (Terendah)' },
    ],
  },
)

const emit = defineEmits<{
  close: []
  export: [payload: { startDate: string; endDate: string; sortBy: string }]
}>()

const exportDateFrom = ref('')
const exportDateTo = ref('')
const exportFilterType = ref<'this_month' | 'last_month' | 'custom'>('this_month')
const exportSortBy = ref('created_at desc')

const setExportFilter = (type: 'this_month' | 'last_month' | 'custom') => {
  exportFilterType.value = type
  const now = new Date()
  if (type === 'this_month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    exportDateFrom.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, now.getMonth() + 1, 0).getDate()
    exportDateTo.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  } else if (type === 'last_month') {
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const monthVal = now.getMonth() === 0 ? 12 : now.getMonth()
    const month = String(monthVal).padStart(2, '0')
    exportDateFrom.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, monthVal, 0).getDate()
    exportDateTo.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  } else if (type === 'custom') {
    exportDateFrom.value = ''
    exportDateTo.value = ''
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      setExportFilter('this_month')
      exportSortBy.value = props.sortByOptions?.[0]?.value || 'created_at desc'
    }
  },
  { immediate: true },
)

const handleExportSubmit = () => {
  if (!exportDateFrom.value || !exportDateTo.value) return
  emit('export', {
    startDate: exportDateFrom.value,
    endDate: exportDateTo.value,
    sortBy: exportSortBy.value,
  })
}
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="emit('close')"
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
          v-if="show"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-7 font-poppins"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex items-center justify-center"
              >
                <Download :size="20" class="text-primary-500" />
              </div>
              <div class="min-w-0">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Ekspor CSV</h2>
                <p v-if="title" class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                  {{ title }}
                </p>
              </div>
            </div>
            <button
              @click="emit('close')"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- Presets/Quick Filter -->
          <div class="flex gap-2 text-xs font-semibold mb-4">
            <button
              type="button"
              @click="setExportFilter('this_month')"
              :class="[
                exportFilterType === 'this_month'
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-500 border-primary-300 dark:border-primary-850'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800',
                'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
              ]"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              @click="setExportFilter('last_month')"
              :class="[
                exportFilterType === 'last_month'
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-500 border-primary-300 dark:border-primary-850'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800',
                'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
              ]"
            >
              Bulan Lalu
            </button>
            <button
              type="button"
              @click="setExportFilter('custom')"
              :class="[
                exportFilterType === 'custom'
                  ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-500 border-primary-300 dark:border-primary-850'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800',
                'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
              ]"
            >
              Pilih Tanggal
            </button>
          </div>

          <!-- Date Fields -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >Dari Tanggal</label
              >
              <div class="relative">
                <Calendar
                  :size="14"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  v-model="exportDateFrom"
                  type="date"
                  @input="exportFilterType = 'custom'"
                  class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >Sampai Tanggal</label
              >
              <div class="relative">
                <Calendar
                  :size="14"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  v-model="exportDateTo"
                  type="date"
                  :min="exportDateFrom"
                  @input="exportFilterType = 'custom'"
                  class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Sort Select -->
          <div class="mb-6">
            <label
              class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
              >Urutkan Berdasarkan</label
            >
            <select
              v-model="exportSortBy"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-300 focus:border-transparent focus:outline-none"
            >
              <option v-for="opt in sortByOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <BaseButton variant="outline" @click="emit('close')" class="flex-1 font-semibold">
              Batal
            </BaseButton>
            <BaseButton
              variant="primary"
              :loading="isExporting"
              :disabled="!exportDateFrom || !exportDateTo || isExporting"
              @click="handleExportSubmit"
              class="flex-1 font-semibold"
            >
              <template #loading>Mengunduh...</template>
              <template #default>
                <Download :size="16" class="mr-1.5" />
                Unduh CSV
              </template>
            </BaseButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
