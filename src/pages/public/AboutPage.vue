<script setup lang="ts">
import { computed } from 'vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useFoundationProfileStore } from '@/stores/foundationProfile'

const foundationProfileStore = useFoundationProfileStore()

const mapSrc = computed(() => {
  const address = foundationProfileStore.embeddedAddress
  if (!address) return ''
  if (address.includes('<iframe')) {
    const match = address.match(/src="([^"]+)"/)
    return match ? match[1] : address
  }
  return address
})
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Slides -->
      <div class="relative w-full h-full">
        <div class="absolute inset-0">
          <!-- Background Image -->
          <img
            :src="foundationProfileStore.heroImages[3]"
            :alt="foundationProfileStore.foundationName"
            class="w-full h-full object-cover"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>

        <!-- Text Content -->
        <div
          class="absolute inset-0 flex flex-col items-center justify-center text-white px-4 z-10"
        >
          <h1 class="text-5xl md:text-6xl font-bold mb-6 text-center drop-shadow-lg">
            Tentang Kami
          </h1>
          <p class="text-xl md:text-2xl text-center max-w-3xl drop-shadow-md">
            Mengenal lebih dekat visi, misi, dan perjalanan
            {{ foundationProfileStore.foundationName }}.
          </p>
        </div>
      </div>
    </div>

    <!-- Vision & Mission Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-12 px-6 md:px-12 lg:px-24">
        <div class="flex flex-col md:flex-row items-center gap-32">
          <div class="h-full w-1/4 shrink-0">
            <img
              v-if="foundationProfileStore.founderPicture"
              :src="foundationProfileStore.founderPicture"
              :alt="foundationProfileStore.founderName"
              class="w-full h-full object-cover rounded-full shadow-md mb-4"
            />
            <BaseSkeleton
              v-else
              variant="image"
              class="w-full h-full object-cover rounded-full shadow-md"
            />
            <div class="bg-primary-500 rounded-lg text-white text-center py-2 px-4">
              <h2>Pendiri {{ foundationProfileStore.foundationName }}</h2>
              <h3 class="font-bold">{{ foundationProfileStore.founderName }}</h3>
            </div>
          </div>

          <div class="flex-1">
            <h2 class="text-xl md:text-xl font-bold text-gray-900 mb-4">Visi</h2>
            <p class="text-gray-600 leading-relaxed">
              Mewujudkan masyarakat yang peduli, berdaya, dan berkeadilan melalui pengelolaan
              kegiatan sosial dan kemanusiaan yang berkelanjutan.
            </p>
            <h2 class="text-xl md:text-xl font-bold text-gray-900 mt-8 mb-4">Misi</h2>
            <ul class="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                Menyelenggarakan berbagai kegiatan sosial dan kemanusiaan yang berdampak langsung
                bagi masyarakat yang membutuhkan.
              </li>
              <li>
                Mengelola dan menyalurkan donasi secara transparan, akuntabel, dan tepat sasaran.
              </li>
              <li>
                Mendukung pendampingan sosial, pendidikan, dan kesejahteraan anak asuh serta
                kelompok rentan lainnya.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Organizational Structure Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-36 px-6 md:px-12 lg:px-24">
        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold text-gray-900">Struktur Organisasi</h2>
          <p class="text-gray-600">
            Berikut adalah struktur organisasi dari Yayasan OTA yang terdiri dari berbagai divisi
            dan tim yang bekerja sama untuk mencapai visi dan misi kami.
          </p>
        </div>

        <div class="flex justify-center">
          <img
            :src="foundationProfileStore.organizationStructure"
            :alt="foundationProfileStore.foundationName"
            class="w-full max-w-5xl rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="w-full mb-20">
      <div class="max-w-7xl mx-auto mt-36 px-6 md:px-12 lg:px-24">
        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold text-gray-900">
            Lokasi Posko {{ foundationProfileStore.foundationName }}
          </h2>
          <p class="text-gray-600">
            {{ foundationProfileStore.foundationAddress }}
          </p>
        </div>

        <div class="flex justify-center">
          <iframe
            :src="
              mapSrc ||
              'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.04203287725!2d110.83104877419785!3d-7.678630392338282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a3c6d121162bf%3A0x9aee413079da81cd!2sBulusari%2C%20Sukoharjo%2C%20Kec.%20Sukoharjo%2C%20Kabupaten%20Sukoharjo%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1772423957794!5m2!1sid!2sid'
            "
            width="95%"
            height="450"
            style="border: 0"
            allowfullscreen="false"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>
