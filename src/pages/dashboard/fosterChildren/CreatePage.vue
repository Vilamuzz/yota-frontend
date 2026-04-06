<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useChildCreate } from '@/composables/fosterChildren/useFosterChildrenCreate'
import { createChildSchema } from '@/schemas/fosterChildren.schema'
import { getZodErrors } from '@/utils/zodError'
import { ArrowLeft, PersonStanding, Trash2, Eye, X, Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const { createMutation, createError } = useChildCreate()

const name = ref('')
const gender = ref<'laki-laki' | 'perempuan' | ''>('')
const category = ref<'yatim' | 'piatu' | 'yatim-piatu' | ''>('')
const birthplace = ref('')
const birthdate = ref('')
const address = ref('')
const image = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const showImagePreview = ref(false)
const certificates = ref<File[]>([])
const status = ref<boolean | null>(null)
const errors = ref<Record<string, string>>({})

const genders = ['laki-laki', 'perempuan']

const categories = ['yatim', 'piatu', 'yatim piatu']

const isLoading = computed(() => createMutation.isPending.value)
const isSuccess = computed(() => createMutation.isSuccess.value)

const imageInputRef = ref<HTMLInputElement | null>(null)

const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const handleImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    errors.value = { ...errors.value, image: 'Format gambar tidak valid. Hanya JPG dan PNG.' }
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    errors.value = { ...errors.value, image: 'Ukuran gambar terlalu besar. Maksimal 5MB.' }
    return
  }

  const { image: _, ...rest } = errors.value
  void _
  errors.value = rest
  image.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  image.value = null
  imagePreview.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

const previewImage = () => {
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
}

const certificateInputRef = ref<HTMLInputElement | null>(null)

const triggerCertificateInput = () => {
  certificateInputRef.value?.click()
}

const handleCertificateChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  for (const file of Array.from(files)) {
    if (!allowedTypes.includes(file.type)) {
      errors.value = {
        ...errors.value,
        certificate: 'Format sertifikat harus PDF atau DOC',
      }
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.value = {
        ...errors.value,
        certificate: 'Ukuran maksimal file 5MB',
      }
      return
    }

    certificates.value.push(file)
  }
}

const removeCertificate = (index: number) => {
  certificates.value.splice(index, 1)
}

const previewCertificate = (file: File) => {
  const url = URL.createObjectURL(file)
  window.open(url)
}

const validate = () => {
  const result = createChildSchema.safeParse({
    name: name.value,
    gender: gender.value,
    category: category.value,
    birthplace: birthplace.value,
    birth_date: birthdate.value,
    address: address.value,
    image: image.value,
    certificates: certificates.value,
    status: status.value,
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])

  const imageError: Record<string, string> = image.value
    ? {}
    : { image: 'Foto anak asuh wajib diunggah' }
  const certificateError: Record<string, string> =
    certificates.value.length > 0 ? {} : { certificate: '' }

  errors.value = { ...zodErrors, ...imageError, ...certificateError }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  await createMutation.mutateAsync({
    name: name.value.trim(),
    gender: gender.value as 'laki-laki' | 'perempuan',
    category: category.value as 'yatim' | 'piatu' | 'yatim-piatu',
    birthplace: birthplace.value.trim(),
    birth_date: birthdate.value,
    address: address.value.trim(),
    image: image.value!,
    certificates: certificates.value!,
    status: status.value!,
  })

  if (createMutation.isSuccess.value) {
    setTimeout(() => {
      router.push({ name: 'dashboard-foster-children' })
    }, 1200)
  }
}

const handleCancel = () => {
  router.push({ name: 'dashboard-foster-children' })
}

