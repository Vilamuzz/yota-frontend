<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDonationProgramTransactionSchema } from '@/schemas/donationProgramTransaction.schema'
import { useDonationProgramTransactionCreateOffline } from '@/composables/donationProgramTransaction/useDonationProgramTransactionCreateOffline'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const { createMutation } = useDonationProgramTransactionCreateOffline()
const { showToast } = useToast()

const donationId = route.params.id as string

const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')
const errors = ref<Record<string, string>>({})
const isLoading = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const handleSubmit = () => {
  const result = createDonationProgramTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
    donorName: donorName.value.trim(),
    donorEmail: donorEmail.value.trim(),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: donationId,
      data: {
        grossAmount: Number(grossAmount.value),
        donorName: donorName.value.trim() || undefined,
        donorEmail: donorEmail.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dibuat!', 'success')
        router.push({ name: 'dashboard-donation-programs-transaction', params: { id: donationId } })
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
</script>

<template>
  <DashboardLayout>
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
                Amount (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="e.g. 100000"
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
              These details will be recorded as an offline transaction directly into the system,
              bypassing payment gateways.
            </p>
          </div>

          <div class="p-6 space-y-5">
            <!-- Donor Name -->
            <BaseInput
              id="donor-name"
              v-model="donorName"
              label="Donor Name (Optional)"
              placeholder="e.g. Hamba Allah"
              :error="errors.donor_name"
            />

            <!-- Donor Email -->
            <BaseInput
              id="donor-email"
              v-model="donorEmail"
              label="Donor Email (Optional)"
              placeholder="e.g. email@example.com"
              :error="errors.donor_email"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 pb-4 flex items-center justify-between gap-3 border-t dark:border-gray-700 pt-4"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{ name: 'dashboard-donation-programs-transaction', params: { id: donationId } }"
            :disabled="isLoading"
          >
            Cancel
          </BaseButton>
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Creating…</template>
              Record Transaction
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
