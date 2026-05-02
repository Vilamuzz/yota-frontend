<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Upload, X, ArrowLeft } from 'lucide-vue-next'
import { newsSchema } from '@/schemas/news.schema'
import { MediaCategory, MediaStatus } from '@/types/media'
import { useNewsDetail } from '@/composables/news/useNewsDetail'
import { useNewsUpdate } from '@/composables/news/useNewsUpdate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const newsId = route.params.id as string

const { detailQuery } = useNewsDetail(newsId)
const { updateMutation, validationErrors } = useNewsUpdate()
const { showToast } = useToast()

// ── Form state ─────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  category: '' as MediaCategory | '',
  status: MediaStatus.Draft as MediaStatus,
  content: '',
  coverImageFile: null as File | null,
  coverImagePreview: null as string | null,
})

const isFetching = computed(() => detailQuery.isPending.value)
const fieldErrors = ref<Record<string, string>>({})

// ── Computed errors ────────────────────────────────────────────────────────
const titleError = computed(() => fieldErrors.value.title || validationErrors.value?.title || '')
const categoryError = computed(
  () => fieldErrors.value.category || validationErrors.value?.category || '',
)
const statusError = computed(() => fieldErrors.value.status || validationErrors.value?.status || '')
const contentError = computed(
  () => fieldErrors.value.content || validationErrors.value?.content || '',
)
const coverImageError = computed(
  () => fieldErrors.value.coverImage || validationErrors.value?.coverImage || '',
)

// ── Pre-fill form when data loads ─────────────────────────────────────────
watch(
  () => detailQuery.data.value,
  (response) => {
    if (!response?.data) return
    const item = response.data
    form.title = item.title ?? ''
    form.category = (item.category as MediaCategory) ?? ''
    form.status = (item.status as MediaStatus) ?? MediaStatus.Draft
    form.content = item.content ?? ''
    if (item.coverImage) form.coverImagePreview = item.coverImage
  },
  { immediate: true },
)

// Clear local errors on change
watch(
  () => form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) fieldErrors.value = {}
    if (updateMutation.isError.value) updateMutation.reset()
  },
  { deep: true },
)

// ── Image handling ─────────────────────────────────────────────────────────
const coverImageInputRef = ref<HTMLInputElement | null>(null)

function triggerImageInput() {
  coverImageInputRef.value?.click()
}

function handleImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    fieldErrors.value = { ...fieldErrors.value, coverImage: 'Hanya JPG, PNG, atau WebP.' }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    fieldErrors.value = { ...fieldErrors.value, coverImage: 'Ukuran maksimal 5 MB.' }
    return
  }
  const { coverImage: _removed, ...rest } = fieldErrors.value
  fieldErrors.value = rest
  form.coverImageFile = file
  form.coverImagePreview = URL.createObjectURL(file)
}

