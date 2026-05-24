<script setup lang="ts">
import { formatCurrency, formatDate } from '@/utils/format'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { X } from 'lucide-vue-next'
import type { DonationProgramExpense } from '@/types/donationProgramExpense'
import type { FosterChildrenExpense } from '@/types/fosterChildrenExpense'
import type { SocialProgramExpense } from '@/types/socialProgramExpense'

defineProps<{
  show: boolean
  expense: DonationProgramExpense | FosterChildrenExpense | SocialProgramExpense | null
}>()

const emit = defineEmits<{
  close: []
}>()
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
          v-if="show && expense"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Detail Pengeluaran</h3>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Judul Pengeluaran</span
                >
                <p class="text-gray-900 dark:text-gray-100 font-medium">{{ expense.title }}</p>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Tanggal Pengeluaran</span
                >
                <p class="text-gray-900 dark:text-gray-100 font-medium">
                  {{ formatDate(expense.expenseDate) }}
                </p>
              </div>
              <div>
                <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >Nominal</span
                >
                <p class="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(expense.amount) }}
                </p>
              </div>
            </div>

            <div v-if="expense.note">
              <span class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >Catatan</span
              >
              <p
                class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 whitespace-pre-wrap"
              >
                {{ expense.note }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end"
          >
            <BaseButton variant="outline" @click="emit('close')">Tutup</BaseButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
