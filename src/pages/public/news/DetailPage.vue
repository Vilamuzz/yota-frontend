<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { usePublishedNewsDetail } from '@/composables/news/useNewsDetail'
import { formatDate } from '@/utils/format'
import { ArrowLeft, Calendar, Clock, Share2, Link2, BookOpen, Tag } from 'lucide-vue-next'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedNewsDetail(slug)

const news = computed(() => detailQuery.data.value?.data)

const estimatedReadingTime = computed(() => {
  if (!news.value?.content) return 1
  const wordCount = news.value.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
})

const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: news.value?.title,
      url: window.location.href,
    })
  } else {
    handleCopyLink()
  }
}

const handleCopyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  showToast('Tautan berhasil disalin!', 'success')
}

const formatCategory = (cat: string) => {
  return cat
    .split(/[-\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
</script>

<template>
  <PublicLayout>
    <!-- Loading State -->
    <div v-if="detailQuery.isPending.value" class="bg-gray-50 min-h-screen pt-28 pb-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <BaseSkeleton variant="image" class="h-120 w-full rounded-3xl" />
        <div class="space-y-4 max-w-3xl">
          <BaseSkeleton variant="text-2xl" class="w-3/4" />
          <BaseSkeleton variant="text-2xl" class="w-1/2" />
          <div class="flex gap-4 pt-2">
            <BaseSkeleton variant="text-sm" class="w-28" />
            <BaseSkeleton variant="text-sm" class="w-28" />
            <BaseSkeleton variant="text-sm" class="w-20" />
          </div>
        </div>
        <div class="space-y-3">
          <BaseSkeleton variant="text-sm" class="w-full" v-for="i in 8" :key="i" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="detailQuery.isError.value" class="bg-gray-50 min-h-screen pt-40 pb-16">
      <div class="max-w-lg mx-auto px-4 text-center">
        <div class="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"
          >
            <BookOpen :size="28" />
          </div>
          <h3 class="text-xl font-black text-gray-900 mb-3">Gagal Memuat Berita</h3>
          <p class="text-gray-500 mb-8">
            {{ detailQuery.error.value?.message || 'Terjadi kesalahan saat memuat artikel ini.' }}
          </p>
          <div class="flex flex-col gap-3">
            <BaseButton variant="primary" @click="detailQuery.refetch()">Coba Lagi</BaseButton>
            <BaseButton variant="outline" @click="router.push({ name: 'news' })"
              >Lihat Berita Lainnya</BaseButton
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="news" class="bg-white min-h-screen">
      <!-- Hero Section: Full-bleed Image -->
      <div class="relative h-[55vh] min-h-100 max-h-155 overflow-hidden">
        <img
          v-if="news.coverImage"
          :src="news.coverImage"
          :alt="news.title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
          <BookOpen :size="64" class="text-gray-400" stroke-width="1" />
        </div>
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10"></div>

        <!-- Back button on hero -->
        <button
          @click="router.back()"
          class="absolute top-8 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-all group"
        >
          <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-1" />
          Kembali
        </button>

        <!-- Hero Text -->
        <div class="absolute bottom-0 left-0 right-0 px-6 md:px-16 lg:px-28 pb-10">
          <div class="max-w-4xl">
            <!-- Category badge -->
            <span
              class="inline-block px-3 py-1 bg-primary-400 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4"
            >
              <Tag :size="10" class="inline mr-1" />
              {{ formatCategory(news.category) }}
            </span>
            <h1
              class="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg"
            >
              {{ news.title }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Article Body -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 xl:px-28">
        <!-- Meta bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-gray-100"
        >
          <div class="flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-black shrink-0"
              >
                Y
              </div>
              <span class="font-semibold text-gray-800">Admin YOTA</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar :size="14" class="text-primary-400" />
              <span>{{ formatDate(news.publishedAt || news.createdAt) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock :size="14" class="text-primary-400" />
              <span>{{ estimatedReadingTime }} menit baca</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handleShare"
              class="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-500 rounded-full transition-all text-sm font-semibold"
            >
              <Share2 :size="14" />
              Bagikan
            </button>
            <button
              @click="handleCopyLink"
              class="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-500 rounded-full transition-all text-sm font-semibold"
            >
              <Link2 :size="14" />
              Salin Tautan
            </button>
          </div>
        </div>

        <!-- Main content two-column layout -->
        <div class="flex gap-12 py-10">
          <!-- Article Body - Left/Main -->
          <div class="flex-1 min-w-0">
            <div
              class="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-1"
              v-html="news.content"
            />

            <!-- Media Gallery -->
            <section
              v-if="news.media && news.media.length > 0"
              class="mt-12 pt-10 border-t border-gray-100 space-y-5"
            >
              <h2 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <span class="w-1 h-6 bg-primary-400 rounded-full inline-block"></span>
                Galeri Media
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="media in news.media"
                  :key="media.id"
                  class="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                >
                  <img
                    :src="media.url"
                    :alt="media.alt"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"
                  >
                    <p class="text-white text-xs font-medium truncate">{{ media.alt }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar - Right -->
          <aside class="hidden lg:block w-64 xl:w-72 shrink-0">
            <div class="sticky top-28 space-y-6">
              <!-- About Author -->
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Diterbitkan Oleh
                </p>
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-black text-sm shrink-0"
                  >
                    Y
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">Yayasan Orang Tua Asuh</p>
                    <p class="text-xs text-gray-500">Admin Resmi YOTA</p>
                  </div>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Mendampingi anak-anak yatim dan piatu menuju masa depan yang lebih cerah.
                </p>
              </div>

              <!-- Article Info -->
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Informasi Artikel
                </p>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <Tag :size="14" class="text-primary-400 shrink-0" />
                  <span>{{ formatCategory(news.category) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar :size="14" class="text-primary-400 shrink-0" />
                  <span>{{ formatDate(news.publishedAt || news.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <Clock :size="14" class="text-primary-400 shrink-0" />
                  <span>{{ estimatedReadingTime }} menit baca</span>
                </div>
              </div>

              <!-- Share -->
              <div class="space-y-2">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Bagikan Artikel
                </p>
                <button
                  @click="handleShare"
                  class="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-400 hover:bg-primary-500 text-white rounded-xl transition-colors text-sm font-bold"
                >
                  <Share2 :size="14" />
                  Bagikan
                </button>
                <button
                  @click="handleCopyLink"
                  class="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-500 rounded-xl transition-all text-sm font-semibold"
                >
                  <Link2 :size="14" />
                  Salin Tautan
                </button>
              </div>

              <!-- Back to List -->
              <BaseButton variant="outline" class="w-full" :to="{ name: 'news' }">
                Lihat Berita Lainnya
              </BaseButton>
            </div>
          </aside>
        </div>

        <!-- Mobile Footer -->
        <div class="lg:hidden flex flex-col gap-3 pb-12 pt-4 border-t border-gray-100">
          <button
            @click="handleShare"
            class="w-full flex items-center justify-center gap-2 py-3 bg-primary-400 hover:bg-primary-500 text-white rounded-xl transition-colors text-sm font-bold"
          >
            <Share2 :size="14" />
            Bagikan Artikel
          </button>
          <BaseButton variant="outline" class="w-full" :to="{ name: 'news' }">
            Lihat Berita Lainnya
          </BaseButton>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
