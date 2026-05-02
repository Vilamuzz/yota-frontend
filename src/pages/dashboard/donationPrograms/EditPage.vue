<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Upload, X } from 'lucide-vue-next'
import {
  DonationProgramStatusEnum,
  type DonationProgramCategoryEnum,
} from '@/types/donationProgram'
import { updateDonationSchema } from '@/schemas/donationProgram.schema'
import { useDonationProgramDetail } from '@/composables/donationProgram/useDonationProgramAdminDetail'
import { useDonationProgramUpdate } from '@/composables/donationProgram/useDonationProgramUpdate'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const donationId = route.params.id as string

const { donationDetailQuery } = useDonationProgramDetail(donationId)
const { updateDonationMutation, validationErrors } = useDonationProgramUpdate()
const { showToast } = useToast()

// Form state
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

// Validation errors
const fieldErrors = ref<Record<string, string>>({})

const titleError = computed(() => fieldErrors.value.title || validationErrors.value?.title || '')
const descriptionError = computed(
  () => fieldErrors.value.description || validationErrors.value?.description || '',
)
const categoryError = computed(
  () => fieldErrors.value.category || validationErrors.value?.category || '',
)
const fundTargetError = computed(
  () => fieldErrors.value.fund_target || validationErrors.value?.fundTarget || '',
)
const startDateError = computed(
  () => fieldErrors.value.date_start || validationErrors.value?.startDate || '',
)
const dateEndError = computed(
  () => fieldErrors.value.date_end || validationErrors.value?.endDate || '',
)
const imageError = computed(
  () => fieldErrors.value.image || validationErrors.value?.coverImage || '',
)

const categories = ['education', 'health', 'environment', 'social', 'disaster']

const isLoading = computed(() => updateDonationMutation.isPending.value)
const isSuccess = computed(() => updateDonationMutation.isSuccess.value)
const isFetching = computed(() => donationDetailQuery.isPending.value)

// Pre-fill form when detail loads
watch(
  () => donationDetailQuery.data.value,
  (response) => {
    if (!response?.data) return
    const donation = response.data
    form.title = donation.title ?? ''
    form.description = donation.description ?? ''
    form.category = donation.category ?? ''
    form.fundTarget = donation.fundTarget ? String(donation.fundTarget) : ''
    // Normalise date to YYYY-MM-DD for the date input
    form.startDate = donation.startDate ? (donation.startDate.split('T')[0] ?? '') : ''
    form.dateEnd = donation.endDate ? (donation.endDate.split('T')[0] ?? '') : ''
    // Show existing image as preview (URL, not a File)
    if (donation.coverImage) form.imagePreview = donation.coverImage
  },
  { immediate: true },
)

// Image handling
const coverImageInputRef = ref<HTMLInputElement | null>(null)

const triggerImageInput = () => {
  coverImageInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    fieldErrors.value = {
      ...fieldErrors.value,
      image: 'Only JPG, PNG, or WebP images are allowed.',
    }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    fieldErrors.value = { ...fieldErrors.value, image: 'Image must be smaller than 5 MB.' }
    return
  }

  const newErrors = { ...fieldErrors.value }
  delete newErrors.image
  fieldErrors.value = newErrors
  form.imageFile = file
  form.imagePreview = URL.createObjectURL(file)
}

const removeImage = () => {
  form.imageFile = null
  form.imagePreview = null
  if (coverImageInputRef.value) coverImageInputRef.value.value = ''
}

// Validation
const validate = (): boolean => {
  const result = updateDonationSchema.safeParse({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    fund_target: Number(form.fundTarget),
    date_start: form.startDate,
    date_end: form.dateEnd,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  fieldErrors.value = { ...zodErrors }
  return Object.keys(fieldErrors.value).length === 0
}

// Submit
const handleSubmit = async (status: boolean) => {
  if (!validate()) return

  await updateDonationMutation.mutateAsync(
    {
      donationId: donationId,
      data: {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as DonationProgramCategoryEnum,
        fundTarget: Number(form.fundTarget),
        startDate: form.startDate,
        endDate: form.dateEnd,
        ...(form.imageFile ? { coverImage: form.imageFile } : {}),
        status: status ? DonationProgramStatusEnum.ACTIVE : DonationProgramStatusEnum.DRAFT,
      },
    },
    {
      onSuccess: () => {
        showToast('Donation campaign updated successfully!', 'success')
        router.push({ name: 'dashboard-donation-programs' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Failed to update donation campaign.'), 'error')
      },
    },
  )
}

const handleSaveDraft = () => handleSubmit(false)

// Today's date string for min date constraint
const todayStr = new Date().toISOString().split('T')[0]

const formatCurrencyPreview = computed(() => {
  const num = Number(form.fundTarget)
  if (!num || isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
})
</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading skeleton -->
      <div
        v-if="isFetching"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8"
      >
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div class="h-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <template v-else>
        <!-- Form Card -->
        <form
          @submit.prevent="() => handleSubmit(true)"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="p-6 space-y-5">
              <!-- Campaign Image Upload -->
              <div>
                <p class="text-xs font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Campaign Image
                  <span class="text-gray-400 dark:text-gray-500 font-normal"
                    >(leave unchanged to keep current)</span
                  >
                </p>

                <!-- Preview area -->
                <div
                  v-if="form.imagePreview"
                  class="relative w-full h-52 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
                >
                  <img :src="form.imagePreview" alt="Preview" class="w-full h-full object-cover" />
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
                    imageError
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
                <p v-if="imageError" class="mt-1 text-xs text-red-600">{{ imageError }}</p>
              </div>

              <!-- Title -->
              <BaseInput
                id="title"
                v-model="form.title"
                label="Title"
                placeholder="e.g. Help Build a School in Lombok"
                :error="titleError"
              />
            </div>
            <div>
              <!-- Form Fields -->
              <div class="p-6 space-y-5">
                <!-- Description -->
                <div>
                  <label
                    for="description"
                    class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Description
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

                <!-- Category + Fund Target (side by side on md+) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <!-- Category -->
                  <div>
                    <label
                      for="category"
                      class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      v-model="form.category"
                      class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      :class="
                        categoryError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      "
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
                    v-model="form.startDate"
                    type="date"
                    label="Campaign Start Date"
                    :error="startDateError"
                  />

                  <!-- End Date -->
                  <BaseInput
                    id="dateEnd"
                    v-model="form.dateEnd"
                    type="date"
                    label="Campaign End Date"
                    :min="form.startDate || todayStr"
                    :error="dateEndError"
                  />
                </div>
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
              :disabled="isLoading"
            >
              Cancel
            </BaseButton>
            <div class="flex items-center gap-3">
              <BaseButton
                type="button"
                variant="outline"
                @click="handleSaveDraft"
                :disabled="isLoading"
              >
                Save Draft
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                :loading="isLoading"
                :disabled="isSuccess"
              >
                <template #loading>Saving…</template>
                Save Changes
              </BaseButton>
            </div>
          </div>
        </form>
      </template>
    </div>
  </DashboardLayout>
</template>
