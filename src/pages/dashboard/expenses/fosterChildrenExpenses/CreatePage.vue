<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fosterChildrenExpenseSchema } from '@/schemas/fosterChildrenExpense.schema'
import { useFosterChildrenExpenseCreate } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseCreate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { createMutation } = useFosterChildrenExpenseCreate()
const { showToast } = useToast()

const fosterChildId = route.params.id as string

// Form fields
const title = ref('')
const amount = ref('')
const expenseDate = ref('')
const note = ref('')
const proofFile = ref<File | undefined>(undefined)

// Validation errors
const errors = ref<Record<string, string>>({})

const isLoading = computed(() => createMutation.isPending.value)

const validate = (): boolean => {
  const result = fosterChildrenExpenseSchema.safeParse({
    title: title.value.trim(),
    amount: Number(amount.value),
    expenseDate: expenseDate.value,
    note: note.value.trim() || undefined,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  errors.value = zodErrors
  return Object.keys(errors.value).length === 0
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    proofFile.value = target.files[0]
  }
}

const handleSubmit = () => {
  if (!validate()) return

  createMutation.mutate(
    {
      fosterChildId,
      data: {
        title: title.value.trim(),
        amount: Number(amount.value),
        expenseDate: expenseDate.value,
        proofFile: proofFile.value,
        note: note.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Pengeluaran berhasil dicatat!', 'success')
        router.push({
          name: 'dashboard-foster-children-expense-transaction',
          params: { id: fosterChildId },
        })
      },
      onError: (err) => {
        showToast(
          extractError(err, 'Gagal mencatat pengeluaran. Silahkan coba lagi.'),
          'error',
        )
      },
    },
  )
}

const formatCurrencyPreview = computed(() => {
  const num = Number(amount.value)
  if (!num || isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
})
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Pengeluaran Anak Asuh</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Form Card -->
      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Title -->
            <BaseInput
              id="expense-title"
              v-model="title"
              label="Judul Pengeluaran"
              placeholder="mis. Biaya sekolah bulan Januari"
              :error="errors.title"
              required
            />

            <!-- Amount -->
            <div>
              <label
                for="expense-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="expense-amount"
                v-model="amount"
                type="number"
                min="1"
                placeholder="mis. 500000"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
                :class="
                  errors.amount
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.amount" class="mt-1 text-xs text-red-600">
                {{ errors.amount }}
              </p>
            </div>

            <!-- Expense Date -->
            <div>
              <label
                for="expense-date"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Tanggal Pengeluaran <span class="text-red-500">*</span>
              </label>
              <input
                id="expense-date"
                v-model="expenseDate"
                type="date"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
                :class="
                  errors.expenseDate
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              />
              <p v-if="errors.expenseDate" class="mt-1 text-xs text-red-600">
                {{ errors.expenseDate }}
              </p>
            </div>
          </div>

          <div class="p-6 space-y-5">
            <!-- Note -->
            <div>
              <label
                for="expense-note"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Catatan (Opsional)
              </label>
              <textarea
                id="expense-note"
                v-model="note"
                rows="3"
                placeholder="mis. Pembayaran SPP semester genap"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100 resize-none"
                :class="
                  errors.note
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              ></textarea>
              <p v-if="errors.note" class="mt-1 text-xs text-red-600">
                {{ errors.note }}
              </p>
            </div>

            <!-- Proof File -->
            <div>
              <label
                for="proof-file"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Bukti Pengeluaran (Opsional)
              </label>
              <input
                id="proof-file"
                type="file"
                accept="image/*,.pdf"
                @change="handleFileChange"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/20 dark:file:text-primary-400 hover:file:bg-primary-100"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format yang diterima: gambar atau PDF
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              Detail ini akan dicatat sebagai pengeluaran untuk anak asuh yang dipilih.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 pb-4 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{
              name: 'dashboard-foster-children-expense-transaction',
              params: { id: fosterChildId },
            }"
            :disabled="isLoading"
          >
            Batal
          </BaseButton>
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Menyimpan…</template>
              Catat Pengeluaran
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
