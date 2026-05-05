<script setup lang="ts">
import type { News } from '@/types/news'
import { formatDate } from '@/utils/format'
import { Calendar, ArrowRight, User } from 'lucide-vue-next'

defineProps<{
  news: News
}>()

function formatCategory(category: string) {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Simple function to strip HTML tags for the snippet
function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '')
}
</script>

<template>
  <RouterLink
    :to="{ name: 'news-detail', params: { slug: news.slug } }"
    class="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
  >
    <!-- Image -->
    <div class="relative h-64 overflow-hidden">
      <img
        v-if="news.coverImage"
        :src="news.coverImage"
        :alt="news.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageIcon :size="48" stroke-width="1" />
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>

      <!-- Category Badge -->
      <div class="absolute top-4 left-4">
        <span class="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-lg shadow-lg">
          {{ formatCategory(news.category) }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-8 flex flex-col flex-grow">
      <!-- Meta -->
      <div class="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <div class="flex items-center gap-1.5">
          <Calendar :size="14" />
          <span>{{ formatDate(news.publishedAt || news.createdAt) }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <User :size="14" />
          <span>Admin</span>
        </div>
      </div>

      <h3
        class="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-4 leading-tight"
      >
        {{ news.title }}
      </h3>

      <p class="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
        {{ stripHtml(news.content) }}
      </p>

      <!-- Read More Link -->
      <div class="mt-auto flex items-center gap-2 text-primary-600 font-bold text-sm">
        <span>Baca Selengkapnya</span>
        <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-2" />
      </div>
    </div>
  </RouterLink>
</template>

