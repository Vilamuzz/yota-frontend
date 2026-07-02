<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Layout, Info, CreditCard, X } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useSocialProgramCreate } from '@/composables/socialProgram/useSocialProgramCreate'
import { createSocialProgramSchema } from '@/schemas/socialProgram.schema'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const { createMutation, validationErrors } = useSocialProgramCreate()
const { showToast } = useToast()

const coverImageInputRef = ref<HTMLInputElement | null>(null)
const errors = ref<Record<string, string>>({})
const form = reactive({
  title: '',
  description: '',
  minimumAmount: '',
  billingDay: '',
  coverImageFile: null as File | null,
  coverImagePreview: null as string | null,
})

const isLoading = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(form.minimumAmount)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const titleError = computed(() => errors.value.title || validationErrors.value?.title || '')
const descriptionError = computed(
  () => errors.value.description || validationErrors.value?.description || '',
)
const minimumAmountError = computed(
  () => errors.value.minimumAmount || validationErrors.value?.minimumAmount || '',
)
const billingDayError = computed(
  () => errors.value.billingDay || validationErrors.value?.billingDay || '',
)
const coverImageError = computed(
  () => errors.value.coverImage || validationErrors.value?.coverImage || '',
)

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

const triggerImageInput = () => {
  coverImageInputRef.value?.click()
}

const handleCoverImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.value.coverImage = 'Hanya file JPG, PNG, atau WebP yang diperbolehkan'
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      errors.value.coverImage = 'Ukuran gambar maksimal 2 MB'
      return
    }

    form.coverImageFile = file
    form.coverImagePreview = URL.createObjectURL(file)
  }
}

const removeImage = () => {
  form.coverImageFile = null
  form.coverImagePreview = null
  if (coverImageInputRef.value) coverImageInputRef.value.value = ''
}

const handleSubmit = () => {
  const result = createSocialProgramSchema.safeParse({
    ...form,
    minimumAmount: form.minimumAmount === '' ? undefined : form.minimumAmount,
    billingDay: form.billingDay === '' ? undefined : form.billingDay,
  })

  const zodErrors = getZodErrors(result)
  const coverImageValidation: Record<string, string> = form.coverImageFile
    ? {}
    : { coverImage: 'Foto sampul wajib diunggah' }

  errors.value = { ...zodErrors, ...coverImageValidation }

  if (!result.success || Object.keys(coverImageValidation).length > 0) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  createMutation.mutate(
    {
      ...result.data,
      coverImage: form.coverImageFile!,
    },
    {
      onSuccess: () => {
        showToast('Program berkelanjutan berhasil ditambahkan!', 'success')
        router.push({ name: 'dashboard-social-programs' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal menambahkan program berkelanjutan'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Program Berkelanjutan</template>

    <div class="max-w-full mx-auto space-y-6">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <Layout :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Program
              </h3>
            </div>

            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Program"
              placeholder="Masukkan judul program berkelanjutan"
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
                v-model="form.description"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                :class="{ 'border-red-500': descriptionError }"
                placeholder="Jelaskan detail mengenai program berkelanjutan ini..."
              ></textarea>
              <p v-if="descriptionError" class="mt-1 text-xs text-red-600">
                {{ descriptionError }}
              </p>
            </div>
          </div>

          <!-- Configuration Section -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <CreditCard :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Konfigurasi Pembayaran
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="minimumAmount"
                v-model="form.minimumAmount"
                type="number"
                label="Minimal Nominal (Rp)"
                placeholder="mis. 50000"
                :error="minimumAmountError"
                :hint="formatCurrencyPreview ? `≈ ${formatCurrencyPreview}` : undefined"
                required
              />

              <BaseInput
                id="billingDay"
                v-model="form.billingDay"
                type="number"
                label="Hari Penagihan (1-31)"
                placeholder="mis. 5"
                min="1"
                max="31"
                :error="billingDayError"
                required
              />
            </div>

            <div
              class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3"
            >
              <Info :size="20" class="text-blue-500 shrink-0" />
              <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Hari penagihan adalah tanggal dimana sistem akan secara otomatis mengirimkan
                notifikasi atau melakukan penagihan iuran kepada donatur setiap bulannya.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Media & Actions -->
        <div class="space-y-6">
          <!-- Cover Image -->
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
                v-if="form.coverImagePreview"
                class="relative w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-sm"
              >
                <img :src="form.coverImagePreview" class="w-full h-full object-cover" />
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
                  coverImageError
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-100/50',
                ]"
              >
                <Camera class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                  Pilih Foto Sampul
                </p>
                <p class="text-[8px] text-gray-400 mt-1">
                  Rekomendasi 16:9 (JPG, PNG, WebP &bull; Max 2 MB)
                </p>
              </div>

              <input
                ref="coverImageInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleCoverImageChange"
              />
            </div>
            <p v-if="coverImageError" class="text-center text-[10px] text-red-600 mt-2">
              {{ coverImageError }}
            </p>
          </div>

          <!-- Actions -->
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
                :to="{ name: 'dashboard-social-programs' }"
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
