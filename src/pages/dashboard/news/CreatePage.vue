<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Upload, X, FileImage, Newspaper } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useNewsCreate } from '@/composables/news/useNewsCreate'
import { newsSchema } from '@/schemas/news.schema'
import { MediaCategory, MediaStatus } from '@/types/media'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const { showToast } = useToast()
const { createMutation, validationErrors } = useNewsCreate()

interface MediaFileItem {
  file: File
  preview: string
  alt: string
}

const form = reactive({
  title: '',
  category: '' as MediaCategory | '',
  content: '',
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
    const newMediaItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
    }))
    form.medias = [...form.medias, ...newMediaItems]
  }
}

const removeMedia = (index: number) => {
  form.medias.splice(index, 1)
}

const formatCategory = (cat: string) => {
  return cat
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
        content: form.content.trim() || '',
        category: (form.category as MediaCategory) || MediaCategory.Others,
        coverImage: form.coverImage!,
        mediaFiles: form.medias.map((m) => m.file),
        mediaAlts: form.medias.map((m) => m.alt || form.title.trim()),
      },
      {
        onSuccess: () => {
          showToast('Draf berita berhasil disimpan!', 'success')
          router.push({ name: 'dashboard-news' })
        },
        onError: (err) => {
          showToast(extractError(err, 'Gagal menyimpan draf berita'), 'error')
        },
      },
    )
    return
  }

  const result = newsSchema.safeParse({
    title: form.title.trim(),
    category: form.category,
    content: form.content.trim(),
    status: MediaStatus.PUBLISHED,
  })

  const zodErrors = getZodErrors(result)

  if (!form.coverImage) {
    zodErrors.coverImage = 'Cover image wajib diunggah'
  }

  errors.value = zodErrors
  if (!result.success || !form.coverImage) {
    showToast('Mohon lengkapi data berita dengan benar', 'error')
    return
  }

  createMutation.mutate(
    {
      title: result.data.title,
      category: result.data.category as MediaCategory,
      content: result.data.content,
      status: MediaStatus.PUBLISHED,
      coverImage: form.coverImage,
      mediaFiles: form.medias.map((m) => m.file),
      mediaAlts: form.medias.map((m) => m.alt),
    },
    {
      onSuccess: () => {
        showToast('Berita berhasil diterbitkan!', 'success')
        router.push({ name: 'dashboard-news' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal menerbitkan berita'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Berita Baru</template>

    <div class="max-w-full mx-auto space-y-6">
      <form
        @submit.prevent="handleSubmit(MediaStatus.PUBLISHED)"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        <!-- Left: Basic Info -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5"
          >
            <div class="flex items-center gap-3 pb-2 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
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
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
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
            class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
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
              <label class="cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  class="sr-only"
                  @change="handleMediasChange"
                />
                <div
                  class="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
                >
                  <Upload :size="16" />
                  TAMBAH MEDIA
                </div>
              </label>
            </div>

            <div
              v-if="form.medias.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
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
                    class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X :size="12" />
                  </button>
                </div>
                <BaseInput
                  :id="'media-alt-' + index"
                  v-model="item.alt"
                  placeholder="Alt text (deskripsi foto)"
                  size="sm"
                />
              </div>
            </div>

            <div
              v-else
              class="py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400"
            >
              <Upload :size="32" class="mb-2 opacity-20" />
              <p class="text-xs">Belum ada media tambahan</p>
            </div>
          </div>
        </div>

        <!-- Right: Cover Image -->
        <div class="space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
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
                @click="router.push({ name: 'dashboard-news' })"
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
