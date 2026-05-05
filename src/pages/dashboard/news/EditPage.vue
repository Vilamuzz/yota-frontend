<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Camera, Upload, X, FileImage, Newspaper, ArrowLeft, Loader2 } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useNewsDetail } from '@/composables/news/useNewsDetail'
import { useNewsUpdate } from '@/composables/news/useNewsUpdate'
import { updateNewsSchema } from '@/schemas/news.schema'
import { MediaCategory, MediaStatus } from '@/types/media'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const newsId = route.params.id as string
const { detailQuery } = useNewsDetail(newsId)
const { updateMutation, validationErrors } = useNewsUpdate()

const form = reactive({
  title: '',
  category: '' as MediaCategory | '',
  content: '',
  status: MediaStatus.Draft,
  coverImage: null as File | null,
  coverPreview: null as string | null,
  mediaFiles: [] as File[],
  mediaPreviews: [] as string[],
  existingMedias: [] as { id: string; url: string }[],
})

const errors = ref<Record<string, string>>({})

const categories = Object.values(MediaCategory)
const statuses = [
  { label: 'Draft', value: MediaStatus.Draft },
  { label: 'Terbitkan', value: MediaStatus.Published },
  { label: 'Arsipkan', value: MediaStatus.Archived },
]

const isFetching = computed(() => detailQuery.isPending.value)
const isLoading = computed(() => updateMutation.isPending.value)

watch(
  () => detailQuery.data.value,
  (response) => {
    if (!response?.data) return
    const news = response.data
    form.title = news.title
    form.category = news.category
    form.content = news.content
    form.status = news.status
    form.coverPreview = news.coverImage
    form.existingMedias = news.medias || []
  },
  { immediate: true },
)

watch(
  () => form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      errors.value = {}
    }
    if (updateMutation.isError.value) {
      updateMutation.reset()
    }
  },
  { deep: true },
)

const handleCoverChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.coverImage = file
    form.coverPreview = URL.createObjectURL(file)
  }
}

const handleMediasChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    form.mediaFiles = [...form.mediaFiles, ...files]
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    form.mediaPreviews = [...form.mediaPreviews, ...newPreviews]
  }
}

const removeNewMedia = (index: number) => {
  form.mediaFiles.splice(index, 1)
  form.mediaPreviews.splice(index, 1)
}

