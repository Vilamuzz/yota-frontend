<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Camera, HandHeart, CalendarDays, Tag, X } from 'lucide-vue-next'
import { DonationProgramCategoryEnum, DonationProgramStatusEnum } from '@/types/donationProgram'
import { updateDonationSchema } from '@/schemas/donationProgram.schema'
import { useDonationProgramAdminDetail } from '@/composables/donationProgram/useDonationProgramAdminDetail'
import { useDonationProgramUpdate } from '@/composables/donationProgram/useDonationProgramUpdate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const donationId = route.params.id as string
const { detailQuery } = useDonationProgramAdminDetail(donationId)
const { updateMutation, validationErrors } = useDonationProgramUpdate()

const todayStr = new Date().toISOString().split('T')[0]
const categories = Object.values(DonationProgramCategoryEnum)

const coverImageInputRef = ref<HTMLInputElement | null>(null)
const errors = ref<Record<string, string>>({})
const form = reactive({
  title: '',
  description: '',
  category: '',
  fundTarget: '',
  startDate: '',
  dateEnd: '',
  imageFile: null as File | null,
  imagePreview: null as string | null,
})

const isLoading = computed(() => updateMutation.isPending.value)
const isFetching = computed(() => detailQuery.isPending.value)
const isSuccess = computed(() => updateMutation.isSuccess.value)

const isDraft = computed(
  () => detailQuery.data.value?.data?.status === DonationProgramStatusEnum.DRAFT,
)

