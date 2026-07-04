<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/ui/useTheme'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useToast } from '@/composables/ui/useToast'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { publicationDashboardService } from '@/services/publicationDashboard.service'
import { useNewsAdminList } from '@/composables/news/useNewsAdminList'
import { useGalleryAdminList } from '@/composables/gallery/useGalleryAdminList'
import { useAdminPrayerList } from '@/composables/prayer/useAdminPrayerList'
import { useAdminNewsCommentList } from '@/composables/newsComment/useAdminNewsCommentList'
import { useNewsUpdate } from '@/composables/news/useNewsUpdate'
import { useGalleryUpdate } from '@/composables/gallery/useGalleryUpdate'
import { usePrayerAllow } from '@/composables/prayer/usePrayerAllow'
import { useAdminPrayerDelete } from '@/composables/prayer/useAdminPrayerDelete'
import { useNewsCommentAllow } from '@/composables/newsComment/useNewsCommentAllow'
import { useNewsCommentDelete } from '@/composables/newsComment/useNewsCommentDelete'
import { MediaCategory, MediaStatus } from '@/types/media'
import {
  Newspaper,
  Image as ImageIcon,
  HeartHandshake,
  MessageSquare,
  Plus,
  Search,
  Check,
  Archive,
  Trash2,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-vue-next'

// Register ECharts modules
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const queryClient = useQueryClient()
const { showToast } = useToast()
const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// Tabs state
const activeTab = ref<'overview' | 'news' | 'galleries' | 'prayers' | 'comments'>('overview')

const {
  data: stats,
  isPending: isStatsLoading,
  isError: isStatsError,
} = useQuery({
  queryKey: ['publication-dashboard-stats'],
  queryFn: () => publicationDashboardService.getStats(),
  retry: 1,
})

const newsPage = ref(1)
const newsSearch = ref('')
const newsCategory = ref<MediaCategory | undefined>(undefined)
const newsStatus = ref<MediaStatus | undefined>(undefined)

const newsQueryParams = computed(() => ({
  page: newsPage.value,
  limit: 5,
  search: newsSearch.value || undefined,
  category: newsCategory.value || undefined,
  status: newsStatus.value || undefined,
  sortBy: 'created_at desc',
}))

const {
  news,
  pagination: newsPagination,
  isLoading: isNewsLoading,
} = useNewsAdminList(newsQueryParams)

const {
  publishMutation: publishNewsMutation,
  archiveMutation: archiveNewsMutation,
  deleteMutation: deleteNewsMutation,
} = useNewsUpdate()

const galleryPage = ref(1)
const gallerySearch = ref('')
const galleryCategory = ref<MediaCategory | undefined>(undefined)
const galleryStatus = ref<MediaStatus | undefined>(undefined)

const galleryQueryParams = computed(() => ({
  page: galleryPage.value,
  limit: 5,
  search: gallerySearch.value || undefined,
  category: galleryCategory.value || undefined,
  status: galleryStatus.value || undefined,
  sortBy: 'created_at desc',
}))

const {
  galleries,
  pagination: galleryPagination,
  isLoading: isGalleryLoading,
} = useGalleryAdminList(galleryQueryParams)

const {
  publishMutation: publishGalleryMutation,
  archiveMutation: archiveGalleryMutation,
  deleteMutation: deleteGalleryMutation,
} = useGalleryUpdate()

const prayerPage = ref(1)
const prayerQueryParams = computed(() => ({
  page: prayerPage.value,
  limit: 5,
}))

const {
  prayers,
  pagination: prayerPagination,
  isLoading: isPrayersLoading,
} = useAdminPrayerList(prayerQueryParams)

const { allowMutation: allowPrayerMutation } = usePrayerAllow()
const { deleteMutation: deletePrayerMutation } = useAdminPrayerDelete()

const commentPage = ref(1)
const commentQueryParams = computed(() => ({
  page: commentPage.value,
  limit: 5,
}))

const {
  newsComments: comments,
  pagination: commentPagination,
  isLoading: isCommentsLoading,
} = useAdminNewsCommentList(commentQueryParams)

const { allowMutation: allowCommentMutation } = useNewsCommentAllow()
const { deleteMutation: deleteCommentMutation } = useNewsCommentDelete()

const chartOption = computed(() => {
  const isDarkMode = isDark.value
  const c = {
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    tooltip: isDarkMode ? '#f3f4f6' : '#1f2937',
    news: '#0e733b', // primary accent 300
    gallery: '#6366f1', // indigo
  }

  const newsStats = stats.value?.news || { draft: 0, published: 0, archived: 0 }
  const galleryStats = stats.value?.gallery || { draft: 0, published: 0, archived: 0 }

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: c.tooltip },
    },
    legend: {
      data: ['Berita', 'Galeri Foto'],
      textStyle: { color: c.text, fontFamily: 'Poppins, sans-serif', fontSize: 11 },
      bottom: '0%',
    },
    grid: { left: '3%', right: '3%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: ['Draft', 'Terbit (Published)', 'Arsip (Archived)'],
        axisLabel: { color: c.text, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11 },
        axisLine: { lineStyle: { color: c.gridLine } },
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: c.text, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11 },
        splitLine: { lineStyle: { color: c.gridLine, type: 'dashed' } },
      },
    ],
    series: [
      {
        name: 'Berita',
        type: 'bar',
        barMaxWidth: 30,
        itemStyle: { color: c.news, borderRadius: [4, 4, 0, 0] },
        data: [newsStats.draft, newsStats.published, newsStats.archived],
      },
      {
        name: 'Galeri Foto',
        type: 'bar',
        barMaxWidth: 30,
        itemStyle: { color: c.gallery, borderRadius: [4, 4, 0, 0] },
        data: [galleryStats.draft, galleryStats.published, galleryStats.archived],
      },
    ],
  }
})

