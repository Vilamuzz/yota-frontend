<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, X } from 'lucide-vue-next'
import { createDonationSchema } from '@/schemas/donationProgram.schema'
import { DonationProgramCategoryEnum, DonationProgramStatusEnum } from '@/types/donationProgram'
import { useDonationProgramCreate } from '@/composables/donationProgram/useDonationProgramCreate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const { createMutation, validationErrors } = useDonationProgramCreate()
const { showToast } = useToast()

const todayStr = new Date().toISOString().split('T')[0]
const categories = Object.values(DonationProgramCategoryEnum)

const coverImageInputRef = ref<HTMLInputElement | null>(null)
const errors = ref<Record<string, string>>({})
const form = reactive({
  title: '',
  description: '',
  category: '',
  fundTarget: '',
  startDate: todayStr,
  dateEnd: '',
  coverImageFile: null as File | null,
  coverImagePreview: null as string | null,
})

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
  () => errors.value.fund_target || validationErrors.value?.fundTarget || '',
)
const startDateError = computed(
  () => errors.value.date_start || validationErrors.value?.startDate || '',
)
const dateEndError = computed(() => errors.value.date_end || validationErrors.value?.endDate || '')
const coverImageFileError = computed(
  () => errors.value.cover_image || validationErrors.value?.coverImage || '',
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

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.value.image = 'Only JPG, PNG, or WebP images are allowed.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.value.cover_image = 'Image must be smaller than 5 MB.'
    return
  }

  form.coverImageFile = file
  form.coverImagePreview = URL.createObjectURL(file)
}

const removeImage = () => {
  form.coverImageFile = null
  form.coverImagePreview = null
  if (coverImageInputRef.value) coverImageInputRef.value.value = ''
}

const handleSubmit = (status: 'active' | 'draft' = 'active') => {
  const result = createDonationSchema.safeParse({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    fundTarget: Number(form.fundTarget),
    startDate: form.startDate,
    endDate: form.dateEnd,
  })

  const zodErrors = getZodErrors(result)
  const coverImageValidation: Record<string, string> = form.coverImageFile
    ? {}
    : { image: 'Please upload a campaign image.' }

  errors.value = { ...zodErrors, ...coverImageValidation }
  if (!result.success || Object.keys(coverImageValidation).length > 0) return

  createMutation.mutate(
    {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as DonationProgramCategoryEnum,
      fundTarget: Number(form.fundTarget),
      startDate: form.startDate!,
      endDate: form.dateEnd,
      coverImage: form.coverImageFile!,
      status:
        status === 'draft' ? DonationProgramStatusEnum.DRAFT : DonationProgramStatusEnum.ACTIVE,
    },
    {
      onSuccess: () => {
        showToast('Donation campaign created successfully!', 'success')
        router.push({ name: 'dashboard-donation-programs' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Failed to create donation campaign.'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <form @submit.prevent="handleSubmit('active')" class="space-y-6">
        <!-- Form Content -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
            <!-- Left Column: Image and Basic Info -->
            <div class="space-y-5">
              <!-- Campaign Image Upload -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Campaign Image <span class="text-red-500">*</span>
                </label>

                <!-- Preview area -->
                <div
                  v-if="form.coverImagePreview"
                  class="relative w-full h-52 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
                >
                  <img
                    :src="form.coverImagePreview"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center"
                  >
                    <button
                      type="button"
                      @click="removeImage"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                      title="Remove image"
                    >
                      <X :size="18" />
                    </button>
                  </div>
                </div>

                <!-- Upload dropzone -->
                <div
                  v-else
                  @click="triggerImageInput"
                  class="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                  :class="
                    coverImageFileError
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  "
                >
                  <Upload :size="32" class="text-gray-400 mb-2" />
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Click to upload image
                  </p>
                  <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP &bull; Max 5 MB</p>
                </div>

                <input
                  ref="coverImageInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleImageChange"
                />
                <p v-if="coverImageFileError" class="mt-1 text-xs text-red-600">
                  {{ coverImageFileError }}
                </p>
              </div>

              <!-- Title -->
              <BaseInput
                id="title"
                v-model="form.title"
                label="Title"
                required
                placeholder="e.g. Help Build a School in Lombok"
                :error="titleError"
              />
            </div>

            <!-- Right Column: Description and Details -->
            <div class="space-y-5">
              <!-- Description -->
              <div>
                <label
                  for="description"
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="5"
                  placeholder="Describe the goal of this donation campaign…"
                  class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  :class="
                    descriptionError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  "
                />
                <p v-if="descriptionError" class="mt-1 text-xs text-red-600">
                  {{ descriptionError }}
                </p>
              </div>

              <!-- Category + Fund Target -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Category -->
                <div>
                  <label
                    for="category"
                    class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Category <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    v-model="form.category"
                    class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    :class="categoryError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                  >
                    <option value="" disabled>Select a category</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                    </option>
                  </select>
                  <p v-if="categoryError" class="mt-1 text-xs text-red-600">
                    {{ categoryError }}
                  </p>
                </div>

                <!-- Fund Target -->
                <div>
                  <BaseInput
                    id="fundTarget"
                    v-model="form.fundTarget"
                    type="number"
                    label="Fund Target (IDR)"
                    required
                    placeholder="e.g. 50000000"
                    :error="fundTargetError"
                    :hint="formatCurrencyPreview ? `≈ ${formatCurrencyPreview}` : undefined"
                  />
                </div>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Start Date -->
                <BaseInput
                  id="startDate"
                  v-model="form.startDate!"
                  type="date"
                  label="Campaign Start Date"
                  required
                  :error="startDateError"
                />

                <!-- End Date -->
                <BaseInput
                  id="dateEnd"
                  v-model="form.dateEnd"
                  type="date"
                  label="Campaign End Date"
                  required
                  :min="form.startDate || todayStr"
                  :error="dateEndError"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3"
          >
            <BaseButton
              type="button"
              variant="danger"
              :to="{ name: 'dashboard-donation-programs' }"
              :disabled="createMutation.isPending.value"
            >
              Cancel
            </BaseButton>
            <div class="flex items-center gap-3">
              <BaseButton
                type="button"
                variant="outline"
                @click="handleSubmit('draft')"
                :disabled="createMutation.isPending.value"
              >
                Save Draft
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                :loading="createMutation.isPending.value"
                :disabled="createMutation.isSuccess.value"
              >
                <template #loading>Creating…</template>
                Create Campaign
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
