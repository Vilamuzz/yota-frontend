<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

// Hero carousel
const currentSlide = ref(0)
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=600&fit=crop',
    title: 'Build Your Future',
    subtitle: 'Transform your ideas into reality with our powerful platform',
  },
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=600&fit=crop',
    title: 'Connect & Collaborate',
    subtitle: 'Join a community of innovators and creators',
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=600&fit=crop',
    title: 'Grow Together',
    subtitle: 'Scale your projects with cutting-edge tools and support',
  },
]

let slideInterval: number | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

onMounted(() => {
  slideInterval = window.setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
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
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=600&fit=crop"
            class="w-full h-full object-cover"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>
    </div>

    <!-- Vision & Mission Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-12 px-6 md:px-12 lg:px-24">
        <div class="flex flex-col md:flex-row items-center gap-10">
          <div class="w-40 h-full md:w-56 md:h-full shrink-0">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
              alt="Welcome"
              class="w-full h-full object-cover rounded-full shadow-md mb-4"
            />
            <div class="bg-primary-500 rounded-lg text-white text-center py-2 px-4">
              <h2>Pendiri Yayasan OTA</h2>
              <h3 class="font-bold">John Doe</h3>
            </div>
          </div>

          <div class="flex-1">
            <h2 class="text-xl md:text-xl font-bold text-gray-900 mb-4">Visi</h2>
            <p class="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit quo suscipit velit
              corrupti eos doloremque accusantium delectus neque possimus, quasi ullam nobis nulla.
              Similique veritatis quos molestiae debitis maiores nisi?
            </p>
            <h2 class="text-xl md:text-xl font-bold text-gray-900 mt-8 mb-4">Misi</h2>
            <ul class="list-disc pl-6 text-gray-600 space-y-2">
              <li>Meningkatkan kualitas pendidikan di daerah terpencil</li>
              <li>Membangun komunitas yang kolaboratif dan inovatif</li>
              <li>Mendorong penggunaan teknologi untuk pembelajaran yang lebih efektif</li>
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
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=600&fit=crop"
            alt="Struktur Organisasi"
            class="w-full max-w-5xl rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-36 px-6 md:px-12 lg:px-24">
        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold text-gray-900">Lokasi Posko OTA</h2>
          <p class="text-gray-600">
            Posko Orang Tua Asuh beralamatkan pada Bulusari, Kelurahan Sukoharjo, Kecamatan
            Sukoharjo, Kabupaten Sukoharjo, Jawa Tengah 57512
          </p>
          <p class="text-gray-600 mt-10">Koordinat:</p>
        </div>

        <div class="flex justify-center">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.04203287725!2d110.83104877419785!3d-7.678630392338282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a3c6d121162bf%3A0x9aee413079da81cd!2sBulusari%2C%20Sukoharjo%2C%20Kec.%20Sukoharjo%2C%20Kabupaten%20Sukoharjo%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1772423957794!5m2!1sid!2sid"
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
