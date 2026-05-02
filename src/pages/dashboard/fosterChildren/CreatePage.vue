<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useFosterChildrenCreate } from '@/composables/fosterChildren/useFosterChildrenCreate'
import { createFosterChildrenSchema } from '@/schemas/fosterChildren.schema'
import { getZodErrors } from '@/utils/zodError'
import { ArrowLeft, Trash2, Eye, X, Plus, Baby, Upload } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Category, Gender, type Achievement } from '@/types/fosterChildren'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const router = useRouter()
const { createMutation, validationErrors } = useFosterChildrenCreate()
const { showToast } = useToast()

const form = reactive({
  name: '',
  gender: '' as Gender | '',
  category: '' as Category | '',
  birthPlace: '',
  birthDate: '',
  address: '',
  achievementInput: '',
  achievements: [] as string[],
  image: null as File | null,
  imagePreview: null as string | null,
  achivements: [] as File[],
  achivementPreviews: [] as string[],
  status: 'aktif' as 'aktif' | 'lulus',
})

const fieldErrors = ref<Record<string, string>>({})

const nameError = computed(() => fieldErrors.value.name || validationErrors.value?.name || '')
const genderError = computed(() => fieldErrors.value.gender || validationErrors.value?.gender || '')
const categoryError = computed(
  () => fieldErrors.value.category || validationErrors.value?.category || '',
)
const birthPlaceError = computed(
  () => fieldErrors.value.birthPlace || validationErrors.value?.birthPlace || '',
)
const birthDateError = computed(
  () => fieldErrors.value.birthDate || validationErrors.value?.birthDate || '',
)
const addressError = computed(
  () => fieldErrors.value.address || validationErrors.value?.address || '',
)
const imageError = computed(
  () =>
    fieldErrors.value.profilePicture ||
    fieldErrors.value.image ||
    validationErrors.value?.profilePicture ||
    '',
)
const achievementsError = computed(
  () => fieldErrors.value.achievements || validationErrors.value?.achievements || '',
)
const statusError = computed(() => fieldErrors.value.status || validationErrors.value?.status || '')
const achivementError = computed(() => fieldErrors.value.achivement || '')

watch(
  () => form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (createMutation.isError.value) {
      createMutation.reset()
    }
  },
  { deep: true },
)

const genders = Object.values(Gender)
const categories = Object.values(Category)

const isLoading = computed(() => createMutation.isPending.value)

const addAchievement = () => {
  if (form.achievementInput.trim()) {
    form.achievements.push(form.achievementInput.trim())
    form.achievementInput = ''
  }
}

const removeAchievement = (index: number) => {
  form.achievements.splice(index, 1)
}

const imageInputRef = ref<HTMLInputElement | null>(null)

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    fieldErrors.value.image = 'Format gambar tidak valid. Hanya JPG dan PNG.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    fieldErrors.value.image = 'Ukuran gambar terlalu besar. Maksimal 2MB.'
    return
  }

  form.image = file
  form.imagePreview = URL.createObjectURL(file)
}

const removeImage = () => {
  form.image = null
  form.imagePreview = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

const achivementInputRef = ref<HTMLInputElement | null>(null)

const triggerachivementInput = () => {
  achivementInputRef.value?.click()
}

const handleachivementChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files

  if (!files) return

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  for (const file of Array.from(files)) {
    if (!allowedTypes.includes(file.type)) {
      fieldErrors.value.achivement = 'Format sertifikat harus PDF atau DOC'
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      fieldErrors.value.achivement = 'Ukuran maksimal file 5MB'
      return
    }
    form.achivements.push(file)
    form.achivementPreviews.push(URL.createObjectURL(file))
  }
}

const removeAchivement = (index: number) => {
  form.achivements.splice(index, 1)
  form.achivementPreviews.splice(index, 1)
}

const previewAchivement = (file: File) => {
  const url = URL.createObjectURL(file)
  window.open(url)
}

