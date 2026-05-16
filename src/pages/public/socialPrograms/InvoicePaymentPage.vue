<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useRoute, useRouter } from 'vue-router'
import { useSocialProgramInvoiceDetail } from '@/composables/socialProgramInvoice/useSocialProgramInvoiceDetail'
import { useSocialProgramTransactionCreate } from '@/composables/socialProgramTransaction/useSocialProgramTransactionCreate'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

// Composables
const { query: invoiceQuery } = useSocialProgramInvoiceDetail(id)
const { createMutation } = useSocialProgramTransactionCreate()
const { showToast } = useToast()

const handleBack = () => {
  router.push({ path: '/invoices' })
}

const selectedPreset = ref<number | null>(null)
const manualInput = ref('')
const manualError = ref('')

const minimumAmount = computed(() => invoiceQuery.data.value?.data?.minimumAmount ?? 0)

const presets = computed(() => {
  const min = minimumAmount.value
  if (!min) return []
  return [min, min * 2, min * 5, min * 10]
})

const selectPreset = (amount: number) => {
  selectedPreset.value = amount
  manualInput.value = amount.toString()
  manualError.value = ''
}

import { watch } from 'vue'
watch(
  () => invoiceQuery.data.value?.data?.minimumAmount,
  (newMin) => {
    if (newMin && !manualInput.value) {
      manualInput.value = newMin.toString()
      selectedPreset.value = newMin
    }
  },
  { immediate: true },
)

const onManualInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  manualInput.value = raw
  selectedPreset.value = null

  const num = Number(raw)
  if (raw && num < minimumAmount.value) {
    manualError.value = `Minimal pembayaran ${formatCurrency(minimumAmount.value)}`
  } else {
    manualError.value = ''
  }
}

const selectedAmount = computed(() => {
  const num = Number(manualInput.value)
  return num >= minimumAmount.value ? num : null
})

const canContinue = computed(() => selectedAmount.value !== null && !createMutation.isPending.value)

const handleSubmit = () => {
  if (!id.value || !selectedAmount.value) return

  createMutation.mutate(
    {
      id: id.value,
      data: {
        grossAmount: selectedAmount.value,
      },
    },
    {
      onSuccess: (response) => {
        const snapToken = response?.data?.snapToken
        if (snapToken) {
          router.push({
            path: '/invoices',
            query: { pay: snapToken },
          })
        } else {
          showToast('Berhasil membuat transaksi pembayaran', 'success')
          router.push({ path: '/invoices' })
        }
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal membuat transaksi pembayaran'), 'error')
      },
    },
  )
}
</script>

<template>
  <div class="h-screen flex flex-col font-poppins">
    <!-- Top white header -->
    <div class="bg-primary-500 px-6 py-4 flex items-center gap-4 text-white">
      <button @click="handleBack" class="hover:text-gray-100 transition-colors">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="text-base font-bold">
        Pembayaran {{ invoiceQuery.data.value?.data?.socialProgramTitle ?? '...' }}
      </h1>
    </div>

    <!-- Gray background middle -->
    <div class="flex-1 bg-gray-100 overflow-y-auto flex flex-col">
      <!-- White form card -->
      <div class="bg-white p-6 max-w-md w-full flex flex-col mx-auto space-y-5 flex-1">
        <h2 class="text-center font-semibold text-gray-700">Masukan Nominal Pembayaran</h2>

        <!-- Preset grid -->
        <div v-if="presets.length" class="grid grid-cols-2 gap-3">
          <button
            v-for="amount in presets"
            :key="amount"
            @click="selectPreset(amount)"
            :class="[
              'rounded-md border-2 py-3 px-4 text-sm font-semibold transition-all duration-150',
              selectedPreset === amount
                ? 'border-primary-400 bg-primary-400 text-white'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-400 hover:text-primary-400',
            ]"
          >
            {{ formatCurrency(amount) }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="text-xs text-gray-400">atau masukkan nominal lain</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Manual input -->
        <div class="space-y-1.5">
          <label class="text-sm text-gray-500">Nominal Pembayaran</label>
          <div
            :class="[
              'flex items-center border-2 rounded-md px-4 py-3 transition-colors',
              manualError
                ? 'border-red-400'
                : selectedAmount
                  ? 'border-primary-400'
                  : 'border-gray-200 focus-within:border-primary-400',
            ]"
          >
            <span class="text-sm text-gray-400 mr-2 shrink-0">Rp</span>
            <input
              :value="selectedAmount ? formatNumber(selectedAmount) : manualInput"
              @input="onManualInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="flex-1 outline-none text-sm font-semibold text-gray-800 bg-transparent placeholder-gray-300"
            />
          </div>
          <p v-if="manualError" class="text-xs text-red-500">{{ manualError }}</p>
          <p v-else class="text-xs text-gray-400">
            Minimal pembayaran {{ formatCurrency(minimumAmount) }}
          </p>
        </div>

        <div class="p-4 bg-primary-50 rounded-xl border border-primary-100 mt-4">
          <p class="text-xs text-primary-700 leading-relaxed">
            <span class="font-bold">Informasi:</span> Tagihan ini adalah untuk program
            <span class="font-bold">{{ invoiceQuery.data.value?.data?.socialProgramTitle }}</span
            >. Silakan masukkan nominal sesuai tagihan atau lebih untuk bantuan tambahan.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom button (non-scrollable) -->
    <div class="bg-gray-100 px-6">
      <div class="max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-4">
        <p v-if="createMutation.error.value" class="text-xs text-red-500 text-center mb-2">
          {{ createMutation.error.value.message }}
        </p>
        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!canContinue"
          :full-width="true"
          @click="handleSubmit"
        >
          {{ createMutation.isPending.value ? 'Memproses...' : 'Lanjutkan' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
