<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const program = {
  title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
}

const minimum = 500000
const nominal = ref(minimum)

const isValid = computed(() => {
  return nominal.value >= minimum
})
</script>

<template>
  <!-- Sticky Header -->
  <div
    class="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 font-[Poppins]"
  >
    <!-- Back Button -->
    <button
      class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
      @click="router.back()"
    >
      <ArrowLeft :size="28" />
    </button>

    <!-- Title -->
    <h1 class="text-lg md:text-xl font-bold text-[var(--color-primary-500)] line-clamp-1">
      {{ program.title }}
    </h1>
  </div>

  <!-- Form -->
  <div class="max-w-xl mx-auto mt-10 px-6 space-y-6 font-[Poppins]">
    <h2 class="text-lg font-semibold">Masukkan Nominal Donasi</h2>

    <!-- Input -->
    <div>
      <div
        class="flex items-center bg-gray-100 rounded-lg px-4 py-4 text-xl font-semibold transition"
        :class="isValid ? 'border border-green-500' : 'border border-red-400'"
      >
        <span class="mr-3">Rp</span>

        <input v-model.number="nominal" type="number" class="bg-transparent outline-none w-full" />
      </div>

      <p class="text-sm text-gray-500 mt-2">Min. donasi Rp{{ minimum.toLocaleString('id-ID') }}</p>

      <p v-if="nominal < minimum" class="text-red-500 text-sm mt-1">
        Minimal donasi Rp{{ minimum.toLocaleString('id-ID') }}
      </p>
    </div>

    <!-- Button -->
    <button
      :disabled="!isValid"
      class="w-full py-4 rounded-lg text-white font-semibold transition"
      :class="isValid ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'"
    >
      Lanjut pembayaran
    </button>
  </div>
</template>
