<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePublishedDonationDetail } from '@/composables/donation/usePublishedDonationDetail'
import { useDonationTransactionCreate } from '@/composables/donationTransaction/useDonationTransactionCreate'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Composables
const { publishedDonationDetailQuery } = usePublishedDonationDetail(slug)
const { createMutation, createError } = useDonationTransactionCreate()

const handleBack = () => {
  window.history.back()
}

const presets = [10000, 20000, 30000, 50000]

const selectedPreset = ref<number | null>(null)
const manualInput = ref('')
const manualError = ref('')
const donorName = ref('')
const donorEmail = ref('')
const prayerContent = ref('')

const prayerTemplates = [
  {
    label: 'Semoga Lekas Sembuh',
    text: 'Semoga diberi kesembuhan, kekuatan, dan kemudahan dalam setiap prosesnya. Aamiin.',
  },
  {
    label: 'Semangat & Kuat',
    text: 'Tetap semangat, semoga selalu dikuatkan dan dipermudah jalannya. Kamu tidak sendiri.',
  },
  {
    label: 'Rezeki & Kemudahan',
    text: 'Semoga dibukakan pintu rezeki, dipermudah urusannya, dan diberi jalan terbaik.',
  },
  {
    label: 'Untuk Keluarga',
    text: 'Semoga keluarga diberikan ketabahan, kesehatan, dan kekuatan. Semoga segera ada kabar baik.',
  },
  {
    label: 'Niat Baik',
    text: 'Semoga niat baik ini menjadi manfaat dan membawa kebaikan bagi semua pihak.',
  },
] as const

const selectedPrayerTemplateIndex = ref<number | null>(null)

const applyPrayerTemplate = (index: number) => {
  const template = prayerTemplates[index]
  if (!template) return
  selectedPrayerTemplateIndex.value = index
  prayerContent.value = template.text
}

const onPrayerInput = () => {
  const index = selectedPrayerTemplateIndex.value
  if (index === null) return
  const template = prayerTemplates[index]
  if (!template) {
    selectedPrayerTemplateIndex.value = null
    return
  }
  if (prayerContent.value !== template.text) {
    selectedPrayerTemplateIndex.value = null
  }
}

const formatDisplay = (amount: number) => new Intl.NumberFormat('id-ID').format(amount)

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

const handleSubmit = async () => {
  const donationId = publishedDonationDetailQuery.data.value?.data?.id
  if (!donationId || !selectedAmount.value) return

  const response = await createMutation.mutateAsync({
    donation_id: donationId,
    gross_amount: selectedAmount.value,
    donor_name: donorName.value || '',
    donor_email: donorEmail.value || '',
    prayer_content: prayerContent.value || '',
  })

  const snapToken = response?.data?.snap_token
  if (snapToken && window.snap) {
    window.snap.pay(snapToken, {
      onSuccess: function () {
        window.location.href =
          '/donation/callback?order_id=' + response.data.order_id + '&transaction_status=settlement'
      },
      onPending: function () {
        window.location.href =
          '/donation/callback?order_id=' + response.data.order_id + '&transaction_status=pending'
      },
      onError: function () {
        window.location.href =
          '/donation/callback?order_id=' + response.data.order_id + '&transaction_status=error'
      },
      onClose: function () {
        // Handle when user closes the modal without completing payment
      },
    })
  }
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
        {{ publishedDonationDetailQuery.data.value?.data?.title ?? '...' }}
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
            Rp {{ formatDisplay(amount) }}
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
              :value="selectedAmount ? formatDisplay(selectedAmount) : ''"
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

        <!-- Prayer Content -->
        <div class="space-y-2">
          <label class="text-sm text-gray-500">Doa / Pesan (Opsional)</label>

          <!-- Prayer Templates -->
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="(tpl, idx) in prayerTemplates"
              :key="tpl.label"
              type="button"
              @click="applyPrayerTemplate(idx)"
              :class="[
                'rounded-md border-2 px-3 py-2 text-xs font-semibold transition-colors',
                selectedPrayerTemplateIndex === idx
                  ? 'border-primary-400 bg-primary-400 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-400 hover:text-primary-400',
              ]"
            >
              {{ tpl.label }}
            </button>
          </div>

          <textarea
            v-model="prayerContent"
            @input="onPrayerInput"
            placeholder="Tulis doa atau pesan untuk penerima manfaat..."
            class="w-full border-2 border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 focus:border-primary-400 transition-colors resize-none h-24"
          />
        </div>
      </div>
    </div>

    <!-- Bottom button (non-scrollable) -->
    <div class="bg-gray-100 px-6">
      <div class="max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-4">
        <p v-if="createError" class="text-xs text-red-500 text-center mb-2">{{ createError }}</p>
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
