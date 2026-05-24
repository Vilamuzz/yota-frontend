<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fosterChildrenExpenseSchema } from '@/schemas/fosterChildrenExpense.schema'
import { useFosterChildrenExpenseCreate } from '@/composables/fosterChildrenExpense/useFosterChildrenExpenseCreate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { Camera, FileText } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { createMutation, validationErrors } = useFosterChildrenExpenseCreate()
const { showToast } = useToast()

const childId = route.params.id as string
const form = reactive({
  title: '',
  amount: '',
  expenseDate: new Date().toISOString().substring(0, 10),
  note: '',
  proofFile: null as File | null,
})
const proofPreview = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

const isLoading = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(form.amount)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const titleError = computed(() => errors.value.title || validationErrors.value?.title || '')
const amountError = computed(() => errors.value.amount || validationErrors.value?.amount || '')
const expenseDateError = computed(
  () =>
    errors.value.expenseDate ||
    validationErrors.value?.expenseDate ||
    errors.value.expense_date ||
    validationErrors.value?.expense_date ||
    '',
)
const noteError = computed(() => errors.value.note || validationErrors.value?.note || '')
const proofFileError = computed(
  () =>
    errors.value.proofFile ||
    validationErrors.value?.proofFile ||
    errors.value.proof_file ||
    validationErrors.value?.proof_file ||
    '',
)

watch(
  () => form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      errors.value = {}
    }
    if (createMutation.isError.value) {
      createMutation.reset()
    }
  },
  { deep: true },
)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.proofFile = file
    proofPreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = () => {
  const result = fosterChildrenExpenseSchema.safeParse({
    title: form.title.trim(),
    amount: Number(form.amount),
    expenseDate: form.expenseDate,
    note: form.note.trim(),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: childId,
      data: {
        ...result.data,
        proofFile: form.proofFile ? (form.proofFile as unknown as File) : undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Pengeluaran berhasil dicatat!', 'success')
        router.push({
          name: 'dashboard-foster-children-expense-transaction',
          params: { id: childId },
        })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal mencatat pengeluaran'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Pengeluaran Anak Asuh</template>

    <div class="max-w-full mx-auto space-y-6">
      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Left Column: Basic Info -->
          <div class="p-6 space-y-5">
            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Pengeluaran"
              placeholder="mis. Pembelian Seragam"
              :error="titleError"
              required
            />

            <div>
              <label
                for="amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="amount"
                v-model="form.amount"
                type="number"
                min="1000"
                placeholder="mis. 500000"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
                :class="
                  amountError
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="amountError" class="mt-1 text-xs text-red-600">
                {{ amountError }}
              </p>
            </div>

            <BaseInput
              id="expenseDate"
              v-model="form.expenseDate"
              type="date"
              label="Tanggal Pengeluaran"
              :error="expenseDateError"
              required
            />

            <div>
              <label
                for="note"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Catatan (Opsional)
              </label>
              <textarea
                id="note"
                v-model="form.note"
                rows="3"
                placeholder="Tambahkan detail pengeluaran..."
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
              ></textarea>
              <p v-if="noteError" class="mt-1 text-xs text-red-600">
                {{ noteError }}
              </p>
            </div>
          </div>

          <!-- Right Column: Proof Upload -->
          <div class="p-6 space-y-5 border-l border-gray-100 dark:border-gray-700">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">
                Bukti Pengeluaran (Opsional)
              </label>

              <div
                class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 overflow-hidden group"
                :class="{
                  'border-primary-400 bg-primary-50/30 dark:bg-primary-900/10': proofPreview,
                }"
              >
                <input
                  type="file"
                  accept="image/*,.pdf"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="handleFileChange"
                />

                <div v-if="!proofPreview" class="p-8 text-center">
                  <div
                    class="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3"
                  >
                    <Camera class="text-gray-400" :size="24" />
                  </div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Klik atau seret file
                  </p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG atau PDF (Maks. 5MB)</p>
                </div>

                <div
                  v-else
                  class="relative aspect-video flex items-center justify-center bg-gray-50 dark:bg-gray-900/30"
                >
                  <img
                    v-if="form.proofFile?.type.startsWith('image/')"
                    :src="proofPreview"
                    class="object-contain max-h-full"
                    alt="Pratinjau Bukti"
                  />
                  <div v-else class="flex flex-col items-center">
                    <FileText :size="48" class="text-primary-500" />
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
                      {{ form.proofFile?.name }}
                    </p>
                  </div>

                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <p class="text-white text-xs font-bold">Ganti File</p>
                  </div>
                </div>
              </div>
              <p v-if="proofFileError" class="mt-1 text-xs text-red-600">
                {{ proofFileError }}
              </p>
            </div>

            <div
              class="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30"
            >
              <p class="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed">
                Pastikan nominal dan bukti pengeluaran sudah sesuai. Data yang disimpan akan
                langsung mempengaruhi saldo program anak asuh terkait.
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 py-4 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{
              name: 'dashboard-foster-children-expense-transaction',
              params: { id: childId },
            }"
            :disabled="isLoading"
          >
            Batal
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isLoading">
            <template #loading>Menyimpan…</template>
            Simpan Pengeluaran
          </BaseButton>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
