<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const router = useRouter()

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

const goToSlide = (index: number) => {
  currentSlide.value = index
}

onMounted(() => {
  slideInterval = window.setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

const featuredDonations = [
  {
    title: 'Bantu Pendidikan Anak Kurang Mampu di Pelosok Negeri',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    collected: 14500000,
    target: 25000000,
  },
  {
    title: 'Pengadaan Ambulans untuk Daerah Terpencil',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&h=400&fit=crop',
    collected: 38000000,
    target: 50000000,
  },
  {
    title: 'Bantuan Sembako untuk Korban Bencana Alam',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
    collected: 9200000,
    target: 20000000,
  },
]

const formatFund = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const galleryImages = [
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=400&fit=crop',
]

const latestNews = [
  {
    title: 'Yota Salurkan Bantuan kepada 500 Keluarga Terdampak Banjir di Kalimantan',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop',
    date: '28 Februari 2026',
  },
  {
    title: 'Program Beasiswa Yota Buka Pendaftaran untuk Tahun Ajaran 2026/2027',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    date: '20 Februari 2026',
  },
  {
    title: 'Ambulans Baru Siap Beroperasi di Wilayah Terpencil Nusa Tenggara',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&h=300&fit=crop',
    date: '10 Februari 2026',
  },
]
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Slides -->
      <div class="relative w-full h-full">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000"
          :class="currentSlide === index ? 'opacity-100' : 'opacity-0'"
        >
          <!-- Background Image -->
          <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>

      <!-- Slide Indicators -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="
            currentSlide === index ? 'bg-white w-8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
          "
        ></button>
      </div>
    </div>

    <!-- Welcome Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-12 px-6 md:px-12 lg:px-24">
        <div class="flex flex-col md:flex-row items-center gap-10">
          <div class="flex-1">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Selamat Datang di Yayasan Orang Tua Asuh
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Yayasan Orang Tua Asuh adalah lembaga sosial yang bergerak dalam kegiatan kemanusiaan
              melalui pendampingan anak asuh, pengelolaan program sosial, dan penyaluran donasi
              secara transparan. Bersama masyarakat, kami berupaya menghadirkan kepedulian yang
              berkelanjutan bagi masa depan anak-anak yang membutuhkan
            </p>
          </div>

          <div class="w-40 h-40 md:w-56 md:h-56 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
              alt="Welcome"
              class="w-full h-full object-cover rounded-full shadow-md"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Donation Section -->
    <section class="w-full py-16">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">
          Donasi Berjalan
        </h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Donasi yang sedang berlangsung pada Yayasan Orang Tua Asuh.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="donation in featuredDonations"
            :key="donation.title"
            class="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
            @click="router.push('/donate')"
          >
            <!-- Image: top 50% -->
            <div class="h-48 shrink-0">
              <img :src="donation.image" :alt="donation.title" class="w-full h-full object-cover" />
            </div>

            <!-- Content -->
            <div class="flex flex-col gap-3 p-4 flex-1">
              <h3 class="font-semibold text-gray-900 text-base leading-snug">
                {{ donation.title }}
              </h3>
              <div class="mt-auto flex flex-col gap-2">
                <p class="text-sm text-gray-500">
                  Terkumpul:
                  <span class="font-semibold text-primary-500">{{
                    formatFund(donation.collected)
                  }}</span>
                  <span class="text-gray-400"> / {{ formatFund(donation.target) }}</span>
                </p>
                <!-- Progress Bar -->
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-400 rounded-full transition-all duration-500"
                    :style="{
                      width: `${Math.min((donation.collected / donation.target) * 100, 100)}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <router-link
          to="/donation"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></router-link
        >
      </div>
    </section>

    <!-- News Section -->
    <section class="w-full py-16">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">Berita Terbaru</h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Berita dan kegiatan terkini Yayasan Orang Tua Asuh.
        </p>
        <div class="flex flex-col gap-6 ml-15">
          <div
            v-for="news in latestNews"
            :key="news.title"
            class="bg-white rounded-xl hover:shadow-lg transition-shadow duration-200 overflow-hidden flex cursor-pointer"
            @click="router.push('/news')"
          >
            <!-- Image: left ~30% -->
            <div class="w-[40%] h-64 shrink-0">
              <img
                :src="news.image"
                :alt="news.title"
                class="w-full h-full object-cover rounded-l-lg"
              />
            </div>

            <!-- Content -->
            <div class="flex flex-col justify-center gap-2 p-5">
              <p class="text-xs text-gray-400">{{ news.date }}</p>
              <h3 class="font-semibold text-gray-900 text-base leading-snug">{{ news.title }}</h3>
            </div>
          </div>
        </div>
        <router-link
          to="/news"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></router-link
        >
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="w-full mt-16">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">
          Galeri Yayasan OTA
        </h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Dokumentasi kegiatan sosial, penyaluran donasi, serta momen kebersamaan Yayasan Orang Tua
          Asuh bersama anak asuh dan masyarakat.
        </p>
        <div class="flex flex-col gap-4">
          <!-- Row 1: 2 images -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="img in galleryImages.slice(0, 2)"
              :key="img"
              class="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer h-72"
            >
              <img
                :src="img"
                alt="Gallery"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <!-- Row 2: 3 images -->
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="img in galleryImages.slice(2, 5)"
              :key="img"
              class="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer h-56"
            >
              <img
                :src="img"
                alt="Gallery"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
        <router-link
          to="/gallery"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></router-link
        >
      </div>
    </section>
  </PublicLayout>
</template>
