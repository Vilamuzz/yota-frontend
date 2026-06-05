<script setup lang="ts">
import type { Gallery } from '@/types/gallery'
import { formatDate } from '@/utils/format'
import { Image as ImageIcon, Calendar, Layers } from 'lucide-vue-next'

defineProps<{
  gallery: Gallery
}>()

function formatCategory(category: string) {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <RouterLink
    :to="{ name: 'gallery-detail', params: { slug: gallery.slug } }"
    class="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
  >
    <!-- Image Container -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="gallery.coverImage"
        :src="gallery.coverImage"
        :alt="gallery.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageIcon :size="48" stroke-width="1" />
      </div>

      <!-- Category Badge -->
      <div class="absolute top-4 left-4">
        <span
          class="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-bold rounded-full shadow-sm"
        >
          {{ formatCategory(gallery.category) }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 flex flex-col flex-grow">
      <h3
        class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3"
      >
        {{ gallery.title }}
      </h3>

      <div class="mt-auto flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-1.5">
          <Calendar :size="14" />
          <span>{{ formatDate(gallery.publishedAt || gallery.createdAt) }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Layers :size="14" />
          <span>{{ gallery.media?.length || 0 }} Media</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

