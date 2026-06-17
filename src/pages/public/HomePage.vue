<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { formatCurrency, formatDate } from '@/utils/format'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { usePublishedNewsList } from '@/composables/news/useNewsList'
import { usePublishedGalleryList } from '@/composables/gallery/useGalleryList'
import { useFoundationProfileStore } from '@/stores/foundationProfile'

const foundationProfileStore = useFoundationProfileStore()
const router = useRouter()

// Hero carousel
const currentSlide = ref(0)
const slides = computed(() => [
  {
    image: foundationProfileStore.heroImages[0],
    title: 'Selamat Datang di Yayasan Orang Tua Asuh',
    subtitle:
      'Menghadirkan kepedulian yang berkelanjutan bagi masa depan anak-anak kurang mampu di pelosok negeri.',
    buttonText: 'Tentang Kami',
    buttonLink: '/about',
  },
  {
    image: foundationProfileStore.heroImages[1],
    title: 'Rekomendasikan Calon Anak Asuh',
    subtitle:
      'Bantu anak kurang mampu di sekitar Anda mendapatkan bantuan pendidikan dengan merekomendasikan mereka sebagai anak asuh.',
    buttonText: 'Ajukan Calon Anak Asuh',
    buttonLink: '/foster-children/submission',
  },
  {
    image: foundationProfileStore.heroImages[2],
    title: 'Layanan Ambulans Gratis 24 Jam',
    subtitle:
      'Butuh armada darurat medis? Yayasan Orang Tua Asuh menyediakan peminjaman mobil ambulans gratis bagi masyarakat yang membutuhkan.',
    buttonText: 'Ajukan Peminjaman Ambulans',
    buttonLink: '/ambulance/request',
  },
])

let slideInterval: number | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
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

