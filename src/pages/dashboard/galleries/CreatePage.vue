<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { X, Image as ImageIcon, Camera, LayoutGrid, Plus } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useGalleryCreate } from '@/composables/gallery/useGalleryCreate'
import { createGallerySchema } from '@/schemas/gallery.schema'
import { MediaCategory, MediaStatus } from '@/types/media'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const { showToast } = useToast()
const { createMutation, validationErrors } = useGalleryCreate()

interface MediaFileItem {
  file: File
  preview: string
  alt: string
  order: number
}

const form = reactive({
  title: '',
  category: '' as MediaCategory | '',
  description: '',
  status: MediaStatus.DRAFT,
  coverImage: null as File | null,
  coverPreview: null as string | null,
  medias: [] as MediaFileItem[],
})

const errors = ref<Record<string, string>>({})
const categories = Object.values(MediaCategory)
const isLoading = computed(() => createMutation.isPending.value)

watch(
  () => form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      errors.value = {}
    }
    if (createMutation.isError.value) {
      createMutation.reset()
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
    const newMediaItems = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
      order: form.medias.length + index + 1,
    }))
    form.medias = [...form.medias, ...newMediaItems]
  }
}

const removeMedia = (index: number) => {
  form.medias.splice(index, 1)
  // Re-order remaining items
  form.medias.forEach((item, idx) => {
    item.order = idx + 1
  })
}

const handleSubmit = (status: MediaStatus = MediaStatus.PUBLISHED) => {
  if (status === MediaStatus.DRAFT) {
    if (!form.title.trim()) {
      errors.value = { title: 'Judul wajib diisi untuk draf' }
      return
    }

    createMutation.mutate(
      {
        title: form.title.trim(),
        status: MediaStatus.DRAFT,
        description: form.description.trim() || '',
        category: (form.category as MediaCategory) || MediaCategory.Others,
        coverImage: form.coverImage!,
        mediaFiles: form.medias.map((m) => m.file),
        mediaAlts: form.medias.map((m) => m.alt || form.title.trim()),
      },
      {
        onSuccess: () => {
          showToast('Draf galeri berhasil disimpan!', 'success')
          router.push({ name: 'dashboard-galleries' })
        },
        onError: (err) => {
          showToast(extractError(err, 'Gagal menyimpan draf galeri'), 'error')
        },
      },
    )
    return
  }

  const result = createGallerySchema.safeParse({
    title: form.title,
    category: form.category,
    description: form.description,
    status: MediaStatus.PUBLISHED,
    coverImage: form.coverImage,
    mediaFiles: form.medias.map((m) => m.file),
    mediaAlts: form.medias.map((m) => m.alt),
    mediaOrders: form.medias.map((m) => m.order),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  createMutation.mutate(
    {
      title: result.data.title,
      category: result.data.category,
      description: result.data.description,
      status: MediaStatus.PUBLISHED,
      coverImage: result.data.coverImage,
      mediaFiles: result.data.mediaFiles,
      mediaAlts: result.data.mediaAlts,
    },
    {
      onSuccess: () => {
        showToast('Galeri berhasil diterbitkan!', 'success')
        router.push({ name: 'dashboard-galleries' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal menerbitkan galeri'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Galeri Baru</template>

    <div class="max-w-full mx-auto space-y-6">
      <form
        @submit.prevent="handleSubmit(MediaStatus.PUBLISHED)"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Left Column: Content Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
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
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
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
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
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
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
              >
                Deskripsi Galeri
              </label>
              <textarea
                v-model="form.description"
                rows="6"
                placeholder="Berikan deskripsi lengkap tentang galeri ini..."
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500 transition-all duration-200 outline-none resize-none"
                :class="{ 'border-red-500': errors.description || validationErrors?.description }"
              ></textarea>
              <p
                v-if="errors.description || validationErrors?.description"
                class="mt-1 text-xs text-red-600"
              >
                {{ errors.description || validationErrors?.description }}
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

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <!-- Upload Button -->
              <div class="relative group h-40">
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
                  <Plus :size="24" class="mb-1" />
                  <span class="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                </div>
              </div>

              <!-- Previews with Metadata -->
              <div
                v-for="(item, index) in form.medias"
                :key="index"
                class="bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-3 space-y-3"
              >
                <div class="relative aspect-video rounded-lg overflow-hidden group">
                  <img :src="item.preview" class="w-full h-full object-cover" />
                  <button
                    type="button"
                    @click="removeMedia(index)"
                    class="absolute top-2 right-2 p-1 bg-white/90 dark:bg-gray-800/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X :size="14" />
                  </button>
                  <div
                    class="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded"
                  >
                    #{{ item.order }}
                  </div>
                </div>
                <BaseInput
                  :id="'media-alt-' + index"
                  v-model="item.alt"
                  placeholder="Alt text (deskripsi foto)"
                  size="sm"
                />
              </div>
            </div>
            <p
              v-if="errors.mediaFiles || validationErrors?.media"
              class="mt-1 text-xs text-red-600 text-center"
            >
              {{ errors.mediaFiles || validationErrors?.media }}
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
            <div class="flex flex-col gap-3">
              <BaseButton type="submit" variant="primary" :loading="isLoading" class="w-full">
                Simpan
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                @click="handleSubmit(MediaStatus.DRAFT)"
                :disabled="isLoading"
                class="w-full"
              >
                Simpan Draf
              </BaseButton>
              <BaseButton
                type="button"
                variant="danger"
                @click="router.push({ name: 'dashboard-galleries' })"
                :disabled="isLoading"
                class="w-full"
              >
                Batal
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