const isSubmitDisabled = computed(() => {
  return (
    !name.value ||
    !gender.value ||
    !category.value ||
    !birthplace.value ||
    !birthdate.value ||
    !address.value ||
    !image.value ||
    status.value === null ||
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
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          title="Kembali ke anak asuh"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 rounded-lg">
            <PersonStanding :size="24" class="text-primary-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Tambah Anak Asuh Baru</h2>
            <p class="text-sm text-gray-500">
              Lengkapi informasi berikut untuk menambahkan anak asuh baru.
            </p>
          </div>
        </div>
      </div>

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
          Anak Asuh berhasil ditambahkan
        </div>
      </transition>

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

      <form
        @submit.prevent="handleSubmit"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <BaseInput
              id="name"
              v-model="name"
              label="Nama Anak Asuh"
              placeholder="Masukkan nama lengkap anak asuh"
              :required="true"
              :error="errors.name"
            />
            <div>
              <label for="gender" class="block text-xs font-poppins text-gray-700 mb-1">
                Jenis Kelamin <span class="text-red-500">*</span>
              </label>
              <select
                id="gender"
                v-model="gender"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="[
                  errors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
                  !gender ? 'text-gray-500' : 'text-gray-700',
                ]"
              >
                <option value="" disabled>Pilih jenis kelamin</option>
                <option v-for="cat in genders" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
              <p v-if="errors.gender" class="mt-1 text-xs text-red-600">
                {{ errors.gender }}
              </p>
            </div>
            <div>
              <label for="category" class="block text-xs font-poppins text-gray-700 mb-1">
                Kategori <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="category"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="[
                  errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
                  !category ? 'text-gray-500' : 'text-gray-700',
                ]"
              >
                <option value="" disabled>Pilih kategori anak asuh</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
              <p v-if="errors.category" class="mt-1 text-xs text-red-600">
                {{ errors.category }}
              </p>
            </div>
            <BaseInput
              id="birthplace"
              v-model="birthplace"
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir anak asuh"
              :required="true"
              :error="errors.birthplace"
            />
            <div>
              <label for="birthdate" class="block text-xs font-poppins text-gray-700 mb-1">
                Tanggal Lahir <span class="text-red-500">*</span>
              </label>
              <input
                id="birthdate"
                v-model="birthdate"
                type="date"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="[
                  errors.birthdate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
                  !birthdate ? 'text-gray-500' : 'text-gray-700',
                ]"
              />
              <p v-if="errors.birth_date" class="mt-1 text-xs text-red-600">
                {{ errors.birth_date }}
              </p>
            </div>
            <div>
              <label for="address" class="block text-xs font-medium text-gray-700 mb-1">
                Alamat <span class="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                v-model="address"
                rows="5"
                placeholder="Masukkan alamat lengkap anak asuh"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-xs text-red-600">
                {{ errors.address }}
              </p>
            </div>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <p class="text-xs font-poppins text-gray-700 mb-3">
                Unggah Foto Anak Asuh <span class="text-red-500">*</span>
              </p>
              <div
                v-if="imagePreview"
                class="group flex items-center justify-between border p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <img :src="imagePreview" alt="preview" class="w-20 h-20 object-cover rounded" />
                  <span class="mx-4 text-sm text-gray-500">{{ image?.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="previewImage"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    title="Pratinjau Gambar"
                  >
                    <Eye :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="removeImage"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="Hapus Gambar"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>
              <div
                v-if="showImagePreview"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              >
                <div class="relative bg-white rounded-lg p-4 max-w-lg w-full">
                  <button
                    @click="closeImagePreview"
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <X :size="20" />
                  </button>

                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    class="w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
              </div>
              <div
                v-if="!imagePreview"
                @click="triggerImageInput"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.image
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                "
              >
                <p class="text-sm font-medium text-gray-600">Click to upload image</p>
                <p class="text-xs text-gray-400 mt-1">JPG & PNG Max 5 MB</p>
              </div>

              <input
                ref="imageInputRef"
                type="file"
                accept="image/jpeg, image/png"
                class="hidden"
                @change="handleImageChange"
              />
              <p v-if="errors.image" class="mt-1 text-xs text-red-600">
                {{ errors.image }}
              </p>
            </div>

            <div>
              <p class="text-xs font-poppins text-gray-700 mb-3">Unggah Piagam Penghargaan</p>
              <div v-if="certificates.length" class="space-y-2 mb-3">
                <div
                  v-for="(file, index) in certificates"
                  :key="index"
                  class="flex items-center justify-between p-3 border rounded-lg bg-white text-sm"
                >
                  <div class="flex items-center gap-3 truncate">
                    <span class="text-gray-600 truncate">{{ file.name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="previewCertificate(file)"
                      class="text-gray-500 hover:text-gray-700"
                    >
                      <Eye :size="18" />
                    </button>
                    <button
                      type="button"
                      @click="removeCertificate(index)"
                      class="text-red-500 hover:text-red-600"
                    >
                      <Trash2 :size="18" />
                    </button>
                    <BaseButton
                      v-if="index === certificates.length - 1"
                      size="sm"
                      variant="primary"
                      @click="triggerCertificateInput"
                    >
                      <Plus :size="16" />
                    </BaseButton>
                  </div>
                </div>
              </div>
              <div
                v-else
                @click="triggerCertificateInput"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150 border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                <p class="text-sm font-medium text-gray-600">Upload Sertifikat</p>
                <p class="text-xs text-gray-400 mt-1">PDF / DOC Max 5 MB</p>
              </div>
              <input
                ref="certificateInputRef"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                class="hidden"
                @change="handleCertificateChange"
              />
              <p v-if="errors.certificate" class="mt-1 text-xs text-red-600">
                {{ errors.certificate }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-poppins text-gray-700 mb-1">
                Status Anak Asuh <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-12">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="status"
                    :value="true"
                    class="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  Aktif
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="status"
                    :value="false"
                    class="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  Lulus
                </label>
              </div>
              <p v-if="errors.status" class="mt-1 text-xs text-red-600">
                {{ errors.status }}
              </p>
            </div>
          </div>
        </div>
        <div class="px-6 pb-4 flex justify-end gap-3">
          <BaseButton type="button" variant="danger" @click="handleCancel" :disabled="isLoading">
            Batal
          </BaseButton>

          <BaseButton
            type="button"
            variant="primary"
            :loading="isLoading"
            :disabled="isSubmitDisabled"
            class="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template #loading>Tambah..</template>
            Tambahkan Anak Asuh
          </BaseButton>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