const confirmShow = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<
  | 'allow-prayer'
  | 'delete-prayer'
  | 'allow-comment'
  | 'delete-comment'
  | 'delete-news'
  | 'delete-gallery'
>('allow-prayer')
const confirmTargetId = ref<string>('')
const confirmLoading = ref(false)

function triggerConfirm(
  type: typeof confirmType.value,
  id: string,
  title: string,
  message: string,
) {
  confirmType.value = type
  confirmTargetId.value = id
  confirmTitle.value = title
  confirmMessage.value = message
  confirmShow.value = true
}

async function handleConfirmAction() {
  confirmLoading.value = true
  try {
    if (confirmType.value === 'allow-prayer') {
      await allowPrayerMutation.mutateAsync(confirmTargetId.value)
      showToast('Doa berhasil dipulihkan / diperbolehkan', 'success')
    } else if (confirmType.value === 'delete-prayer') {
      await deletePrayerMutation.mutateAsync(confirmTargetId.value)
      showToast('Doa berhasil dihapus permanen', 'success')
    } else if (confirmType.value === 'allow-comment') {
      await allowCommentMutation.mutateAsync(confirmTargetId.value)
      showToast('Komentar berhasil dipulihkan / diperbolehkan', 'success')
    } else if (confirmType.value === 'delete-comment') {
      await deleteCommentMutation.mutateAsync(confirmTargetId.value)
      showToast('Komentar berhasil dihapus permanen', 'success')
    } else if (confirmType.value === 'delete-news') {
      await deleteNewsMutation.mutateAsync(confirmTargetId.value)
      showToast('Berita berhasil dihapus', 'success')
    } else if (confirmType.value === 'delete-gallery') {
      await deleteGalleryMutation.mutateAsync(confirmTargetId.value)
      showToast('Galeri berhasil dihapus', 'success')
    }
    // Invalidate stats counts after mutations
    queryClient.invalidateQueries({ queryKey: ['publication-dashboard-stats'] })
  } catch {
    showToast('Tindakan moderasi gagal dilakukan', 'error')
  } finally {
    confirmLoading.value = false
    confirmShow.value = false
  }
}

async function handlePublishNews(id: string) {
  try {
    await publishNewsMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ['publication-dashboard-stats'] })
    showToast('Berita berhasil diterbitkan', 'success')
  } catch {
    showToast('Gagal menerbitkan berita', 'error')
  }
}

