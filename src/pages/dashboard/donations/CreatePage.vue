<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useDonationCreate } from '@/composables/donation/useDonationCreate'
import { ArrowLeft, Upload, X, HandHeart } from 'lucide-vue-next'
import { createDonationSchema } from '@/schemas/donation.schema'
import { getZodErrors } from '@/utils/zodError'

const router = useRouter()
const { createMutation, createError } = useDonationCreate()

// Form fields
const title = ref('')
const description = ref('')
const category = ref('')
const fundTarget = ref('')
const dateEnd = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Validation errors – field names match schema keys + 'image'
const errors = ref<Record<string, string>>({})

const categories = ['education', 'health', 'environment', 'social', 'disaster']

const isLoading = computed(() => createMutation.isPending.value)
const isSuccess = computed(() => createMutation.isSuccess.value)

// ─── Image handling ─────────────────────────────────────────────────────────
const imageInputRef = ref<HTMLInputElement | null>(null)

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.value = { ...errors.value, image: 'Only JPG, PNG, or WebP images are allowed.' }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.value = { ...errors.value, image: 'Image must be smaller than 5 MB.' }
    return
  }

  const { image: _, ...rest } = errors.value
  void _
  errors.value = rest
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

// ─── Validation ─────────────────────────────────────────────────────────────
const validate = (): boolean => {
  const result = createDonationSchema.safeParse({
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value,
    fund_target: Number(fundTarget.value),
    date_end: dateEnd.value,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])

  // Image is a File (not in Zod schema), validate separately
  const imageError: Record<string, string> = imageFile.value
    ? {}
    : { image: 'Please upload a campaign image.' }

  errors.value = { ...zodErrors, ...imageError }
  return Object.keys(errors.value).length === 0
}

// ─── Submit ──────────────────────────────────────────────────────────────────
const handleSubmit = async (status: 'active' | 'draft' = 'active') => {
  if (!validate()) return

  await createMutation.mutateAsync({
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value,
    fund_target: Number(fundTarget.value),
    date_end: dateEnd.value,
    image: imageFile.value!,
    status: status === 'draft' ? false : true,
  })

  if (createMutation.isSuccess.value) {
    setTimeout(() => router.push({ name: 'dashboard-donations' }), 1200)
  }
}

const handleCancel = () => {
  router.push({ name: 'dashboard-donations' })
}

const handleSaveDraft = () => handleSubmit('draft')

// Today's date string for min date constraint
const todayStr = new Date().toISOString().split('T')[0]

const formatCurrencyPreview = computed(() => {
  const num = Number(fundTarget.value)
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
    <div class="max-w-[100%] mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <button
          @click="handleCancel"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          title="Back to donations"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 rounded-lg">
            <HandHeart :size="24" class="text-primary-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Create Donation Campaign</h2>
            <p class="text-sm text-gray-500">Fill in the details below to launch a new campaign.</p>
          </div>
        </div>
      </div>

      <!-- Success Banner -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="isSuccess"
          class="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium"
        >
          <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Donation campaign created successfully! Redirecting…
        </div>
      </transition>

      <!-- API Error Banner -->
      <div
        v-if="createError"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        {{ createError }}
      </div>

      <!-- Form Card -->
      <form
        @submit.prevent="() => handleSubmit('active')"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Campaign Image Upload -->
            <div>
              <p class="text-xs font-medium text-gray-700 mb-3">
                Campaign Image <span class="text-red-500">*</span>
              </p>

              <!-- Preview area -->
              <div
                v-if="imagePreview"
                class="relative w-full h-52 rounded-lg overflow-hidden group"
              >
                <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
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
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.image
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                "
              >
                <Upload :size="28" class="text-gray-400 mb-2" />
                <p class="text-sm font-medium text-gray-600">Click to upload image</p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP &bull; Max 5 MB</p>
              </div>

              <input
                ref="imageInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleImageChange"
              />
              <p v-if="errors.image" class="mt-1 text-xs text-red-600">{{ errors.image }}</p>
            </div>

            <!-- Title -->
            <BaseInput
              id="title"
              v-model="title"
              label="Title"
              placeholder="e.g. Help Build a School in Lombok"
              :required="true"
              :error="errors.title"
            />
          </div>
          <div>
            <!-- Form Fields -->
            <div class="p-6 space-y-5">
              <!-- Description -->
              <div>
                <label for="description" class="block text-xs font-medium text-gray-700 mb-1">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  v-model="description"
                  rows="5"
                  placeholder="Describe the goal of this donation campaign…"
                  class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  :class="
                    errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  "
                />
                <p v-if="errors.description" class="mt-1 text-xs text-red-600">
                  {{ errors.description }}
                </p>
              </div>

              <!-- Category + Fund Target (side by side on md+) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Category -->
                <div>
                  <label for="category" class="block text-xs font-medium text-gray-700 mb-1">
                    Category <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    v-model="category"
                    class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    :class="
                      errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    "
                  >
                    <option value="" disabled>Select a category</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                    </option>
                  </select>
                  <p v-if="errors.category" class="mt-1 text-xs text-red-600">
                    {{ errors.category }}
                  </p>
                </div>

                <!-- Fund Target -->
                <div>
                  <label for="fund-target" class="block text-xs font-medium text-gray-700 mb-1">
                    Fund Target (IDR) <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="fund-target"
                    v-model="fundTarget"
                    type="number"
                    min="1"
                    placeholder="e.g. 50000000"
                    class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    :class="
                      errors.fund_target ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    "
                  />
                  <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500">
                    ≈ {{ formatCurrencyPreview }}
                  </p>
                  <p v-if="errors.fund_target" class="mt-1 text-xs text-red-600">
                    {{ errors.fund_target }}
                  </p>
                </div>
              </div>

              <!-- End Date -->
              <div>
                <label for="date-end" class="block text-xs font-medium text-gray-700 mb-1">
                  Campaign End Date <span class="text-red-500">*</span>
                </label>
                <input
                  id="date-end"
                  v-model="dateEnd"
                  type="date"
                  :min="todayStr"
                  class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  :class="errors.date_end ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
                />
                <p v-if="errors.date_end" class="mt-1 text-xs text-red-600">
                  {{ errors.date_end }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-6 pb-4 flex items-center justify-between gap-3">
          <BaseButton type="button" variant="danger" @click="handleCancel" :disabled="isLoading">
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
            <BaseButton type="submit" variant="primary" :loading="isLoading" :disabled="isSuccess">
              <template #loading>Creating…</template>
              Create Campaign
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
