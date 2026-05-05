<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Upload, X, FileImage, Newspaper, ArrowLeft } from 'lucide-vue-next'
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

const form = reactive({
  title: '',
  category: '' as MediaCategory | '',
  content: '',
  status: MediaStatus.Draft,
  coverImage: null as File | null,
  coverPreview: null as string | null,
  mediaFiles: [] as File[],
  mediaPreviews: [] as string[],
})

const errors = ref<Record<string, string>>({})

const categories = Object.values(MediaCategory)
const statuses = [
  { label: 'Draft', value: MediaStatus.Draft },
  { label: 'Terbitkan', value: MediaStatus.Published },
  { label: 'Arsipkan', value: MediaStatus.Archived },
]

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
    form.mediaFiles = [...form.mediaFiles, ...files]
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    form.mediaPreviews = [...form.mediaPreviews, ...newPreviews]
  }
}

const removeMedia = (index: number) => {
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
  const result = newsSchema.safeParse({
    title: form.title.trim(),
    category: form.category,
    content: form.content.trim(),
    status: form.status,
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
      ...result.data,
      category: result.data.category as MediaCategory,
      status: result.data.status as MediaStatus,
      coverImage: form.coverImage,
      medias: form.mediaFiles.length > 0 ? form.mediaFiles : undefined,
    },
    {
      onSuccess: () => {
        showToast('Berita berhasil dibuat!', 'success')
        router.push({ name: 'dashboard-news' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal membuat berita'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Berita Baru</template>

    <div class="max-w-full mx-auto space-y-6">
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                >
                  <option v-for="s in statuses" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
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
              <p v-if="errors.content || validationErrors?.content" class="mt-1 text-xs text-red-600">
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
                <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
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

            <div
              v-if="form.mediaPreviews.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              <div
                v-for="(preview, index) in form.mediaPreviews"
                :key="index"
                class="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <img :src="preview" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeMedia(index)"
                  class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X :size="12" />
                </button>
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

          <div class="flex flex-col gap-3">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isLoading"
              class="w-full py-4 rounded-xl shadow-lg shadow-primary-500/20"
            >
              SIMPAN BERITA
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
      </form>
    </div>
  </DashboardLayout>
</template>
