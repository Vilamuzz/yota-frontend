<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import type { CreateSocialProgramTransactionRequest } from '@/types/socialProgramTransaction'
import type { SocialProgramInvoice } from '@/types/socialProgramInvoice'
import { formatCurrency, formatMonth } from '@/utils/format'

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
  emit('submit', { ...form.value })
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
          Bulan {{ formatMonth(invoice.createdAt) }}
        </p>
        <p class="text-lg font-bold text-blue-900 dark:text-blue-100 mt-2">
          {{ formatCurrency(invoice.minimumAmount) }}
        </p>
      </div>

      <BaseInput
        id="grossAmount"
        v-model.number="form.grossAmount"
        label="Nominal Pembayaran"
        type="number"
        required
      />



      <div class="flex justify-end gap-3 mt-6">
        <BaseButton type="button" variant="secondary" @click="emit('close')">Batal</BaseButton>
        <BaseButton type="submit" variant="primary" :loading="loading">Catat Pembayaran</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
