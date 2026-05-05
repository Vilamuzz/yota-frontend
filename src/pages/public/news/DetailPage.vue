<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { usePublishedNewsDetail } from '@/composables/news/useNewsDetail'
import { formatDate } from '@/utils/format'
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedNewsDetail(slug)

const news = computed(() => detailQuery.data.value?.data)

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: news.value?.title,
      url: window.location.href,
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-4xl mx-auto px-6 py-12">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-8 group"
      >
        <ArrowLeft :size="20" class="transition-transform group-hover:-translate-x-1" />
        <span class="font-medium">Kembali ke Berita</span>
      </button>

      <!-- Loading State -->
      <div v-if="detailQuery.isPending.value" class="space-y-8">
        <BaseSkeleton variant="image" class="h-100 w-full rounded-3xl" />
        <div class="space-y-4">
          <BaseSkeleton variant="text-2xl" class="w-3/4" />
          <div class="flex gap-4">
            <BaseSkeleton variant="text-sm" class="w-24" />
            <BaseSkeleton variant="text-sm" class="w-24" />
          </div>
        </div>
        <div class="space-y-4">
          <BaseSkeleton variant="text-sm" class="w-full" v-for="i in 6" :key="i" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="detailQuery.isError.value" class="text-center py-24">
        <div class="bg-red-50 text-red-500 p-8 rounded-3xl inline-block">
          <h3 class="text-xl font-bold mb-2">Gagal Memuat Berita</h3>
          <p>{{ detailQuery.error.value?.message || 'Terjadi kesalahan sistem.' }}</p>
          <BaseButton variant="outline" class="mt-6" @click="detailQuery.refetch()">
            Coba Lagi
          </BaseButton>
        </div>
      </div>

      <!-- Content -->
      <article v-else-if="news" class="space-y-10">
        <!-- Header -->
        <header class="space-y-6">
          <div class="relative h-112.5 rounded-3xl overflow-hidden shadow-2xl">
            <img :src="news.coverImage" :alt="news.title" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-8 left-8 right-8">
              <span
                class="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-lg mb-4 inline-block"
              >
                {{ news.category.replace('-', ' ').toUpperCase() }}
              </span>
              <h1 class="text-3xl md:text-4xl font-black text-white leading-tight">
                {{ news.title }}
              </h1>
            </div>
          </div>

          <div
            class="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-gray-100"
          >
            <div class="flex items-center gap-6 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <User :size="16" class="text-primary-500" />
                <span class="font-semibold text-gray-900">Admin YOTA</span>
              </div>
              <div class="flex items-center gap-2">
                <Calendar :size="16" />
                <span>{{ formatDate(news.publishedAt || news.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock :size="16" />
                <span>5 menit baca</span>
              </div>
            </div>

            <button
              @click="handleShare"
              class="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl transition-all font-bold text-sm"
            >
              <Share2 :size="18" />
              <span>Bagikan</span>
            </button>
          </div>
        </header>

        <!-- Body -->
        <div
          class="prose prose-lg max-w-none prose-primary prose-headings:font-black prose-p:leading-relaxed prose-img:rounded-3xl prose-a:text-primary-600"
        >
          <div v-html="news.content"></div>
        </div>

        <!-- Media Gallery (if any) -->
        <section
          v-if="news.medias && news.medias.length > 0"
          class="space-y-6 pt-10 border-t border-gray-100"
        >
          <h2 class="text-2xl font-black text-gray-900">Galeri Media</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="media in news.medias"
              :key="media.id"
              class="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img :src="media.url" :alt="media.alt" class="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <!-- Footer Info -->
        <footer
          class="pt-10 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold"
            >
              Y
            </div>
            <div>
              <p class="font-bold text-gray-900 leading-tight">Yayasan Orang Tua Asuh</p>
              <p class="text-sm text-gray-500">Membantu masa depan anak Indonesia</p>
            </div>
          </div>

          <BaseButton variant="outline" :to="{ name: 'news' }"> Lihat Berita Lainnya </BaseButton>
        </footer>
      </article>
    </div>
  </PublicLayout>
</template>

<style scoped>
/* Ensure content images are responsive and stylized */
:deep(.prose img) {
  @apply shadow-xl border border-gray-100;
}
</style>
