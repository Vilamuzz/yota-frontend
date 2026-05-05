<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  LayoutGrid,
  ArrowLeft,
  Loader2,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useGalleryDetail } from '@/composables/gallery/useGalleryDetail'
import { useGalleryUpdate } from '@/composables/gallery/useGalleryUpdate'
import { updateGallerySchema } from '@/schemas/gallery.schema'
import { MediaCategory, MediaStatus } from '@/types/media'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const galleryId = route.params.id as string
const { detailQuery } = useGalleryDetail(galleryId)
const { updateMutation, validationErrors } = useGalleryUpdate()

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
    const gallery = response.data
    form.title = gallery.title
    form.category = gallery.category
    form.content = gallery.content
    form.status = gallery.status
    form.coverPreview = gallery.coverImage
    form.existingMedias = gallery.medias || []
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
  const result = updateGallerySchema.safeParse({
    title: form.title,
    category: form.category,
    content: form.content,
    status: form.status,
    coverImage: form.coverImage || undefined,
    medias: form.mediaFiles.length > 0 ? form.mediaFiles : undefined,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon periksa kembali inputan Anda', 'error')
    return
  }

  updateMutation.mutate(
    {
      id: galleryId,
      data: {
        ...result.data,
        category: result.data.category as MediaCategory,
        status: result.data.status as MediaStatus,
        coverImage: result.data.coverImage,
        medias: result.data.medias,
      },
    },
    {
      onSuccess: () => {
        showToast('Galeri berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-galleries' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui galeri'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Galeri</template>

    <div v-if="isFetching" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Memuat data galeri...</p>
    </div>

    <div v-else class="max-w-full mx-auto space-y-6">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <BaseButton
          variant="outline"
          size="md"
          @click="router.push({ name: 'dashboard-galleries' })"
        >
          <ArrowLeft :size="18" class="mr-2" />
          Kembali
        </BaseButton>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Content Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
                <ImageIcon :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Konten Galeri
              </h3>
            </div>

            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Galeri"
              placeholder="Masukkan judul album atau kegiatan..."
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
                Keterangan Singkat
              </label>
              <textarea
                v-model="form.content"
                rows="6"
                placeholder="Berikan deskripsi singkat tentang foto-foto di album ini..."
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

          <!-- Multi-media Upload -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex items-center gap-3 pb-2">
              <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                <LayoutGrid :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Koleksi Foto (Album)
              </h3>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Upload Button -->
              <div class="relative group aspect-square shadow-sm">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="handleMediasChange"
                />
                <div
                  class="h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 group-hover:border-primary-400 group-hover:bg-primary-50/5 transition-all duration-200"
                >
                  <Upload :size="24" class="mb-1" />
                  <span class="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                </div>
              </div>

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
                <img :src="media.url" class="w-full h-full object-cover grayscale-20" />
                <div
                  class="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-500 text-white text-[8px] font-bold rounded uppercase"
                >
                  DI SERVER
                </div>
              </div>
            </div>
            <p
              v-if="errors.medias || validationErrors?.medias"
              class="mt-1 text-xs text-red-600 text-center"
            >
              {{ errors.medias || validationErrors?.medias }}
            </p>
          </div>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Sampul Galeri
            </h3>

            <div
              class="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
              :class="[
                form.coverPreview
                  ? 'border-primary-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
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
                <Camera class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-medium text-gray-500">PILIH SAMPUL</p>
              </div>

              <template v-else>
                <img :src="form.coverPreview" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="text-white" :size="24" />
                </div>
              </template>
            </div>
            <p
              v-if="errors.coverImage || validationErrors?.coverImage"
              class="text-center text-[10px] text-red-600"
            >
              {{ errors.coverImage || validationErrors?.coverImage }}
            </p>
          </div>

          <!-- Status & Actions -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Pengaturan Galeri
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
                PERBARUI GALERI
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                @click="router.push({ name: 'dashboard-galleries' })"
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
