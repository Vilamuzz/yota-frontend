<script setup lang="ts">
import { computed, reactive, watch, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { usePublishedGalleryDetail } from '@/composables/gallery/useGalleryDetail'
import { usePublishedGalleryList } from '@/composables/gallery/useGalleryList'
import GalleryCard from '@/components/molecules/GalleryCard.vue'
import type { GalleryQueryParams } from '@/types/gallery'
import { formatDate } from '@/utils/format'
import { ArrowLeft, Calendar, Image as ImageIcon, Share2, Loader2, X, MessageCircle, Twitter, Facebook, Send, Link2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedGalleryDetail(slug)

const gallery = computed(() => detailQuery.data.value?.data)

const { showToast } = useToast()
const showShareModal = ref(false)
const currentUrl = computed(() => window.location.href)

const handleShare = () => {
  const shareTitle = gallery.value?.title || 'Galeri'
  if (navigator.share) {
    navigator.share({ title: shareTitle, url: currentUrl.value }).catch(() => {
      showShareModal.value = true
    })
  } else {
    showShareModal.value = true
  }
}

const shareTo = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'telegram') => {
  const url = currentUrl.value
  const text = `Lihat koleksi foto menarik: "${gallery.value?.title}". Selengkapnya silakan kunjungi:`
  
  let shareUrl = ''
  switch (platform) {
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      break
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      break
  }
  
  window.open(shareUrl, '_blank', 'noopener,noreferrer')
}

const handleCopyLink = async () => {
  await navigator.clipboard.writeText(currentUrl.value)
  showToast('Tautan berhasil disalin!', 'success')
  showShareModal.value = false
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

// --- Image Lightbox / Details Modal ---
const activeIndex = ref<number | null>(null)

const openLightbox = (index: number) => {
  activeIndex.value = index
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  activeIndex.value = null
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (activeIndex.value === null || !gallery.value?.media) return
  activeIndex.value = (activeIndex.value + 1) % gallery.value.media.length
}

const prevImage = () => {
  if (activeIndex.value === null || !gallery.value?.media) return
  activeIndex.value =
    (activeIndex.value - 1 + gallery.value.media.length) % gallery.value.media.length
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (activeIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

watch(activeIndex, (newVal) => {
  if (newVal !== null) {
    window.addEventListener('keydown', handleKeyDown)
  } else {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
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
              v-for="(media, index) in gallery.media"
              :key="media.id"
              @click="openLightbox(index)"
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

    <!-- Share Modal Overlay -->
    <div
      v-if="showShareModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
    >
      <div
        class="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative border border-gray-100 dark:border-gray-700 transition-all duration-300"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Bagikan Galeri</h3>
          <button
            @click="showShareModal = false"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 cursor-pointer"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Social Grid -->
        <div class="grid grid-cols-4 gap-4 mb-6 text-center">
          <!-- WhatsApp -->
          <button
            @click="shareTo('whatsapp')"
            class="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0"
          >
            <div
              class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle :size="24" />
            </div>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">WhatsApp</span>
          </button>

          <!-- Twitter/X -->
          <button
            @click="shareTo('twitter')"
            class="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0"
          >
            <div
              class="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-gray-200 transition-colors"
            >
              <Twitter :size="22" />
            </div>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Twitter</span>
          </button>

          <!-- Telegram -->
          <button
            @click="shareTo('telegram')"
            class="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0"
          >
            <div
              class="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-500 group-hover:bg-sky-100 transition-colors"
            >
              <Send :size="20" />
            </div>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Telegram</span>
          </button>

          <!-- Facebook -->
          <button
            @click="shareTo('facebook')"
            class="flex flex-col items-center gap-2 group cursor-pointer bg-transparent border-0"
          >
            <div
              class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors"
            >
              <Facebook :size="22" />
            </div>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Facebook</span>
          </button>
        </div>

        <!-- Copy Link Row -->
        <div
          class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700"
        >
          <input
            type="text"
            readonly
            :value="currentUrl"
            class="flex-1 bg-transparent text-xs text-gray-500 truncate outline-none select-all"
          />
          <button
            @click="handleCopyLink"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-400 text-white rounded-xl text-xs font-bold hover:bg-primary-500 transition-colors cursor-pointer"
          >
            <Link2 :size="14" />
            SALIN
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div
      v-if="activeIndex !== null && gallery?.media"
      @click="closeLightbox"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xs p-4 select-none cursor-zoom-out"
    >
      <!-- Close Button -->
      <button
        @click.stop="closeLightbox"
        class="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-50 border-0"
        title="Tutup (Esc)"
      >
        <X :size="24" />
      </button>

      <!-- Prev Button -->
      <button
        @click.stop="prevImage"
        class="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-50 border-0"
        title="Sebelumnya (Arrow Left)"
      >
        <ChevronLeft :size="28" />
      </button>

      <!-- Image Container -->
      <div
        @click.stop
        class="relative max-w-5xl max-h-[80vh] flex flex-col items-center justify-center cursor-default"
      >
        <img
          :src="gallery.media[activeIndex]?.url"
          :alt="gallery.media[activeIndex]?.alt || gallery.title"
          class="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300"
        />
      </div>

      <!-- Next Button -->
      <button
        @click.stop="nextImage"
        class="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-50 border-0"
        title="Berikutnya (Arrow Right)"
      >
        <ChevronRight :size="28" />
      </button>

      <!-- Caption & Counter -->
      <div
        @click.stop
        class="absolute bottom-6 flex flex-col items-center gap-2 text-center max-w-xl px-6 cursor-default"
      >
        <p class="text-white font-bold text-sm">
          {{ activeIndex + 1 }} / {{ gallery.media.length }}
        </p>
        <p v-if="gallery.media[activeIndex]?.alt" class="text-gray-300 text-xs leading-relaxed">
          {{ gallery.media[activeIndex]?.alt }}
        </p>
      </div>
    </div>
  </PublicLayout>
</template>
