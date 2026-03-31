<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SubscriptionInfo from '@/components/molecules/SubscriptionInfo.vue'

const route = useRoute()
const router = useRouter()

const program = {
  title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
  image: 'https://placehold.co/1200x600',
  minimum: 500000,
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

const goToForm = () => {
  router.push({
    name: 'social-program-form',
    params: { slug: route.params.slug },
  })
}
</script>

<template>
  <div
    class="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 font-[Poppins]"
  >
    <!-- Back Button -->
    <button
      class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
      @click="$router.back()"
    >
      <ArrowLeft :size="28" />
    </button>

    <!-- Title -->
    <h1 class="text-lg md:text-xl font-bold text-[var(--color-primary-500)] line-clamp-1">
      {{ program.title }}
    </h1>
  </div>

  <!-- Hero -->
  <div class="relative">
    <img :src="program.image" class="w-full h-[55vh] object-cover" />
  </div>

  <!-- Content -->
  <div class="max-w-5xl mx-auto px-6 py-8 font-[Poppins]">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-[var(--color-primary-500)] mb-6">
      {{ program.title }}
    </h1>

    <!-- Minimum -->
    <div class="mb-4">
      <span class="text-gray-500 text-sm">Minimal</span>
      <span class="text-[var(--color-primary-300)] font-bold text-2xl ml-2">
        Rp {{ formatRupiah(program.minimum) }}
      </span>
    </div>

    <!-- Buttons -->
    <div class="flex gap-4 mb-2">
      <BaseButton variant="outline" size="lg" class="flex-1"> Bagikan </BaseButton>

      <BaseButton variant="primary" size="lg" class="flex-1" @click="goToForm">
        Berlangganan
      </BaseButton>
    </div>

    <p class="text-xs text-gray-400 mb-8">*Tagihan akan muncul setiap tanggal 5</p>

    <!-- Deskripsi -->
    <div class="border-t pt-6">
      <h2 class="text-lg font-semibold mb-4">Deskripsi Program</h2>

      <div class="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>
          Program Santunan Rutin Anak Yatim adalah program donasi bulanan yang dirancang untuk
          memastikan anak-anak yatim binaan yayasan mendapatkan dukungan yang stabil dan
          berkelanjutan.
        </p>

        <p>
          Melalui program ini, Orang Tua Asuh dapat berkontribusi secara konsisten setiap bulan
          untuk membantu kebutuhan pendidikan, perlengkapan sekolah, konsumsi harian, serta
          pembinaan akhlak.
        </p>

        <p>
          Setiap donasi akan dikelola secara transparan dan digunakan untuk mendukung kebutuhan
          pendidikan dan kehidupan anak-anak yatim agar mereka tetap mendapatkan masa depan yang
          layak.
        </p>
      </div>
    </div>

    <!-- Component Reusable -->
    <SubscriptionInfo />
  </div>
</template>
