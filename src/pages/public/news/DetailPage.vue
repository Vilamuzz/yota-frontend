<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { usePublishedNewsDetail } from '@/composables/news/useNewsDetail'
import { usePublishedNewsList } from '@/composables/news/useNewsList'
import type { NewsQueryParams } from '@/types/news'
import { formatDate } from '@/utils/format'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Link2,
  BookOpen,
  Tag,
  Send,
  User,
  Flag,
  Loader2,
} from 'lucide-vue-next'
import { useToast } from '@/composables/ui/useToast'
import { useNewsCommentCreate } from '@/composables/newsComment/useNewsCommentCreate'
import { useNewsCommentList } from '@/composables/newsComment/useNewsCommentList'
import { useNewsCommentReport } from '@/composables/newsComment/useNewsCommentReport'
import PublicConfirmationModal from '@/components/molecules/PublicConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedNewsDetail(slug)
const { newsComments, isLoading: isLoadingComments } = useNewsCommentList(slug)
const { createMutation, validationErrors } = useNewsCommentCreate()
const { createMutation: reportMutation } = useNewsCommentReport()

const commentContent = ref('')
const replyContent = ref('')
const replyingTo = ref<{ commentId: string; targetId: string; username: string } | null>(null)
const commentInputRef = ref<HTMLTextAreaElement | null>(null)

const isReportModalOpen = ref(false)
const reportingCommentId = ref<string>('')

const openReportModal = (id: string) => {
  reportingCommentId.value = id
  isReportModalOpen.value = true
}

const closeReportModal = () => {
  isReportModalOpen.value = false
  reportingCommentId.value = ''
}

const submitReport = () => {
  if (reportMutation.isPending.value) return

  reportMutation.mutate(
    {
      newsCommentID: reportingCommentId.value,
    },
    {
      onSuccess: () => {
        showToast('Komentar berhasil dilaporkan.', 'success')
        closeReportModal()
      },
      onError: () => {
        showToast('Gagal melaporkan komentar.', 'error')
      },
    },
  )
}