const formatCurrencyPreview = computed(() => {
  const num = Number(form.fundTarget)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const titleError = computed(() => errors.value.title || validationErrors.value?.title || '')
const descriptionError = computed(
  () => errors.value.description || validationErrors.value?.description || '',
)
const categoryError = computed(
  () => errors.value.category || validationErrors.value?.category || '',
)
const fundTargetError = computed(
  () => errors.value.fundTarget || validationErrors.value?.fundTarget || '',
)
const startDateError = computed(
  () => errors.value.startDate || validationErrors.value?.startDate || '',
)
const dateEndError = computed(() => errors.value.endDate || validationErrors.value?.endDate || '')
const imageError = computed(() => errors.value.image || validationErrors.value?.coverImage || '')

const formatCategory = (cat: DonationProgramCategoryEnum) => {
  if (cat === DonationProgramCategoryEnum.EDUCATION) return 'Pendidikan'
  if (cat === DonationProgramCategoryEnum.HEALTH) return 'Kesehatan'
  if (cat === DonationProgramCategoryEnum.ENVIRONMENT) return 'Lingkungan'
  if (cat === DonationProgramCategoryEnum.SOCIAL) return 'Sosial'
  if (cat === DonationProgramCategoryEnum.DISASTER) return 'Bencana'
  if (cat === DonationProgramCategoryEnum.HUMANITY) return 'Kemanusiaan'
  if (cat === DonationProgramCategoryEnum.OTHER) return 'Lainnya'
  return cat
}

// Populate form when data is fetched
watch(
  () => detailQuery.data.value,
  (response) => {
    if (!response?.data) return
    const donation = response.data
    form.title = donation.title ?? ''
    form.description = donation.description ?? ''
    form.category = donation.category ?? ''
    form.fundTarget = donation.fundTarget ? String(donation.fundTarget) : ''
    form.startDate = donation.startDate ? (donation.startDate.split('T')[0] ?? '') : ''
    form.dateEnd = donation.endDate ? (donation.endDate.split('T')[0] ?? '') : ''
    if (donation.coverImage) {
      form.imagePreview = donation.coverImage
    }
  },
  { immediate: true },
)

const triggerImageInput = () => {
  coverImageInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.value = { ...errors.value, image: 'Hanya file JPG, PNG, atau WebP yang diperbolehkan.' }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.value = { ...errors.value, image: 'Ukuran gambar maksimal 5 MB.' }
    return
  }

  const newErrors = { ...errors.value }
  delete newErrors.image
  errors.value = newErrors
  form.imageFile = file
  form.imagePreview = URL.createObjectURL(file)
}

const removeImage = () => {
  form.imageFile = null
  form.imagePreview = null
  if (coverImageInputRef.value) {
    coverImageInputRef.value.value = ''
  }
}

const validate = (): boolean => {
  const result = updateDonationSchema.safeParse({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    fundTarget: Number(form.fundTarget),
    startDate: form.startDate,
    endDate: form.dateEnd,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  errors.value = { ...zodErrors }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = (asDraft: boolean = false) => {
  if (asDraft) {
    if (!form.title.trim()) {
      errors.value = { title: 'Judul wajib diisi untuk draf' }
      return
    }

    updateMutation.mutate(
      {
        id: donationId,
        data: {
          title: form.title.trim(),
          status: DonationProgramStatusEnum.DRAFT,
          description: form.description.trim() || undefined,
          category: (form.category as DonationProgramCategoryEnum) || undefined,
          fundTarget: form.fundTarget ? Number(form.fundTarget) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.dateEnd || undefined,
          ...(form.imageFile ? { coverImage: form.imageFile } : {}),
        },
      },
      {
        onSuccess: () => {
          showToast('Draf berhasil diperbarui!', 'success')
          router.push({ name: 'dashboard-donation-programs' })
        },
        onError: (err) => {
          showToast(extractError(err, 'Gagal memperbarui draf.'), 'error')
        },
      },
    )
    return
  }

  if (!validate()) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  updateMutation.mutate(
    {
      id: donationId,
      data: {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as DonationProgramCategoryEnum,
        fundTarget: Number(form.fundTarget),
        startDate: form.startDate,
        endDate: form.dateEnd,
        ...(form.imageFile ? { coverImage: form.imageFile } : {}),
        status: DonationProgramStatusEnum.ACTIVE,
      },
    },
    {
      onSuccess: () => {
        showToast('Program donasi berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-donation-programs' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui program donasi.'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Program Donasi</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading Skeleton -->
      <div v-if="isFetching" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="grid grid-cols-2 gap-4">
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-3"
          >
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form
        v-else
        @submit.prevent="handleSubmit(false)"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <HandHeart :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Program
              </h3>
            </div>

            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Program"
              placeholder="mis. Bantu Bangun Sekolah di Lombok"
              :error="titleError"
              required
            />

            <div class="space-y-1.5">
              <label
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 tracking-wider"
              >
                Deskripsi Program <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="6"
                placeholder="Jelaskan tujuan dan detail kampanye donasi ini…"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none"
                :class="{ 'border-red-500': descriptionError }"
              ></textarea>
              <p v-if="descriptionError" class="mt-1 text-xs text-red-600">
                {{ descriptionError }}
              </p>
            </div>
          </div>

          <!-- Category & Financial Details Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <Tag :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Kategori & Target Dana
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Category -->
              <div class="space-y-1.5">
                <label
                  for="category"
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 tracking-wider"
                >
                  Kategori <span class="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  v-model="form.category"
                  class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-200 dark:border-gray-700"
                  :class="categoryError ? 'border-red-500' : 'border-gray-300'"
                >
                  <option value="" disabled>Pilih kategori</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ formatCategory(cat) }}
                  </option>
                </select>
                <p v-if="categoryError" class="mt-1 text-xs text-red-600">{{ categoryError }}</p>
              </div>

              <!-- Fund Target -->
              <BaseInput
                id="fundTarget"
                v-model="form.fundTarget"
                type="number"
                label="Target Dana (IDR)"
                placeholder="mis. 50000000"
                :error="fundTargetError"
                :hint="formatCurrencyPreview ? `≈ ${formatCurrencyPreview}` : undefined"
                required
              />
            </div>
          </div>

          <!-- Timeline Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                <CalendarDays :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Timeline Kampanye
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="startDate"
                v-model="form.startDate"
                type="date"
                label="Tanggal Mulai"
                required
                :error="startDateError"
              />
              <BaseInput
                id="dateEnd"
                v-model="form.dateEnd"
                type="date"
                label="Tanggal Selesai"
                required
                :min="form.startDate || todayStr"
                :error="dateEndError"
              />
            </div>
          </div>
        </div>

        <!-- Right Column: Cover Image & Actions -->
        <div class="space-y-6">
          <!-- Cover Image Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Sampul Program
            </h3>

            <div class="flex justify-center">
              <div
                v-if="form.imagePreview"
                class="relative w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-sm"
              >
                <img :src="form.imagePreview" class="w-full h-full object-cover" alt="Preview" />
                <div
                  class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center"
                >
                  <button
                    type="button"
                    @click="removeImage"
                    class="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-lg text-red-500 hover:scale-110 transition-all duration-200"
                  >
                    <X :size="20" />
                  </button>
                </div>
              </div>

              <div
                v-else
                @click="triggerImageInput"
                class="relative w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-900/50"
                :class="[
                  imageError
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-100/50',
                ]"
              >
                <Camera class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                  Pilih Foto Sampul
                </p>
                <p class="text-[8px] text-gray-400 mt-1">
                  Rekomendasi 16:9 (JPG, PNG, WebP &bull; Maks 5 MB)
                </p>
              </div>

              <input
                ref="coverImageInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleImageChange"
              />
            </div>
            <p v-if="imageError" class="text-center text-[10px] text-red-600 mt-2">
              {{ imageError }}
            </p>
            <p class="text-center text-[9px] text-gray-400">
              Biarkan kosong untuk mempertahankan foto saat ini
            </p>
          </div>

          <!-- Actions Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex flex-col gap-3">
              <BaseButton
                type="submit"
                variant="primary"
                :loading="isLoading"
                :disabled="isSuccess"
                class="w-full"
              >
                <template #loading>Menyimpan…</template>
                Simpan Perubahan
              </BaseButton>
              <BaseButton
                v-if="isDraft"
                type="button"
                variant="outline"
                @click="handleSubmit(true)"
                :disabled="isLoading"
                class="w-full"
              >
                Simpan Draf
              </BaseButton>
              <BaseButton
                type="button"
                variant="danger"
                :to="{ name: 'dashboard-donation-programs' }"
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
