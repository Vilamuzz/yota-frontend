<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { usePublishedGalleryDetail } from '@/composables/gallery/useGalleryDetail'
import { usePublishedGalleryList } from '@/composables/gallery/useGalleryList'
import GalleryCard from '@/components/molecules/GalleryCard.vue'
import type { GalleryQueryParams } from '@/types/gallery'
import { formatDate } from '@/utils/format'
import { ArrowLeft, Calendar, Image as ImageIcon, Share2, Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedGalleryDetail(slug)

const gallery = computed(() => detailQuery.data.value?.data)

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: gallery.value?.title,
      url: window.location.href,
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}

// --- Related Galleries ---
const relatedGalleryParams = reactive<GalleryQueryParams>({
  limit: 4, // Fetch 4 so we can filter out the current one and have 3 left
  page: 1,
  sortBy: 'views desc',
  category: undefined,
})

const { galleries: relatedGalleryData, listQuery: relatedQuery } =
  usePublishedGalleryList(relatedGalleryParams)

watch(
  gallery,
  (newGallery) => {
    if (newGallery?.category) {
      relatedGalleryParams.category = newGallery.category as any
    }
  },
  { immediate: true },
)

const filteredRelatedGalleries = computed(() => {
  if (!relatedGalleryData.value) return []
  return relatedGalleryData.value.filter((g) => g.id !== gallery.value?.id).slice(0, 3)
})
</script>

<template>
  <PublicLayout>
    <div class="max-w-6xl mx-auto px-6 pt-28 pb-12">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4 group"
      >
        <ArrowLeft :size="20" class="transition-transform group-hover:-translate-x-1" />
        <span class="font-medium">Kembali ke Galeri</span>
      </button>

      <!-- Loading State -->
      <div v-if="detailQuery.isPending.value" class="space-y-8">
        <BaseSkeleton variant="image" class="h-100 w-full rounded-3xl" />
        <div class="space-y-4">
          <BaseSkeleton variant="text-2xl" class="w-1/2" />
          <BaseSkeleton variant="text-sm" class="w-32" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BaseSkeleton v-for="i in 8" :key="i" class="aspect-square rounded-2xl" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="detailQuery.isError.value" class="text-center py-24">
        <div class="bg-red-50 text-red-500 p-8 rounded-3xl inline-block">
          <h3 class="text-xl font-bold mb-2">Gagal Memuat Galeri</h3>
          <p>{{ detailQuery.error.value?.message || 'Terjadi kesalahan sistem.' }}</p>
          <BaseButton variant="outline" class="mt-6" @click="detailQuery.refetch()">
            Coba Lagi
          </BaseButton>
        </div>
      </div>

      <!-- Content -->
      <article v-else-if="gallery" class="space-y-12">
        <!-- Header -->
        <header class="space-y-8">
          <div class="relative h-112.5 rounded-3xl overflow-hidden shadow-2xl">
            <img
              :src="gallery.coverImage"
              :alt="gallery.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <div
              class="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div class="space-y-4">
                <span
                  class="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-lg inline-block"
                >
                  {{ gallery.category.replace('-', ' ').toUpperCase() }}
                </span>
                <h1 class="text-3xl md:text-5xl font-black text-white leading-tight">
                  {{ gallery.title }}
                </h1>
                <div class="flex items-center gap-4 text-white/80 text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Calendar :size="16" />
                    <span>{{ formatDate(gallery.publishedAt || gallery.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <ImageIcon :size="16" />
                    <span>{{ gallery.media?.length || 0 }} Foto</span>
                  </div>
                </div>
              </div>

              <button
                @click="handleShare"
                class="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl transition-all font-bold text-sm"
              >
                <Share2 :size="18" />
                <span>Bagikan Momen</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Description Section -->
        <section v-if="gallery.description" class="max-w-3xl">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Tentang Galeri</h2>
          <div class="prose prose-primary max-w-none text-gray-600 leading-relaxed">
            <div v-html="gallery.description"></div>
          </div>
        </section>

        <!-- Media Grid -->
        <section v-if="gallery.media && gallery.media.length > 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black text-gray-900">Koleksi Foto</h2>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <div
              v-for="media in gallery.media"
              :key="media.id"
              class="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm border border-gray-100"
            >
              <img :src="media.url" :alt="media.alt" class="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <!-- Related Galleries -->
        <section class="pt-12 border-t border-gray-100">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-black text-gray-900">Galeri Terkait</h2>
            <BaseButton variant="outline" :to="{ name: 'gallery' }">Lihat Semua</BaseButton>
          </div>

          <div v-if="relatedQuery.isPending.value" class="flex justify-center py-12">
            <Loader2 class="w-8 h-8 text-primary-500 animate-spin" />
          </div>

          <div
            v-else-if="filteredRelatedGalleries.length > 0"
            class="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GalleryCard v-for="item in filteredRelatedGalleries" :key="item.id" :gallery="item" />
          </div>

          <div v-else class="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <ImageIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">Belum ada galeri terkait.</p>
          </div>
        </section>
      </article>
    </div>
  </PublicLayout>
</template>
