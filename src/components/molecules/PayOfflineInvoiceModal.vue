<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import type { CreateSocialProgramTransactionRequest } from '@/types/socialProgramTransaction'
import type { SocialProgramInvoice } from '@/types/socialProgramInvoice'
import { formatBillingPeriodLabel, formatCurrency } from '@/utils/format'

const props = defineProps<{
  show: boolean
  invoice?: SocialProgramInvoice
  loading?: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: CreateSocialProgramTransactionRequest): void
}>()

const form = ref<CreateSocialProgramTransactionRequest>({
  grossAmount: 0,
})

const normalizedAmount = computed(() => {
  const amount = Number(form.value.grossAmount || 0)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
})

const minimumAmount = computed(() => props.invoice?.minimumAmount ?? 0)

const isBelowMinimum = computed(
  () => normalizedAmount.value > 0 && normalizedAmount.value < minimumAmount.value,
)

const isInvalid = computed(() => normalizedAmount.value <= 0 || isBelowMinimum.value)

watch(
  () => props.invoice,
  (val) => {
    if (val) {
      form.value.grossAmount = val.minimumAmount
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (isInvalid.value) return
  emit('submit', {
    grossAmount: normalizedAmount.value,
  })
}
</script>

<template>
  <BaseModal :show="show" title="Catat Pembayaran Offline" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div
        v-if="invoice"
        class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4"
      >
        <p
          class="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider mb-1"
        >
          Tagihan
        </p>
        <p class="text-sm font-bold text-blue-900 dark:text-blue-100">
          {{ formatBillingPeriodLabel(invoice.billingPeriod, invoice.createdAt) }}
        </p>
        <p class="text-lg font-bold text-blue-900 dark:text-blue-100 mt-2">
          {{ formatCurrency(invoice.minimumAmount) }}
        </p>
      </div>
      <div>
        <BaseInput
          id="grossAmount"
          v-model.number="form.grossAmount"
          label="Nominal Pembayaran"
          type="number"
          required
        />
        <p v-if="isBelowMinimum" class="text-sm text-red-500 mt-1">
          Nominal tidak boleh kurang dari {{ formatCurrency(minimumAmount) }}
        </p>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <BaseButton type="button" variant="secondary" @click="emit('close')">Batal</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="loading" :disabled="isInvalid">
          Catat Pembayaran
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>