async function handleArchiveNews(id: string) {
  try {
    await archiveNewsMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ['publication-dashboard-stats'] })
    showToast('Berita berhasil diarsipkan', 'success')
  } catch {
    showToast('Gagal mengarsipkan berita', 'error')
  }
}

async function handlePublishGallery(id: string) {
  try {
    await publishGalleryMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ['publication-dashboard-stats'] })
    showToast('Galeri berhasil diterbitkan', 'success')
  } catch {
    showToast('Gagal menerbitkan galeri', 'error')
  }
}

async function handleArchiveGallery(id: string) {
  try {
    await archiveGalleryMutation.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ['publication-dashboard-stats'] })
    showToast('Galeri berhasil diarsipkan', 'success')
  } catch {
    showToast('Gagal mengarsipkan galeri', 'error')
  }
}
</script>

<template>
  <div class="space-y-8 font-poppins">
    <!-- Welcome Header Banner -->
    <div
      class="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Publikasi & Moderasi Workspace
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola berita yayasan, dokumentasi galeri kegiatan, serta moderasi laporan doa dan
          komentar di satu tempat.
        </p>
      </div>

      <!-- Quick Actions Group -->
      <div class="flex flex-wrap gap-3">
        <RouterLink
          :to="{ name: 'dashboard-news-create' }"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-300 hover:bg-primary-400 rounded-lg shadow-sm transition duration-200 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          Berita Baru
        </RouterLink>

        <RouterLink
          :to="{ name: 'dashboard-galleries-create' }"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition duration-200 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          Galeri Baru
        </RouterLink>
      </div>
    </div>

    <!-- Navigation Tabs (Plus Jakarta Sans Display font for navigational items) -->
    <div class="border-b border-gray-200 dark:border-gray-700 font-plus-jakarta-sans">
      <nav class="flex space-x-6 overflow-x-auto pb-px">
        <button
          v-for="tab in [
            { id: 'overview', label: 'Ringkasan', icon: TrendingUp, badge: undefined },
            { id: 'news', label: 'Daftar Berita', icon: Newspaper, badge: undefined },
            { id: 'galleries', label: 'Daftar Galeri', icon: ImageIcon, badge: undefined },
            {
              id: 'prayers',
              label: 'Moderasi Doa',
              icon: HeartHandshake,
              badge: stats?.reportedPrayers,
            },
            {
              id: 'comments',
              label: 'Moderasi Komentar',
              icon: MessageSquare,
              badge: stats?.reportedComments,
            },
          ]"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          :class="[
            'pb-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors duration-200 cursor-pointer',
            activeTab === tab.id
              ? 'border-primary-300 text-primary-400 dark:text-primary-300 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="px-2 py-0.5 text-xs rounded-full bg-danger-500 text-white font-mono animate-pulse"
          >
            {{ tab.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Overview Statistics Grid -->
    <div v-if="activeTab === 'overview'" class="space-y-6">
      <div v-if="isStatsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 4"
          :key="i"
          class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-xl space-y-4 animate-pulse shadow-sm"
        >
          <div class="flex justify-between items-center">
            <BaseSkeleton variant="text-sm" class="w-1/3" />
            <BaseSkeleton variant="avatar" />
          </div>
          <BaseSkeleton variant="text-2xl" class="w-1/2 pt-2" />
        </div>
      </div>

      <div
        v-else-if="isStatsError"
        class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-red-800 dark:text-red-300"
      >
        <AlertTriangle class="w-5 h-5 inline mr-2 text-danger-500" />
        Gagal memuat ringkasan data statistik. Silakan muat ulang halaman.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 1. News Stats Card -->
        <div
          @click="activeTab = 'news'"
          class="group border border-emerald-100 dark:border-emerald-900/20 bg-gradient-to-br from-white to-emerald-50/10 dark:from-gray-900/60 dark:to-emerald-950/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100/50 dark:border-emerald-800/30"
              >
                Berita Yayasan
              </span>
              <div
                class="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg"
              >
                <Newspaper class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Artikel
            </h3>
            <p
              class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1 font-plus-jakarta-sans"
            >
              {{ stats?.news.total }}
            </p>
          </div>
          <div
            class="mt-4 pt-3 border-t border-emerald-50 dark:border-emerald-900/30 grid grid-cols-3 gap-2 text-center text-xs"
          >
            <div>
              <p class="text-gray-400">Terbit</p>
              <p class="font-bold text-emerald-600 dark:text-emerald-400 font-plus-jakarta-sans">
                {{ stats?.news.published }}
              </p>
            </div>
            <div>
              <p class="text-gray-400">Draft</p>
              <p class="font-bold text-gray-600 dark:text-gray-300 font-plus-jakarta-sans">
                {{ stats?.news.draft }}
              </p>
            </div>
            <div>
              <p class="text-gray-400">Arsip</p>
              <p class="font-bold text-danger-500 font-plus-jakarta-sans">
                {{ stats?.news.archived }}
              </p>
            </div>
          </div>
        </div>

        <!-- 2. Gallery Stats Card -->
        <div
          @click="activeTab = 'galleries'"
          class="group border border-indigo-100 dark:border-indigo-900/20 bg-gradient-to-br from-white to-indigo-50/10 dark:from-gray-900/60 dark:to-indigo-950/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100/50 dark:border-indigo-800/30"
              >
                Galeri Foto
              </span>
              <div
                class="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg"
              >
                <ImageIcon class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Album
            </h3>
            <p
              class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1 font-plus-jakarta-sans"
            >
              {{ stats?.gallery.total }}
            </p>
          </div>
          <div
            class="mt-4 pt-3 border-t border-indigo-50 dark:border-indigo-900/30 grid grid-cols-3 gap-2 text-center text-xs"
          >
            <div>
              <p class="text-gray-400">Terbit</p>
              <p class="font-bold text-indigo-600 dark:text-indigo-400 font-plus-jakarta-sans">
                {{ stats?.gallery.published }}
              </p>
            </div>
            <div>
              <p class="text-gray-400">Draft</p>
              <p class="font-bold text-gray-600 dark:text-gray-300 font-plus-jakarta-sans">
                {{ stats?.gallery.draft }}
              </p>
            </div>
            <div>
              <p class="text-gray-400">Arsip</p>
              <p class="font-bold text-danger-500 font-plus-jakarta-sans">
                {{ stats?.gallery.archived }}
              </p>
            </div>
          </div>
        </div>

        <!-- 3. Reported Prayers Card -->
        <div
          @click="activeTab = 'prayers'"
          class="group border border-amber-100 dark:border-amber-900/20 bg-gradient-to-br from-white to-amber-50/10 dark:from-gray-900/60 dark:to-amber-950/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100/50 dark:border-amber-800/30"
              >
                Moderasi Doa
              </span>
              <div
                class="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg"
              >
                <HeartHandshake class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Doa Dilaporkan
            </h3>
            <p
              class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1 font-plus-jakarta-sans"
            >
              {{ stats?.reportedPrayers }}
            </p>
          </div>
          <div
            class="mt-4 pt-3 border-t border-amber-50 dark:border-amber-900/30 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          >
            <span>Butuh tinjauan segera</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 4. Reported Comments Card -->
        <div
          @click="activeTab = 'comments'"
          class="group border border-rose-100 dark:border-rose-900/20 bg-gradient-to-br from-white to-rose-50/10 dark:from-gray-900/60 dark:to-rose-950/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full border border-rose-100/50 dark:border-rose-800/30"
              >
                Moderasi Komentar
              </span>
              <div
                class="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg"
              >
                <MessageSquare class="w-5 h-5" />
              </div>
            </div>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Komentar Dilaporkan
            </h3>
            <p
              class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1 font-plus-jakarta-sans"
            >
              {{ stats?.reportedComments }}
            </p>
          </div>
          <div
            class="mt-4 pt-3 border-t border-rose-50 dark:border-rose-900/30 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
          >
            <span>Butuh tinjauan segera</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <!-- Chart Panel -->
      <div
        v-if="!isStatsLoading && !isStatsError"
        class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">
            Status Distribusi Publikasi
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Perbandingan status penyusunan berita dan galeri foto yayasan
          </p>
        </div>

        <div class="h-80 w-full">
          <VChart class="w-full h-full" :option="chartOption" :theme="chartTheme" autoresize />
        </div>
      </div>
    </div>

    <!-- News List Tab -->
    <div v-if="activeTab === 'news'" class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Manajemen Berita Yayasan</h3>
        <!-- Filters panel -->
        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <!-- Search input with Focus Ring constraints -->
          <div class="relative flex-grow sm:flex-grow-0">
            <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              v-model="newsSearch"
              @input="newsPage = 1"
              type="text"
              placeholder="Cari berita..."
              class="pl-9 pr-4 py-2 w-full sm:w-60 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
            />
          </div>

          <!-- Category filter -->
          <select
            v-model="newsCategory"
            @change="newsPage = 1"
            class="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
          >
            <option :value="undefined">Semua Kategori</option>
            <option :value="MediaCategory.SocialEvent">Kegiatan Sosial</option>
            <option :value="MediaCategory.Disaster">Bencana Alam</option>
            <option :value="MediaCategory.Health">Kesehatan</option>
            <option :value="MediaCategory.Environment">Lingkungan</option>
            <option :value="MediaCategory.Others">Lainnya</option>
          </select>

          <!-- Status filter -->
          <select
            v-model="newsStatus"
            @change="newsPage = 1"
            class="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
          >
            <option :value="undefined">Semua Status</option>
            <option :value="MediaStatus.DRAFT">Draft</option>
            <option :value="MediaStatus.PUBLISHED">Published</option>
            <option :value="MediaStatus.ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <!-- News Table (Plus Jakarta Sans Text Font) -->
      <div
        class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden font-plus-jakarta-sans"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <th class="px-5 py-3 w-16 text-center">No</th>
                <th class="px-5 py-3">Sampul</th>
                <th class="px-5 py-3">Judul Berita</th>
                <th class="px-5 py-3">Kategori</th>
                <th class="px-5 py-3">Pembaca</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3 text-center w-60">Aksi</th>
              </tr>
            </thead>

            <tbody v-if="isNewsLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="i in 3" :key="i">
                <td colspan="7" class="px-5 py-4"><BaseSkeleton variant="text-sm" /></td>
              </tr>
            </tbody>

            <tbody
              v-else-if="news.length === 0"
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr>
                <td colspan="7" class="px-5 py-8 text-center text-gray-400">
                  Tidak ada berita ditemukan.
                </td>
              </tr>
            </tbody>

            <tbody v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(item, idx) in news"
                :key="item.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-900/10"
              >
                <td class="px-5 py-4 text-center text-sm font-mono text-gray-500">
                  {{ (newsPage - 1) * 5 + idx + 1 }}
                </td>
                <td class="px-5 py-4">
                  <img
                    :src="item.coverImage"
                    class="w-12 h-8 object-cover rounded-lg border border-gray-100 dark:border-gray-700"
                    alt="Sampul"
                  />
                </td>
                <td class="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">
                  <RouterLink
                    :to="{ name: 'dashboard-news-edit', params: { id: item.id } }"
                    class="hover:text-primary-300 transition-colors"
                  >
                    {{ item.title }}
                  </RouterLink>
                </td>
                <td
                  class="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {{ item.category }}
                </td>
                <td class="px-5 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                  {{ item.views }}x dilihat
                </td>
                <td class="px-5 py-4 text-xs">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full font-semibold border',
                      item.status === 'published'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                        : item.status === 'archived'
                          ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                          : 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center flex items-center justify-center gap-2">
                  <!-- Actions -->
                  <RouterLink
                    :to="{ name: 'dashboard-news-edit', params: { id: item.id } }"
                    class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition"
                    title="Edit"
                  >
                    <Eye class="w-4 h-4" />
                  </RouterLink>

                  <button
                    v-if="item.status !== 'published'"
                    @click="handlePublishNews(item.id)"
                    class="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                    title="Terbitkan"
                  >
                    <Check class="w-4 h-4" />
                  </button>

                  <button
                    v-if="item.status === 'published'"
                    @click="handleArchiveNews(item.id)"
                    class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 hover:text-amber-700 dark:text-amber-400 rounded-lg transition cursor-pointer"
                    title="Arsipkan"
                  >
                    <Archive class="w-4 h-4" />
                  </button>

                  <button
                    @click="
                      triggerConfirm(
                        'delete-news',
                        item.id,
                        'Hapus Berita',
                        'Apakah Anda yakin ingin menghapus berita ini secara permanen?',
                      )
                    "
                    class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-danger-500 rounded-lg transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (Plus Jakarta Sans font) -->
        <div
          v-if="newsPagination && newsPagination.totalPages > 1"
          class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-plus-jakarta-sans"
        >
          <p class="text-gray-500">
            Halaman {{ newsPage }} dari {{ newsPagination.totalPages }} (Total
            {{ newsPagination.total }} Berita)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="newsPage === 1"
              @click="newsPage--"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              :disabled="newsPage >= newsPagination.totalPages"
              @click="newsPage++"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Galleries List Tab -->
    <div v-if="activeTab === 'galleries'" class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Manajemen Galeri Kegiatan</h3>
        <!-- Filters panel -->
        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-grow sm:flex-grow-0">
            <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              v-model="gallerySearch"
              @input="galleryPage = 1"
              type="text"
              placeholder="Cari galeri..."
              class="pl-9 pr-4 py-2 w-full sm:w-60 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
            />
          </div>

          <select
            v-model="galleryCategory"
            @change="galleryPage = 1"
            class="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
          >
            <option :value="undefined">Semua Kategori</option>
            <option :value="MediaCategory.SocialEvent">Kegiatan Sosial</option>
            <option :value="MediaCategory.Disaster">Bencana Alam</option>
            <option :value="MediaCategory.Health">Kesehatan</option>
            <option :value="MediaCategory.Environment">Lingkungan</option>
            <option :value="MediaCategory.Others">Lainnya</option>
          </select>

          <select
            v-model="galleryStatus"
            @change="galleryPage = 1"
            class="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none dark:text-white"
          >
            <option :value="undefined">Semua Status</option>
            <option :value="MediaStatus.DRAFT">Draft</option>
            <option :value="MediaStatus.PUBLISHED">Published</option>
            <option :value="MediaStatus.ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <!-- Galleries Table (Plus Jakarta Sans Text Font) -->
      <div
        class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden font-plus-jakarta-sans"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <th class="px-5 py-3 w-16 text-center">No</th>
                <th class="px-5 py-3">Sampul</th>
                <th class="px-5 py-3">Judul Galeri</th>
                <th class="px-5 py-3">Kategori</th>
                <th class="px-5 py-3">Pembaca</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3 text-center w-60">Aksi</th>
              </tr>
            </thead>

            <tbody v-if="isGalleryLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="i in 3" :key="i">
                <td colspan="7" class="px-5 py-4"><BaseSkeleton variant="text-sm" /></td>
              </tr>
            </tbody>

            <tbody
              v-else-if="galleries.length === 0"
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr>
                <td colspan="7" class="px-5 py-8 text-center text-gray-400">
                  Tidak ada galeri ditemukan.
                </td>
              </tr>
            </tbody>

            <tbody v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(item, idx) in galleries"
                :key="item.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-900/10"
              >
                <td class="px-5 py-4 text-center text-sm font-mono text-gray-500">
                  {{ (galleryPage - 1) * 5 + idx + 1 }}
                </td>
                <td class="px-5 py-4">
                  <img
                    :src="item.coverImage"
                    class="w-12 h-8 object-cover rounded-lg border border-gray-100 dark:border-gray-700"
                    alt="Sampul"
                  />
                </td>
                <td class="px-5 py-4 text-sm font-bold text-gray-900 dark:text-white">
                  <RouterLink
                    :to="{ name: 'dashboard-galleries-edit', params: { id: item.id } }"
                    class="hover:text-primary-300 transition-colors"
                  >
                    {{ item.title }}
                  </RouterLink>
                </td>
                <td
                  class="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {{ item.category }}
                </td>
                <td class="px-5 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                  {{ item.views }}x dilihat
                </td>
                <td class="px-5 py-4 text-xs">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full font-semibold border',
                      item.status === 'published'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                        : item.status === 'archived'
                          ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                          : 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center flex items-center justify-center gap-2">
                  <RouterLink
                    :to="{ name: 'dashboard-galleries-edit', params: { id: item.id } }"
                    class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition"
                    title="Edit"
                  >
                    <Eye class="w-4 h-4" />
                  </RouterLink>

                  <button
                    v-if="item.status !== 'published'"
                    @click="handlePublishGallery(item.id)"
                    class="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-lg transition cursor-pointer"
                    title="Terbitkan"
                  >
                    <Check class="w-4 h-4" />
                  </button>

                  <button
                    v-if="item.status === 'published'"
                    @click="handleArchiveGallery(item.id)"
                    class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 hover:text-amber-700 dark:text-amber-400 rounded-lg transition cursor-pointer"
                    title="Arsipkan"
                  >
                    <Archive class="w-4 h-4" />
                  </button>

                  <button
                    @click="
                      triggerConfirm(
                        'delete-gallery',
                        item.id,
                        'Hapus Galeri',
                        'Apakah Anda yakin ingin menghapus galeri foto ini secara permanen?',
                      )
                    "
                    class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-danger-500 rounded-lg transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="galleryPagination && galleryPagination.totalPages > 1"
          class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-plus-jakarta-sans"
        >
          <p class="text-gray-500">
            Halaman {{ galleryPage }} dari {{ galleryPagination.totalPages }} (Total
            {{ galleryPagination.total }} Galeri)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="galleryPage === 1"
              @click="galleryPage--"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              :disabled="galleryPage >= galleryPagination.totalPages"
              @click="galleryPage++"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Prayer Moderation Tab -->
    <div v-if="activeTab === 'prayers'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Moderasi Laporan Doa Donatur
        </h3>
        <span
          class="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
        >
          Halaman Tinjauan Doa Terlapor
        </span>
      </div>

      <div
        class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden font-plus-jakarta-sans"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <th class="px-5 py-3 w-16 text-center">No</th>
                <th class="px-5 py-3 w-40">Pengirim</th>
                <th class="px-5 py-3">Isi Doa</th>
                <th class="px-5 py-3 w-40 text-center">Jumlah Laporan</th>
                <th class="px-5 py-3 w-44">Diajukan Pada</th>
                <th class="px-5 py-3 text-center w-48">Aksi</th>
              </tr>
            </thead>

            <tbody v-if="isPrayersLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="i in 3" :key="i">
                <td colspan="6" class="px-5 py-4"><BaseSkeleton variant="text-sm" /></td>
              </tr>
            </tbody>

            <tbody
              v-else-if="prayers.length === 0"
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr>
                <td colspan="6" class="px-5 py-8 text-center text-gray-400">
                  Tidak ada laporan doa yang masuk.
                </td>
              </tr>
            </tbody>

            <tbody v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(item, idx) in prayers"
                :key="item.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-900/10"
              >
                <td class="px-5 py-4 text-center text-sm font-mono text-gray-500">
                  {{ (prayerPage - 1) * 5 + idx + 1 }}
                </td>
                <td class="px-5 py-4 text-sm font-bold text-gray-950 dark:text-white">
                  {{ item.username }}
                </td>
                <td
                  class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
                >
                  {{ item.content }}
                </td>
                <td class="px-5 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  >
                    <AlertTriangle class="w-3.5 h-3.5" />
                    {{ item.reportCount }} Laporan
                  </span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {{
                    new Date(item.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  }}
                </td>
                <td class="px-5 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="
                        triggerConfirm(
                          'allow-prayer',
                          item.id,
                          'Pulihkan Doa',
                          'Apakah Anda yakin doa ini aman dan ingin mengabaikan seluruh laporan flags yang ada? Doa akan ditampilkan kembali ke publik.',
                        )
                      "
                      class="px-2.5 py-1.5 text-xs font-semibold text-white bg-primary-300 hover:bg-primary-400 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Aman
                    </button>
                    <button
                      @click="
                        triggerConfirm(
                          'delete-prayer',
                          item.id,
                          'Hapus Doa',
                          'Apakah Anda yakin ingin menghapus doa ini secara permanen karena melanggar ketentuan yayasan?',
                        )
                      "
                      class="px-2.5 py-1.5 text-xs font-semibold text-white bg-danger-500 hover:bg-red-700 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="prayerPagination && prayerPagination.totalPages > 1"
          class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-plus-jakarta-sans"
        >
          <p class="text-gray-500">
            Halaman {{ prayerPage }} dari {{ prayerPagination.totalPages }} (Total
            {{ prayerPagination.total }} Doa Terlapor)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="prayerPage === 1"
              @click="prayerPage--"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              :disabled="prayerPage >= prayerPagination.totalPages"
              @click="prayerPage++"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Moderation Tab -->
    <div v-if="activeTab === 'comments'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Moderasi Laporan Komentar Berita
        </h3>
        <span
          class="px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-250 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30"
        >
          Halaman Tinjauan Komentar Terlapor
        </span>
      </div>

      <div
        class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden font-plus-jakarta-sans"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <th class="px-5 py-3 w-16 text-center">No</th>
                <th class="px-5 py-3 w-40">Pengirim</th>
                <th class="px-5 py-3">Isi Komentar</th>
                <th class="px-5 py-3 w-40 text-center">Jumlah Laporan</th>
                <th class="px-5 py-3 w-44">Ditulis Pada</th>
                <th class="px-5 py-3 text-center w-48">Aksi</th>
              </tr>
            </thead>

            <tbody v-if="isCommentsLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="i in 3" :key="i">
                <td colspan="6" class="px-5 py-4"><BaseSkeleton variant="text-sm" /></td>
              </tr>
            </tbody>

            <tbody
              v-else-if="comments.length === 0"
              class="divide-y divide-gray-100 dark:divide-gray-700"
            >
              <tr>
                <td colspan="6" class="px-5 py-8 text-center text-gray-400">
                  Tidak ada laporan komentar yang masuk.
                </td>
              </tr>
            </tbody>

            <tbody v-else class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(item, idx) in comments"
                :key="item.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-900/10"
              >
                <td class="px-5 py-4 text-center text-sm font-mono text-gray-500">
                  {{ (commentPage - 1) * 5 + idx + 1 }}
                </td>
                <td class="px-5 py-4 text-sm font-bold text-gray-950 dark:text-white">
                  {{ item.username }}
                </td>
                <td
                  class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
                >
                  {{ item.content }}
                </td>
                <td class="px-5 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  >
                    <AlertTriangle class="w-3.5 h-3.5" />
                    {{ item.reportCount }} Laporan
                  </span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {{
                    new Date(item.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  }}
                </td>
                <td class="px-5 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="
                        triggerConfirm(
                          'allow-comment',
                          item.id,
                          'Pulihkan Komentar',
                          'Apakah Anda yakin komentar ini aman dan ingin mengabaikan seluruh laporan flags yang ada? Komentar akan ditampilkan kembali ke publik.',
                        )
                      "
                      class="px-2.5 py-1.5 text-xs font-semibold text-white bg-primary-300 hover:bg-primary-400 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Aman
                    </button>
                    <button
                      @click="
                        triggerConfirm(
                          'delete-comment',
                          item.id,
                          'Hapus Komentar',
                          'Apakah Anda yakin ingin menghapus komentar ini secara permanen karena melanggar ketentuan yayasan?',
                        )
                      "
                      class="px-2.5 py-1.5 text-xs font-semibold text-white bg-danger-500 hover:bg-red-700 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="commentPagination && commentPagination.totalPages > 1"
          class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm font-plus-jakarta-sans"
        >
          <p class="text-gray-500">
            Halaman {{ commentPage }} dari {{ commentPagination.totalPages }} (Total
            {{ commentPagination.total }} Komentar Terlapor)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="commentPage === 1"
              @click="commentPage--"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              :disabled="commentPage >= commentPagination.totalPages"
              @click="commentPage++"
              class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal Component -->
    <ConfirmationModal
      :show="confirmShow"
      :title="confirmTitle"
      :message="confirmMessage"
      :primary-button-text="confirmType.startsWith('allow') ? 'Izinkan' : undefined"
      :danger-button-text="confirmType.startsWith('delete') ? 'Hapus Permanen' : undefined"
      :primary-button-loading="confirmLoading"
      :danger-button-loading="confirmLoading"
      @close="confirmShow = false"
      @secondary="confirmShow = false"
      @primary="handleConfirmAction"
      @danger="handleConfirmAction"
    />
  </div>
</template>