function removeImage() {
  form.coverImageFile = null
  form.coverImagePreview = null
  if (coverImageInputRef.value) coverImageInputRef.value.value = ''
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function handleSubmit(overrideStatus?: MediaStatus) {
  const statusToUse = overrideStatus ?? form.status

  const result = newsSchema.safeParse({
    title: form.title.trim(),
    category: form.category,
    content: form.content.trim(),
    status: statusToUse,
  })

  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  await updateMutation.mutateAsync(
    {
      id: newsId,
      data: {
        title: form.title.trim(),
        category: form.category as MediaCategory,
        content: form.content.trim(),
        status: statusToUse,
        ...(form.coverImageFile ? { coverImage: form.coverImageFile } : {}),
      },
    },
    {
      onSuccess: () => {
        showToast('Berita berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-news' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui berita.'), 'error')
      },
    },
  )
}

const categories = Object.values(MediaCategory)
const statuses = Object.values(MediaStatus)

function categoryLabel(cat: string) {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Berita</template>

    <div class="max-w-full mx-auto">
      <!-- Loading skeleton -->
      <div
        v-if="isFetching"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8"
      >
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="h-52 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <form @submit.prevent="handleSubmit()" class="space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
              <!-- Left: image + metadata -->
              <div class="p-6 space-y-5">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Informasi Dasar
                </h3>

                <!-- Cover Image -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Gambar Sampul
                    <span class="text-gray-400 font-normal">(biarkan jika tidak ingin mengubah)</span>
                  </label>

                  <div
                    v-if="form.coverImagePreview"
                    class="relative w-full h-52 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
                  >
                    <img :src="form.coverImagePreview" alt="Preview" class="w-full h-full object-cover" />
                    <div
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
                    >
                      <button
                        type="button"
                        @click="removeImage"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow text-red-500 hover:text-red-600"
                      >
                        <X :size="18" />
                      </button>
                    </div>
                  </div>

                  <div
                    v-else
                    @click="triggerImageInput"
                    class="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                    :class="
                      coverImageError
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    "
                  >
                    <Upload :size="32" class="text-gray-400 mb-2" />
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Klik untuk unggah gambar baru
                    </p>
                    <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Maks. 5 MB</p>
                  </div>

                  <input
                    ref="coverImageInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="handleImageChange"
                  />
                  <p v-if="coverImageError" class="mt-1 text-xs text-red-600">{{ coverImageError }}</p>
                </div>

                <!-- Title -->
                <BaseInput
                  id="title"
                  v-model="form.title"
                  label="Judul Berita"
                  required
                  placeholder="Masukkan judul berita..."
                  :error="titleError"
                />

                <!-- Category + Status -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="category" class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Kategori <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      v-model="form.category"
                      class="w-full px-3 py-2 text-sm border rounded-lg transition focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      :class="categoryError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                    >
                      <option value="" disabled>Pilih kategori</option>
                      <option v-for="cat in categories" :key="cat" :value="cat">
                        {{ categoryLabel(cat) }}
                      </option>
                    </select>
                    <p v-if="categoryError" class="mt-1 text-xs text-red-600">{{ categoryError }}</p>
                  </div>

                  <div>
                    <label for="status" class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Status <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      v-model="form.status"
                      class="w-full px-3 py-2 text-sm border rounded-lg transition focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      :class="statusError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                    >
                      <option v-for="s in statuses" :key="s" :value="s">
                        {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                      </option>
                    </select>
                    <p v-if="statusError" class="mt-1 text-xs text-red-600">{{ statusError }}</p>
                  </div>
                </div>
              </div>

              <!-- Right: content -->
              <div class="p-6 space-y-5">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Konten
                </h3>

                <div class="flex flex-col h-[calc(100%-2.5rem)]">
                  <label for="content" class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Isi Berita <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    v-model="form.content"
                    rows="18"
                    placeholder="Tulis isi berita di sini..."
                    class="flex-1 w-full px-3 py-2 text-sm border rounded-lg transition focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    :class="contentError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  />
                  <p v-if="contentError" class="mt-1 text-xs text-red-600">{{ contentError }}</p>
                </div>
              </div>
            </div>

            <!-- Action bar -->
            <div
              class="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3"
            >
              <BaseButton
                type="button"
                variant="outline"
                :to="{ name: 'dashboard-news' }"
                :disabled="updateMutation.isPending.value"
              >
                <ArrowLeft :size="16" class="mr-1" />
                Kembali
              </BaseButton>

              <div class="flex items-center gap-3">
                <BaseButton
                  type="button"
                  variant="outline"
                  @click="handleSubmit(MediaStatus.Draft)"
                  :disabled="updateMutation.isPending.value"
                >
                  Simpan Draft
                </BaseButton>
                <BaseButton
                  type="submit"
                  variant="primary"
                  :loading="updateMutation.isPending.value"
                >
                  <template #loading>Menyimpan…</template>
                  Simpan Perubahan
                </BaseButton>
              </div>
            </div>
          </div>
        </form>
      </template>
    </div>
  </DashboardLayout>
</template>
