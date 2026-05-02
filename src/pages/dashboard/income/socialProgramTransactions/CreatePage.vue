<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createSocialProgramTransactionSchema } from '@/schemas/socialProgramTransaction.schema'
import { useSocialProgramTransactionCreateOffline } from '@/composables/socialProgramTransaction/useSocialProgramTransactionCreateOffline'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { createMutation } = useSocialProgramTransactionCreateOffline()
const { showToast } = useToast()

const socialProgramId = route.params.id as string

// Form fields
const grossAmount = ref('')

// Validation errors
const errors = ref<Record<string, string>>({})

const isLoading = computed(() => createMutation.isPending.value)

const validate = (): boolean => {
  const result = createSocialProgramTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  errors.value = zodErrors
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  createMutation.mutate(
    {
      id: socialProgramId,
      data: {
        grossAmount: Number(grossAmount.value),
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dibuat!', 'success')
        router.push({
          name: 'dashboard-social-programs-transaction',
          params: { id: socialProgramId },
        })
      },
      onError: (err) => {
        showToast(
          extractError(err, 'Gagal membuat transaksi offline. Silahkan coba lagi.'),
          'error',
        )
      },
    },
  )
}

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
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
    <template #title>Tambah Transaksi Program Sosial</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Form Card -->
      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="p-6 space-y-5 max-w-lg">
          <!-- Amount -->
          <div>
            <label
              for="gross-amount"
              class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Nominal Iuran (IDR) <span class="text-red-500">*</span>
            </label>
            <input
              id="gross-amount"
              v-model="grossAmount"
              type="number"
              min="1000"
              placeholder="mis. 100000"
              class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
              :class="
                errors.grossAmount
                  ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-700'
              "
            />
            <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ≈ {{ formatCurrencyPreview }}
            </p>
            <p v-if="errors.grossAmount" class="mt-1 text-xs text-red-600">
              {{ errors.grossAmount }}
            </p>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            Detail ini akan dicatat sebagai transaksi offline langsung ke dalam sistem, melewati
            payment gateway.
          </p>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 pb-4 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{
              name: 'dashboard-social-programs-transaction',
              params: { id: socialProgramId },
            }"
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