const { donationPrograms, isLoading: isDonationLoading } = useDonationProgramList({ limit: 3 })
const { news: latestNews, isLoading: isNewsLoading } = usePublishedNewsList({ limit: 3 })
const { galleries, isLoading: isGalleryLoading } = usePublishedGalleryList({ limit: 5 })
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
          <template v-if="slide.image">
            <!-- First slide: eager load with high fetch priority (this IS the LCP element) -->
            <img
              v-if="index === 0"
              :src="slide.image"
              :alt="slide.title"
              class="w-full h-full object-cover"
              fetchpriority="high"
            />
            <!-- Other slides: lazy is fine — they're hidden behind opacity:0 -->
            <img
              v-else
              :src="slide.image"
              :alt="slide.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </template>
          <!-- Fallback Skeleton -->
          <div v-else class="w-full h-full bg-gray-200 animate-pulse"></div>

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black opacity-50"></div>

          <!-- Slide Content (Centered on Screen) -->
          <div
            class="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24"
          >
            <h1
              class="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 uppercase tracking-wide drop-shadow-md"
            >
              {{ slide.title }}
            </h1>
            <p
              class="text-base md:text-xl lg:text-2xl text-white opacity-90 max-w-3xl mb-8 leading-relaxed drop-shadow-sm"
            >
              {{ slide.subtitle }}
            </p>

            <div v-if="slide.buttonText">
              <RouterLink
                :to="slide.buttonLink"
                class="inline-flex items-center gap-2 bg-primary-500 text-white font-bold text-sm md:text-base px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg transition-all duration-300"
              >
                {{ slide.buttonText }}
              </RouterLink>
            </div>
          </div>
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

          <div class="w-40 h-40 md:w-56 md:h-56 shrink-0 mx-auto md:mx-0">
            <img
              v-if="foundationProfileStore.founderPicture"
              :src="foundationProfileStore.founderPicture"
              :alt="foundationProfileStore.founderName"
              class="w-full h-full object-cover rounded-full shadow-md"
              loading="lazy"
            />
            <BaseSkeleton
              v-else
              variant="image"
              class="w-full h-full object-cover rounded-full shadow-md"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Donation Section -->
    <section class="w-full pt-16">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">
          Program Donasi Berjalan
        </h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Program Donasi yang sedang berlangsung pada Yayasan Orang Tua Asuh.
        </p>
        <!-- Loading Skeletons -->
        <div v-if="isDonationLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white rounded-xl overflow-hidden flex flex-col p-4 gap-4 border border-gray-100 shadow-sm"
          >
            <BaseSkeleton variant="image" class="h-48 w-full rounded-lg" />
            <BaseSkeleton variant="text-lg" class="w-3/4" />
            <div class="space-y-2 mt-auto">
              <BaseSkeleton variant="text-sm" class="w-1/2" />
              <BaseSkeleton class="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="donationPrograms.length === 0" class="text-center py-12 text-gray-500">
          Belum ada program donasi berjalan saat ini.
        </div>

        <!-- Donation Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="donation in donationPrograms"
            :key="donation.id"
            class="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
            @click="router.push('/donation-programs/' + donation.slug)"
          >
            <!-- Image: top 50% -->
            <div class="h-48 shrink-0">
              <img
                :src="donation.coverImage"
                :alt="donation.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
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
                    formatCurrency(donation.collectedFund)
                  }}</span>
                  <span class="text-gray-400"> / {{ formatCurrency(donation.fundTarget) }}</span>
                </p>
                <!-- Progress Bar -->
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-400 rounded-full transition-all duration-500"
                    :style="{
                      width: `${Math.min((donation.collectedFund / donation.fundTarget) * 100, 100)}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <RouterLink
          to="/donation-programs"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></RouterLink
        >
      </div>
    </section>

    <!-- News Section -->
    <section class="w-full pt-16">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">Berita Terbaru</h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Berita dan kegiatan terkini Yayasan Orang Tua Asuh.
        </p>
        <!-- Loading Skeletons -->
        <div v-if="isNewsLoading" class="flex flex-col gap-6">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white rounded-xl overflow-hidden flex flex-col sm:flex-row gap-4 p-5 border border-gray-100 shadow-sm"
          >
            <BaseSkeleton class="w-full sm:w-[40%] h-48 sm:h-64 shrink-0 rounded-lg" />
            <div class="flex flex-col justify-center gap-3 flex-1">
              <BaseSkeleton variant="text-xs" class="w-24" />
              <BaseSkeleton variant="text-lg" class="w-3/4" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="latestNews.length === 0" class="text-center py-12 text-gray-500">
          Belum ada berita terbaru saat ini.
        </div>

        <!-- News Cards -->
        <div v-else class="flex flex-col gap-6">
          <div
            v-for="news in latestNews"
            :key="news.id"
            class="bg-white rounded-xl hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col sm:flex-row cursor-pointer"
            @click="router.push('/news/' + news.slug)"
          >
            <!-- Image: left ~30% on larger screens -->
            <div class="w-full sm:w-[40%] h-48 sm:h-64 shrink-0">
              <img
                :src="news.coverImage"
                :alt="news.title"
                class="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                loading="lazy"
              />
            </div>

            <!-- Content -->
            <div class="flex flex-col justify-center gap-2 p-5 flex-1">
              <p class="text-xs text-gray-400">
                {{ formatDate(news.publishedAt || news.createdAt) }}
              </p>
              <h3 class="font-semibold text-gray-900 text-base leading-snug">{{ news.title }}</h3>
            </div>
          </div>
        </div>
        <RouterLink
          to="/news"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></RouterLink
        >
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="w-full mt-16">
      <div class="max-w-7xl mx-auto py-8 px-6 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-left">
          Galeri Yayasan OTA
        </h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          Dokumentasi kegiatan sosial, penyaluran donasi, serta momen kebersamaan Yayasan Orang Tua
          Asuh bersama anak asuh dan masyarakat.
        </p>
        <!-- Loading Skeletons -->
        <div v-if="isGalleryLoading" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSkeleton class="h-72 w-full rounded-xl" v-for="i in 2" :key="i" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BaseSkeleton class="h-56 w-full rounded-xl" v-for="i in 3" :key="i" />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="galleries.length === 0" class="text-center py-12 text-gray-500">
          Belum ada galeri dokumentasi saat ini.
        </div>

        <!-- Gallery Grid -->
        <div v-else class="flex flex-col gap-4">
          <!-- Row 1: 2 images -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="item in galleries.slice(0, 2)"
              :key="item.id"
              class="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer h-72"
              @click="router.push('/gallery/' + item.slug)"
            >
              <img
                :src="item.coverImage"
                :alt="item.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
          <!-- Row 2: 3 images -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="item in galleries.slice(2, 5)"
              :key="item.id"
              class="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer h-56"
              @click="router.push('/gallery/' + item.slug)"
            >
              <img
                :src="item.coverImage"
                :alt="item.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <RouterLink
          to="/gallery"
          class="text-primary-500 hover:text-primary-600 mt-10 text-right flex justify-end"
          >Selengkapnya >></RouterLink
        >
      </div>
    </section>
  </PublicLayout>
</template>
