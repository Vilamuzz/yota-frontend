<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDonationTransactionSchema } from '@/schemas/donationTransaction.schema'
import { useDonationTransactionCreateOffline } from '@/composables/donationProgramTransaction/useDonationTransactionCreateOffline'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const { createMutation } = useDonationTransactionCreateOffline()
const { addToast } = useToast()

const donationId = route.params.id as string

// Form fields
const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')

// Validation errors
const errors = ref<Record<string, string>>({})

const isLoading = computed(() => createMutation.isPending.value)

const validate = (): boolean => {
  const result = createDonationTransactionSchema.safeParse({
    gross_amount: Number(grossAmount.value),
    donor_name: donorName.value.trim(),
    donor_email: donorEmail.value.trim(),
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  errors.value = zodErrors
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  await createMutation.mutateAsync({
    donation_id: donationId,
    gross_amount: Number(grossAmount.value),
    donor_name: donorName.value.trim() || undefined,
    donor_email: donorEmail.value.trim() || undefined,
  })

  if (createMutation.isSuccess.value) {
    addToast({
      type: 'success',
      message: 'Offline transaction created successfully!',
    })
    router.push({ name: 'dashboard-donation-transaction', params: { id: donationId } })
  }
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
    <div class="max-w-[100%] mx-auto space-y-6">
      <!-- API Error Banner -->
      <div
        v-if="createMutation.error.value"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        {{ createMutation.error.value.message }}
      </div>

      <!-- Form Card -->
      <form
        @submit.prevent="handleSubmit"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Amount -->
            <div>
              <label for="gross-amount" class="block text-xs font-medium text-gray-700 mb-1">
                Amount (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="e.g. 100000"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="
                  errors.gross_amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.gross_amount" class="mt-1 text-xs text-red-600">
                {{ errors.gross_amount }}
              </p>
            </div>

            <p class="text-xs text-gray-500">
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
        <div class="px-6 pb-4 flex items-center justify-between gap-3 border-t pt-4">
          <BaseButton
            type="button"
            variant="danger"
            :to="{ name: 'dashboard-donation-transaction', params: { id: donationId } }"
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
