<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useRoute, useRouter } from 'vue-router'
import { useFosterChildrenDetail } from '@/composables/fosterChildren/useFosterChildrenDetail'
import { useFosterChildrenTransactionCreate } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionCreate'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

// Composables
const { detailQuery } = useFosterChildrenDetail(slug)
const { createMutation } = useFosterChildrenTransactionCreate()
const { showToast } = useToast()

const handleBack = () => {
  window.history.back()
}

const presets = [10000, 20000, 30000, 50000]

const selectedPreset = ref<number | null>(null)
const manualInput = ref('')
const manualError = ref('')
const donorName = ref('')
const donorEmail = ref('')

const selectPreset = (amount: number) => {
  selectedPreset.value = amount
  manualInput.value = ''
  manualError.value = ''
}

const onManualInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  manualInput.value = raw
  selectedPreset.value = null

  const num = Number(raw)
  if (raw && num < 10000) {
    manualError.value = 'Minimal donasi Rp 10.000'
  } else {
    manualError.value = ''
  }
}

const selectedAmount = computed(() => {
  if (selectedPreset.value) return selectedPreset.value
  const num = Number(manualInput.value)
  return num >= 10000 ? num : null
})

const canContinue = computed(() => selectedAmount.value !== null && !createMutation.isPending.value)

const handleSubmit = () => {
  const childId = detailQuery.data.value?.data?.id
  if (!childId || !selectedAmount.value) return

  createMutation.mutate(
    {
      slug: slug.value,
      data: {
        grossAmount: selectedAmount.value,
        donorName: donorName.value || undefined,
        donorEmail: donorEmail.value || undefined,
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
          showToast('Berhasil membuat transaksi bantuan', 'success')
          router.push({ path: '/invoices' })
        }
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal membuat transaksi bantuan'), 'error')
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
        {{ detailQuery.data.value?.data?.name ?? '...' }}
      </h1>
    </div>

    <!-- Gray background middle -->
    <div class="flex-1 bg-gray-100 overflow-y-auto flex flex-col">
      <!-- White form card -->
      <div class="bg-white p-6 max-w-md w-full flex flex-col mx-auto space-y-5 flex-1">
        <h2 class="text-center font-semibold text-gray-700">Masukan Nominal Donasi</h2>

        <!-- Preset grid -->
        <div class="flex flex-col gap-3">
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
          <label class="text-sm text-gray-500">Nominal Lainnya</label>
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
              :value="selectedAmount ? formatNumber(selectedAmount) : ''"
              @input="onManualInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="flex-1 outline-none text-sm font-semibold text-gray-800 bg-transparent placeholder-gray-300"
            />
          </div>
          <p v-if="manualError" class="text-xs text-red-500">{{ manualError }}</p>
          <p v-else class="text-xs text-gray-400">Minimal donasi Rp 10.000</p>
        </div>

        <!-- Donor Name -->
        <div>
          <label class="text-sm text-gray-500">Nama Donatur (Opsional)</label>
          <input
            v-model="donorName"
            type="text"
            placeholder="Nama Anda"
            class="w-full border-2 border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 focus:border-primary-400 transition-colors"
          />
        </div>

        <!-- Donor Email -->
        <div>
          <label class="text-sm text-gray-500">Email Donatur (Opsional)</label>
          <input
            v-model="donorEmail"
            type="email"
            placeholder="Email Anda"
            class="w-full border-2 border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 focus:border-primary-400 transition-colors"
          />
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
