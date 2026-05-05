<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const { showToast } = useToast()


// Form fields
const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')
const errors = ref<Record<string, string>>({})

const isLoading = ref(false)

const validate = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!grossAmount.value || Number(grossAmount.value) < 1000) {
    newErrors.gross_amount = 'Minimal donasi adalah Rp 1.000'
  }

  if (donorEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.value)) {
    newErrors.donor_email = 'Format email tidak valid'
  }

  errors.value = newErrors
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showToast('Transaksi offline berhasil dicatat!', 'success')
    router.push({ name: 'dashboard-foster-children-transaction' })
  } catch {
    showToast('Gagal mencatat transaksi offline', 'error')
  } finally {
    isLoading.value = false
  }
}

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const handleSubmit = () => {
  const result = createFosterChildrenTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
    donorName: donorName.value.trim(),
    donorEmail: donorEmail.value.trim(),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: fosterChildId,
      data: {
        grossAmount: Number(grossAmount.value),
        donorName: donorName.value.trim() || undefined,
        donorEmail: donorEmail.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dicatat!', 'success')
        router.push({ name: 'dashboard-foster-children-transaction' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal mencatat transaksi offline'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Transaksi Anak Asuh</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Form Card -->
      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Amount -->
            <div>
              <label
                for="gross-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal Donasi (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="mis. 100000"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
                :class="
                  errors.gross_amount
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.gross_amount" class="mt-1 text-xs text-red-600">
                {{ errors.gross_amount }}
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              Detail ini akan dicatat sebagai transaksi offline langsung ke dalam sistem, melewati
              payment gateway.
            </p>
          </div>

          <div class="p-6 space-y-5">
            <!-- Donor Name -->
            <BaseInput
              id="donor-name"
              v-model="donorName"
              label="Nama Donatur (Opsional)"
              placeholder="mis. Hamba Allah"
              :error="errors.donor_name"
            />

            <!-- Donor Email -->
            <BaseInput
              id="donor-email"
              v-model="donorEmail"
              label="Email Donatur (Opsional)"
              placeholder="mis. email@example.com"
              :error="errors.donor_email"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 pb-4 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{ name: 'dashboard-foster-children-transaction' }"
            :disabled="isLoading"
          >
            Batal
          </BaseButton>
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Menyimpan…</template>
              Catat Transaksi
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