const validate = () => {
  const result = createFosterChildrenSchema.safeParse({
    name: form.name.trim(),
    gender: form.gender,
    category: form.category,
    birthplace: form.birthPlace.trim(),
    birth_date: form.birthDate,
    address: form.address.trim(),
    image: form.image,
    achievements: form.achievements,
    certificates: form.achivements,
    status: form.status,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])

  const imageValidation: Record<string, string> = form.image
    ? {}
    : { image: 'Foto anak asuh wajib diunggah' }

  fieldErrors.value = { ...zodErrors, ...imageValidation }
  return Object.keys(fieldErrors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  createMutation.mutate(
    {
      name: form.name.trim(),
      gender: form.gender as Gender,
      category: form.category as Category,
      birthPlace: form.birthPlace.trim(),
      birthDate: form.birthDate,
      address: form.address.trim(),
      profilePicture: form.image!,
      familyCard: new File([''], 'kk.pdf', { type: 'application/pdf' }), // Placeholder as per original logic
      sktm: new File([''], 'sktm.pdf', { type: 'application/pdf' }), // Placeholder as per original logic
      achievements: form.achievements.map((title, index) => ({
        id: String(index + 1),
        title: title,
        url: '',
        alt: title,
      })) as Achievement[],
      isGraduated: form.status === 'lulus',
    },
    {
      onSuccess: () => {
        showToast('Anak asuh berhasil ditambahkan', 'success')
        setTimeout(() => {
          router.push({ name: 'dashboard-foster-children' })
        }, 1200)
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal menambahkan anak asuh'), 'error')
      },
    },
  )
}

const handleCancel = () => {
  router.push({ name: 'dashboard-foster-children' })
}

const isSubmitDisabled = computed(() => {
  return (
    !form.name ||
    !form.gender ||
    !form.category ||
    !form.birthPlace ||
    !form.birthDate ||
    !form.address ||
    !form.image ||
    isLoading.value
  )
})
</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <button
          @click="handleCancel"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Kembali ke anak asuh"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Baby :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tambah Anak Asuh Baru</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Lengkapi informasi berikut untuk menambahkan anak asuh baru.
            </p>
          </div>
        </div>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <BaseInput
              id="name"
              v-model="form.name"
              label="Nama Anak Asuh"
              placeholder="Masukkan nama lengkap anak asuh"
              :required="true"
              :error="nameError"
            />
            <div>
              <label
                for="gender"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Jenis Kelamin <span class="text-red-500">*</span>
              </label>
              <select
                id="gender"
                v-model="form.gender"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                :class="[
                  genderError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600',
                  !form.gender
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-white',
                ]"
              >
                <option value="" disabled>Pilih jenis kelamin</option>
                <option v-for="cat in genders" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
              <p v-if="genderError" class="mt-1 text-xs text-red-600">
                {{ genderError }}
              </p>
            </div>
            <div>
              <label
                for="category"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Kategori <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="form.category"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                :class="[
                  categoryError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600',
                  !form.category
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-white',
                ]"
              >
                <option value="" disabled>Pilih kategori anak asuh</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
              <p v-if="categoryError" class="mt-1 text-xs text-red-600">
                {{ categoryError }}
              </p>
            </div>
            <BaseInput
              id="birthPlace"
              v-model="form.birthPlace"
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir anak asuh"
              :required="true"
              :error="birthPlaceError"
            />
            <div>
              <label
                for="birthDate"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Tanggal Lahir <span class="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                :class="[
                  birthDateError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600',
                  !form.birthDate
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-white',
                ]"
              />
              <p v-if="birthDateError" class="mt-1 text-xs text-red-600">
                {{ birthDateError }}
              </p>
            </div>
            <div>
              <label
                for="address"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Alamat <span class="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                v-model="form.address"
                rows="5"
                placeholder="Masukkan alamat lengkap anak asuh"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                :class="addressError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'"
              ></textarea>
              <p v-if="addressError" class="mt-1 text-xs text-red-600">
                {{ addressError }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-200 mb-3">
                Unggah Foto Anak Asuh <span class="text-red-500">*</span>
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
                <p class="text-xs text-gray-400 mt-1">JPG & PNG Max 2 MB</p>
              </div>

              <input
                ref="imageInputRef"
                type="file"
                accept="image/jpeg, image/png"
                class="hidden"
                @change="handleImageChange"
              />
              <p v-if="imageError" class="mt-1 text-xs text-red-600">
                {{ imageError }}
              </p>
            </div>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Catatan Prestasi
              </label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="form.achievementInput"
                  type="text"
                  placeholder="Tambah prestasi"
                  :class="[
                    'w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600',
                    achievementsError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600',
                  ]"
                />
                <BaseButton type="button" variant="primary" size="sm" @click="addAchievement">
                  <Plus :size="16" />
                </BaseButton>
              </div>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li
                  v-for="(item, index) in form.achievements"
                  :key="index"
                  class="flex justify-between items-center dark:text-gray-200"
                >
                  {{ item }}
                  <button
                    type="button"
                    @click="removeAchievement(index)"
                    class="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 :size="16" />
                  </button>
                </li>
              </ol>
              <p v-if="achievementsError" class="mt-1 text-xs text-red-600">
                {{ achievementsError }}
              </p>
            </div>

            <div>
              <p class="text-xs font-medium text-gray-700 dark:text-gray-200 mb-3">
                Unggah Piagam Penghargaan
              </p>
              <div v-if="form.achivements.length" class="space-y-2 mb-3">
                <div
                  v-for="(file, index) in form.achivements"
                  :key="index"
                  class="group flex items-center justify-between border dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <iframe
                      :src="form.achivementPreviews[index]"
                      class="w-20 h-20 rounded border dark:border-gray-500 shrink-0"
                    />
                    <span class="text-sm text-gray-600 dark:text-gray-200 truncate">
                      {{ file.name }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      @click="previewAchivement(file)"
                      class="p-2 bg-white dark:bg-gray-600 rounded-full shadow text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all"
                    >
                      <Eye :size="18" />
                    </button>
                    <button
                      type="button"
                      @click="removeAchivement(index)"
                      class="p-2 bg-white dark:bg-gray-600 rounded-full shadow text-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </div>
                <div class="flex justify-end">
                  <BaseButton
                    size="sm"
                    variant="outline"
                    type="button"
                    @click="triggerachivementInput"
                    class="mt-2"
                  >
                    <Plus :size="16" class="mr-1" /> Tambah Piagam
                  </BaseButton>
                </div>
              </div>
              <div
                v-else
                @click="triggerachivementInput"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Upload :size="32" class="text-gray-400 mb-2" />
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Upload Sertifikat
                </p>
                <p class="text-xs text-gray-400 mt-1">PDF / DOC Max 5 MB</p>
              </div>
              <input
                ref="achivementInputRef"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                class="hidden"
                @change="handleachivementChange"
              />
              <p v-if="achivementError" class="mt-1 text-xs text-red-600">
                {{ achivementError }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status Anak Asuh <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-12">
                <label class="flex items-center gap-2 cursor-pointer dark:text-gray-200 group">
                  <input
                    type="radio"
                    v-model="form.status"
                    value="aktif"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span class="group-hover:text-primary-600 transition-colors">Aktif</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer dark:text-gray-200 group">
                  <input
                    type="radio"
                    v-model="form.status"
                    value="lulus"
                    class="w-4 h-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span class="group-hover:text-primary-600 transition-colors">Lulus</span>
                </label>
              </div>
              <p v-if="statusError" class="mt-1 text-xs text-red-600">
                {{ statusError }}
              </p>
            </div>
          </div>
        </div>
        <div
          class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3"
        >
          <BaseButton type="button" variant="danger" @click="handleCancel" :disabled="isLoading">
            Batal
          </BaseButton>

          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="isSubmitDisabled"
          >
            <template #loading>Menyimpan...</template>
            Tambahkan Anak Asuh
          </BaseButton>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