const autoResize = (event: Event) => {
  const el = event.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitComment = () => {
  if (!commentContent.value.trim() || createMutation.isPending.value) return

  createMutation.mutate(
    {
      slug: slug.value,
      data: { content: commentContent.value },
    },
    {
      onSuccess: () => {
        commentContent.value = ''
        if (commentInputRef.value) {
          commentInputRef.value.style.height = 'auto'
        }
        showToast('Komentar berhasil dikirim!', 'success')
      },
      onError: () => {
        showToast('Gagal mengirim komentar.', 'error')
      },
    },
  )
}

const submitReply = () => {
  if (!replyContent.value.trim() || createMutation.isPending.value || !replyingTo.value) return

  createMutation.mutate(
    {
      slug: slug.value,
      data: {
        content: replyContent.value,
        parentCommentId: replyingTo.value.commentId,
      },
    },
    {
      onSuccess: () => {
        replyContent.value = ''
        replyingTo.value = null
        showToast('Balasan berhasil dikirim!', 'success')
      },
      onError: () => {
        showToast('Gagal mengirim balasan.', 'error')
      },
    },
  )
}

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
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// --- Related News ---
const relatedNewsParams = reactive<NewsQueryParams>({
  limit: 6, // Fetch 6 so we can filter out the current one and still have 5
  page: 1,
  sortBy: 'views desc',
  category: undefined,
})

const { news: relatedNewsData, listQuery: relatedQuery } = usePublishedNewsList(relatedNewsParams)

watch(
  news,
  (newNews) => {
    if (newNews?.category) {
      relatedNewsParams.category = newNews.category as any
    }
  },
  { immediate: true },
)

const filteredRelatedNews = computed(() => {
  if (!relatedNewsData.value) return []
  return relatedNewsData.value.filter((n) => n.id !== news.value?.id).slice(0, 5)
})
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
          class="absolute top-28 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-all group"
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

            <!-- Comments Section -->
            <section class="mt-12 pt-10 border-t border-gray-100 space-y-6">
              <h2 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <span class="w-1 h-6 bg-primary-400 rounded-full inline-block"></span>
                Komentar ({{ newsComments.length }})
              </h2>

              <!-- Comment Form -->
              <div class="flex gap-4">
                <div
                  class="w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0"
                >
                  <User :size="20" />
                </div>
                <div class="flex-1 flex flex-row gap-3">
                  <textarea
                    ref="commentInputRef"
                    v-model="commentContent"
                    rows="1"
                    @input="autoResize"
                    @keydown.enter.exact.prevent="submitComment"
                    placeholder="Tulis komentar Anda di sini..."
                    class="w-full bg-white border-b border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none overflow-hidden"
                    :disabled="createMutation.isPending.value"
                  ></textarea>
                  <div v-if="validationErrors?.content" class="text-xs text-red-500 font-medium">
                    {{ validationErrors.content[0] }}
                  </div>

                  <div class="flex items-end">
                    <button
                      :disabled="!commentContent.trim() || createMutation.isPending.value"
                      @click="submitComment"
                      class="bg-primary-400 disabled:bg-gray-400 text-white rounded-full p-2 hover:bg-primary-500 transition-colors cursor-pointer"
                    >
                      <span class="flex items-center gap-2">
                        <Send :size="14" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Comments List -->
              <div v-if="isLoadingComments" class="space-y-4">
                <BaseSkeleton variant="text-sm" class="w-full h-12" v-for="i in 1" :key="i" />
              </div>
              <div
                v-else-if="newsComments.length === 0"
                class="text-center py-8 text-gray-500 text-sm"
              >
                Belum ada komentar. Jadilah yang pertama berkomentar!
              </div>
              <div v-else class="space-y-5">
                <div v-for="comment in newsComments" :key="comment.id" class="flex flex-col gap-4">
                  <div class="flex gap-4">
                    <div
                      class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 font-bold text-sm"
                    >
                      {{ comment.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 space-y-1">
                      <div class="flex items-baseline gap-2">
                        <h4 class="font-bold text-gray-900 text-sm">{{ comment.username }}</h4>
                        <span class="text-xs text-gray-400">{{
                          formatDate(comment.createdAt)
                        }}</span>
                      </div>
                      <p class="text-gray-700 text-sm leading-relaxed">{{ comment.content }}</p>
                      <div class="flex items-center gap-1 pt-1">
                        <button
                          @click="
                            replyingTo = {
                              commentId: comment.id,
                              targetId: comment.id,
                              username: comment.username,
                            }
                          "
                          class="text-xs text-primary-500 font-semibold hover:text-primary-600 transition-colors flex items-center gap-1 hover:bg-primary-500 hover:text-white rounded-full px-2 py-1"
                        >
                          Balas
                        </button>
                        <button
                          @click="openReportModal(comment.id)"
                          class="text-xs text-gray-400 font-semibold hover:text-red-500 transition-colors flex items-center gap-1 hover:bg-red-500 hover:text-white rounded-full px-2 py-1"
                        >
                          <Flag :size="12" />
                          Laporkan
                        </button>
                      </div>

                      <!-- Reply Input for main comment -->
                      <div v-if="replyingTo?.targetId === comment.id" class="flex gap-3 pt-3">
                        <div
                          class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0"
                        >
                          <User :size="16" />
                        </div>
                        <div class="flex-1 space-y-2">
                          <span
                            class="text-xs text-primary-700 font-medium flex items-center gap-2"
                          >
                            Membalas <span class="font-bold">{{ replyingTo.username }}</span>
                          </span>
                          <textarea
                            v-model="replyContent"
                            @input="autoResize"
                            @keydown.enter.exact.prevent="submitReply"
                            rows="1"
                            placeholder="Tulis balasan Anda..."
                            class="w-full bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none overflow-hidden"
                            :disabled="createMutation.isPending.value"
                          ></textarea>
                          <div
                            v-if="validationErrors?.content"
                            class="text-xs text-red-500 font-medium"
                          >
                            {{ validationErrors.content[0] }}
                          </div>
                          <div class="flex justify-end gap-2 pt-1">
                            <button
                              @click="cancelReply"
                              class="disabled:bg-gray-400 text-gray-500 text-xs rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors font-medium"
                            >
                              Batal
                            </button>
                            <button
                              :disabled="!replyContent.trim() || createMutation.isPending.value"
                              @click="submitReply"
                              class="bg-primary-400 disabled:bg-gray-400 text-white text-xs rounded-full px-3 py-1.5 hover:bg-primary-500 transition-colors font-medium"
                            >
                              <template v-if="createMutation.isPending.value">Mengirim...</template>
                              <template v-else>Balas</template>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Replies -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="pl-14 space-y-4">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                      <div
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 font-bold text-xs"
                      >
                        {{ reply.username.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1 space-y-1">
                        <div class="flex items-baseline gap-2">
                          <h4 class="font-bold text-gray-900 text-sm">{{ reply.username }}</h4>
                          <span class="text-xs text-gray-400">{{
                            formatDate(reply.createdAt)
                          }}</span>
                        </div>
                        <p class="text-gray-700 text-sm leading-relaxed">{{ reply.content }}</p>
                        <div class="flex items-center gap-1 pt-1">
                          <button
                            @click="
                              replyingTo = {
                                commentId: comment.id,
                                targetId: reply.id,
                                username: reply.username,
                              }
                            "
                            class="text-xs text-primary-500 font-semibold hover:text-primary-600 transition-colors flex items-center gap-1 hover:bg-primary-500 hover:text-white rounded-full px-2 py-1"
                          >
                            Balas
                          </button>
                          <button
                            @click="openReportModal(reply.id)"
                            class="text-xs text-gray-400 font-semibold hover:text-red-500 transition-colors flex items-center gap-1 hover:bg-red-500 hover:text-white rounded-full px-2 py-1"
                          >
                            <Flag :size="12" />
                            Laporkan
                          </button>
                        </div>

                        <!-- Reply Input for nested reply -->
                        <div v-if="replyingTo?.targetId === reply.id" class="flex gap-3 pt-3">
                          <div
                            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0"
                          >
                            <User :size="16" />
                          </div>
                          <div class="flex-1 space-y-2">
                            <span
                              class="text-xs text-primary-700 font-medium flex items-center gap-2"
                            >
                              Membalas <span class="font-bold">{{ replyingTo.username }}</span>
                            </span>
                            <textarea
                              v-model="replyContent"
                              @input="autoResize"
                              @keydown.enter.exact.prevent="submitReply"
                              rows="1"
                              placeholder="Tulis balasan Anda..."
                              class="w-full bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-primary-400 transition-colors resize-none overflow-hidden"
                              :disabled="createMutation.isPending.value"
                            ></textarea>
                            <div
                              v-if="validationErrors?.content"
                              class="text-xs text-red-500 font-medium"
                            >
                              {{ validationErrors.content[0] }}
                            </div>
                            <div class="flex justify-end gap-2 pt-1">
                              <button
                                @click="cancelReply"
                                class="disabled:bg-gray-400 text-gray-500 text-xs rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors font-medium"
                              >
                                Batal
                              </button>
                              <button
                                :disabled="!replyContent.trim() || createMutation.isPending.value"
                                @click="submitReply"
                                class="bg-primary-400 disabled:bg-gray-400 text-white text-xs rounded-full px-3 py-1.5 hover:bg-primary-500 transition-colors font-medium"
                              >
                                <template v-if="createMutation.isPending.value"
                                  >Mengirim...</template
                                >
                                <template v-else>Balas</template>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar - Right -->
          <aside class="hidden lg:block w-64 xl:w-72 shrink-0">
            <div class="sticky top-28 space-y-6">
              <!-- Related News -->
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Berita Terkait
                </p>

                <div v-if="relatedQuery.isPending.value" class="flex justify-center py-4">
                  <Loader2 class="w-6 h-6 text-primary-500 animate-spin" />
                </div>

                <div v-else-if="filteredRelatedNews.length > 0" class="space-y-4">
                  <RouterLink
                    v-for="item in filteredRelatedNews"
                    :key="item.id"
                    :to="{ name: 'news-detail', params: { slug: item.slug } }"
                    class="group flex gap-3 items-start"
                  >
                    <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-200">
                      <img
                        :src="item.coverImage"
                        :alt="item.title"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div class="flex-1">
                      <h4
                        class="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight mb-1"
                      >
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar :size="10" />
                        {{ formatDate(item.publishedAt || item.createdAt) }}
                      </p>
                    </div>
                  </RouterLink>
                </div>

                <div v-else class="text-xs text-gray-500 text-center py-4">
                  Belum ada berita terkait.
                </div>
              </div>
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

    <!-- Report Modal -->
    <PublicConfirmationModal
      :show="isReportModalOpen"
      title="Laporkan Komentar"
      message="Apakah Anda yakin ingin melaporkan komentar ini?"
      primary-button-text="Kirim Laporan"
      :primary-button-loading="reportMutation.isPending.value"
      @primary="submitReport"
      @close="closeReportModal"
    />
  </PublicLayout>
</template>
