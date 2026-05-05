<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { Category, Gender, type FosterChildren } from '@/types/fosterChildren'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
const router = useRouter()
const route = useRoute()

const childSlug = route.params.slug as string

const children = ref<FosterChildren[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    slug: 'faris-ahad',
    gender: Gender.male,
    category: Category.yatim,
    birthPlace: 'Bandung',
    birthDate: '10-05-2014',
    address: 'Jl. Melati No. 12 Bandung',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    achievements: [
      {
        id: '1',
        title: 'Juara 1 Lomba Menggambar 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 1 Lomba Menggambar.pdf',
      },
      {
        id: '2',
        title: 'Juara 2 Lomba Cerdas Cermat 2024',
        url: 'https://www.africau.edu/images/default/sample.pdf',
        alt: 'Juara 2 Lomba Cerdas Cermat.pdf',
      },
    ],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Tia Mutiara',
    slug: 'tia-mutiara',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Garut',
    birthDate: '15-02-2015',
    address: 'Jl. Mawar No. 5 Garut',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    achievements: [
      {
        id: '1',
        title: 'Juara 3 Lomba Menulis Cerpen 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 3 Lomba Menulis Cerpen.pdf',
      }
    ],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Ahmad Rizki',
    slug: 'ahmad-rizki',
    gender: Gender.male,
    category: Category.yatimPiatu,
    birthPlace: 'Tasikmalay',
    birthDate: '20-03-2013',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    profilePicture: 'https://i.pravatar.cc/150?img=4',
    achievements: [
      {
        id: '1',
        title: 'Juara 1 Lomba Pidato 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 1 Lomba Pidato.pdf',
      }
    ],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-03',
  },
])

const child = computed(() => {
  return children.value.find(c => c.slug === childSlug)
})
const handleBack = () => {
  router.push({ name: 'foster-children-detail' })
}

const manualInput = ref('')
const manualError = ref('')
const donorName = ref('')

const formatNumber = (val: string) => {
  const num = val.replace(/\D/g, '')
  return new Intl.NumberFormat('id-ID').format(Number(num || 0))
}

const handleManualInput = (val: string) => {
  const raw = val.replace(/\D/g, '')
  const num = Number(raw)

  if (raw && num < 10000) {
    manualError.value = 'Minimal donasi Rp 10.000'
  } else {
    manualError.value = ''
  }
  manualInput.value = formatNumber(raw)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="sticky top-0 z-40 bg-white px-6 py-4 flex items-center gap-4 font-poppins">
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
        @click="handleBack"
      >
        <ArrowLeft :size="28" />
      </button>

      <!-- Title -->
      <h1 class="text-lg md:text-xl font-bold text-color-primary-500)] line-clamp-1">
        {{ child?.name }}
      </h1>
    </div>

    <div class="bg-white rounded-xl border-gray-100 shadow-sm overflow-hidden mx-auto mt-5 w-[90%]">
      <div class="p-6 space-y-5">
        <!-- Judul -->
        <h2 class="text-left text-2xl font-bold text-black">
          Masukan Nominal Donasi
        </h2>

        <!-- Preset -->
        <div class="grid grid-cols-2 gap-3">
          <BaseButton
            v-for="amount in [10000,20000,50000,100000]"
            :key="amount"
            variant="outline"
            size="lg"
            class="text-xl font-semibold border-2 border-gray-200 text-black"
            @click="handleManualInput(amount.toString())"
          >
            Rp {{ new Intl.NumberFormat('id-ID').format(amount) }}
          </BaseButton>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-200" />
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <div class="space-y-2">
          <BaseInput
            id="amount"
            v-model="manualInput"
            label="Nominal Lainnya"
            placeholder="0"
            size="lg"
            :error="manualError"
            :hint="!manualError ? 'Minimal donasi Rp 10.000' : ''"
            @update:model-value="handleManualInput"
            class="[&>label]:text-black"
          >
            <template #prefix>
              <span class="text-black font-semibold font-poppins">Rp</span>
            </template>
          </BaseInput>

          <BaseInput
            id="donorName"
            v-model="donorName"
            label="Nama Donatur"
            placeholder="Nama (opsional)"
            size="lg"
            class="[&>label]:text-black"
          />
        </div>

        <BaseButton
          variant="primary"
          size="lg"
          :fullWidth="true"
          :disabled="!!manualError || !manualInput"
        >
          Lanjut Pembayaran
        </BaseButton>
      </div>
    </div>
  </div>
</template>