const formatCategory = (cat: string) => {
  return cat
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const handleSubmit = () => {
  const result = updateNewsSchema.safeParse({
    title: form.title.trim(),
    category: form.category,
    content: form.content.trim(),
    status: form.status,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon periksa kembali inputan Anda', 'error')
    return
  }

  updateMutation.mutate(
    {
      id: newsId,
      data: {
        ...result.data,
        category: result.data.category as MediaCategory,
        status: result.data.status as MediaStatus,
        coverImage: form.coverImage || undefined,
        medias: form.mediaFiles.length > 0 ? form.mediaFiles : undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Berita berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-news' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui berita'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Berita</template>

    <div v-if="isFetching" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Memuat data berita...</p>
    </div>

    <div v-else class="max-w-full mx-auto space-y-6">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <BaseButton variant="outline" size="md" @click="router.push({ name: 'dashboard-news' })">
          <ArrowLeft :size="18" class="mr-2" />
          Kembali
        </BaseButton>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Basic Info -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5"
          >
            <div class="flex items-center gap-3 pb-2 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
                <Newspaper :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Utama
              </h3>
            </div>

            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Berita"
              placeholder="mis. Yota Berbagi Kebahagiaan di Bulan Suci"
              :error="errors.title || validationErrors?.title"
              required
            />

            <div>
              <label
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
              >
                Kategori <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                :class="{ 'border-red-500': errors.category || validationErrors?.category }"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ formatCategory(cat) }}
                </option>
              </select>
              <p
                v-if="errors.category || validationErrors?.category"
                class="mt-1 text-xs text-red-600"
              >
                {{ errors.category || validationErrors?.category }}
              </p>
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
              >
                Isi Berita <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.content"
                rows="12"
                placeholder="Tuliskan isi berita secara lengkap di sini..."
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500 transition-all duration-200 outline-none resize-none"
                :class="{ 'border-red-500': errors.content || validationErrors?.content }"
              ></textarea>
              <p
                v-if="errors.content || validationErrors?.content"
                class="mt-1 text-xs text-red-600"
              >
                {{ errors.content || validationErrors?.content }}
              </p>
            </div>
          </div>

          <!-- Multi Media Upload -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                >
                  Media Pendukung
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                  Tambahkan foto-foto tambahan untuk memperkaya isi berita.
                </p>
              </div>
              <label class="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="sr-only"
                  @change="handleMediasChange"
                />
                <div
                  class="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
                >
                  <Upload :size="16" />
                  TAMBAH MEDIA
                </div>
              </label>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              <!-- New Previews -->
              <div
                v-for="(preview, index) in form.mediaPreviews"
                :key="'new-' + index"
                class="relative aspect-square rounded-xl overflow-hidden group border border-primary-100 dark:border-primary-900 shadow-sm"
              >
                <img :src="preview" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-primary-500/10 pointer-events-none"></div>
                <div
                  class="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[8px] font-bold rounded uppercase"
                >
                  BARU
                </div>
                <button
                  type="button"
                  @click="removeNewMedia(index)"
                  class="absolute top-2 right-2 p-1 bg-white/90 dark:bg-gray-800/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X :size="14" />
                </button>
              </div>

              <!-- Existing Media -->
              <div
                v-for="media in form.existingMedias"
                :key="media.id"
                class="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 dark:border-gray-700 shadow-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <img :src="media.url" class="w-full h-full object-cover grayscale-[20%]" />
                <div
                  class="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-500 text-white text-[8px] font-bold rounded uppercase"
                >
                  DI SERVER
                </div>
              </div>
            </div>

            <div
              v-if="form.mediaPreviews.length === 0 && form.existingMedias.length === 0"
              class="py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400"
            >
              <Upload :size="32" class="mb-2 opacity-20" />
              <p class="text-xs">Belum ada media tambahan</p>
            </div>
          </div>
        </div>

        <!-- Right: Sidebar -->
        <div class="space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Gambar Utama (Sampul)
            </h3>

            <div
              class="relative aspect-video rounded-xl border-2 border-dashed overflow-hidden transition-colors duration-200 group"
              :class="[
                form.coverPreview
                  ? 'border-primary-500 bg-primary-50/10'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary-400',
              ]"
            >
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                @change="handleCoverChange"
              />

              <div
                v-if="!form.coverPreview"
                class="h-full flex flex-col items-center justify-center p-4 text-center"
              >
                <div
                  class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3"
                >
                  <Camera class="text-gray-400" :size="24" />
                </div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Pilih Gambar Utama
                </p>
                <p class="text-[10px] text-gray-400 mt-1">Format 16:9 direkomendasikan</p>
              </div>

              <template v-else>
                <img :src="form.coverPreview" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <p class="text-white text-xs font-bold uppercase tracking-widest">GANTI GAMBAR</p>
                </div>
              </template>
            </div>
            <p v-if="errors.coverImage" class="text-center text-[10px] text-red-600">
              {{ errors.coverImage }}
            </p>

            <div class="p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl space-y-2">
              <div class="flex items-center gap-2 text-primary-700 dark:text-primary-400">
                <FileImage :size="16" />
                <span class="text-xs font-bold">REKOMENDASI</span>
              </div>
              <p class="text-[11px] text-primary-600 dark:text-primary-300 leading-relaxed">
                Gunakan gambar berkualitas tinggi dengan aspek rasio 16:9 agar tampilan berita
                terlihat profesional di halaman publik.
              </p>
            </div>
          </div>

          <!-- Status & Actions -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Pengaturan Berita
            </h3>

            <div>
              <label
                class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2"
                >Status</label
              >
              <div class="grid grid-cols-1 gap-2">
                <button
                  v-for="s in statuses"
                  :key="s.value"
                  type="button"
                  @click="form.status = s.value"
                  class="flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 text-xs font-medium"
                  :class="[
                    form.status === s.value
                      ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400'
                      : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  ]"
                >
                  {{ s.label }}
                  <div
                    v-if="form.status === s.value"
                    class="w-2 h-2 rounded-full bg-primary-500"
                  ></div>
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
              <BaseButton
                type="submit"
                variant="primary"
                :loading="isLoading"
                class="w-full py-4 rounded-xl shadow-lg shadow-primary-500/20"
              >
                PERBARUI BERITA
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                @click="router.push({ name: 'dashboard-news' })"
                :disabled="isLoading"
                class="w-full rounded-xl"
              >
                BATAL
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
