<script setup lang ="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, Trash2, X} from 'lucide-vue-next'
import BaseStepper from '@/components/atoms/BaseStepper.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const handleBack = () => {
  router.push({ name: 'foster-children' })
}

const currentStep = ref(1)

const applicantName = ref('')
const numberPhone = ref('')
const ktp = ref<File | null>(null)
const ktpPreview = ref<string | null>(null)
const showKtpPreview = ref(false)
const childName = ref('')
const gender = ref<'laki-laki' | 'perempuan' | ''>('')
const category = ref<'yatim' | 'piatu' | 'yatim piatu' | ''>('')
const birthplace = ref('')
const birthdate = ref('')
const address = ref('')
const image = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const showImagePreview = ref(false)
const familyCard = ref<File | null>(null)
const familyCardPreview = ref<string | null>(null)
const sktm = ref<File | null>(null)
const sktmPreview = ref<string | null>(null)


const genders = ['laki-laki', 'perempuan']

const categories = ['yatim', 'piatu', 'yatim piatu']

const errors = ref<Record<string, string>>({})

const handleStepClick = (step: number) => {
  currentStep.value = step
}

const ktpInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const familyCardInputRef = ref<HTMLInputElement | null>(null)
const sktmInputRef = ref<HTMLInputElement | null>(null)
const triggerInput = (refInput: HTMLInputElement | null) => {
  refInput?.click()
}
const handleSingleFileChange = (
  event: Event,
  type: 'ktp' | 'image' | 'familyCard' | 'sktm'
) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const isImage = ['ktp', 'image'].includes(type)

  if (isImage) {
    const allowedTypes = ['image/jpeg', 'image/png']

    if (!allowedTypes.includes(file.type)) {
      errors.value[type] = 'Format harus JPG/PNG'
      return
    }
  } else {
    if (file.type !== 'application/pdf') {
      errors.value[type] = 'Format harus PDF'
      return
    }
  }

  if (file.size > 5 * 1024 * 1024) {
    errors.value[type] = 'Ukuran maksimal 5MB'
    return
  }

  if (type === 'ktp') {
    ktp.value = file
    ktpPreview.value = URL.createObjectURL(file)
  }

  if (type === 'image') {
    image.value = file
    imagePreview.value = URL.createObjectURL(file)
  }

  if (type === 'familyCard') {
    familyCard.value = file
    familyCardPreview.value = URL.createObjectURL(file)
  }

  if (type === 'sktm') {
    sktm.value = file
    sktmPreview.value = URL.createObjectURL(file)
  }
}
const removeImage = () => {
  ktp.value = null
  ktpPreview.value = null
  if (ktpInputRef.value) ktpInputRef.value.value = ''
  image.value = null
  imagePreview.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
  familyCard.value = null
  familyCardPreview.value = null
  if (familyCardInputRef.value) familyCardInputRef.value.value = ''
  sktm.value = null
  sktmPreview.value = null
  if (sktmInputRef.value) sktmInputRef.value.value = ''
}
const previewImage = (type: 'ktp' | 'image') => {
  if (type === 'ktp') {
    showKtpPreview.value = true
  }

  if (type === 'image') {
    showImagePreview.value = true
  }
}
const previewPdf = (file: File | null) => {
  if (!file) return

  const url = URL.createObjectURL(file)
  window.open(url)
}
const closeImagePreview = () => {
  showKtpPreview.value = false
  showImagePreview.value = false
}

</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="sticky top-0 z-40 bg-white px-6 py-4 flex items-center gap-4 font-[Poppins]">
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
        @click="handleBack"
      >
        <ArrowLeft :size="28" />
      </button>

      <!-- Title -->
      <h1 class="text-lg md:text-xl font-bold text-color-primary-500)] line-clamp-1">
        Form Pengajuan Anak Asuh
      </h1>
    </div>

    <form class="bg-white rounded-xl border-gray-100 shadow-sm overflow-hidden mx-auto mt-5 w-[90%]">
      <div class="p-6 space-y-5">
        <BaseStepper :currentStep="currentStep" @step-click="handleStepClick" />

        <div v-if="currentStep === 1">
          <form class="p-6 space-y-5">
            <BaseInput id="applicantName" size="sm" v-model="applicantName" label="Nama Pemohon" placeholder="Masukkan nama lengkap pemohon" :required="true"/>
            <BaseInput id="numberPhone" size="sm" v-model="numberPhone" label="Nomor Telepon" placeholder="Masukkan nomor telepon pemohon" :required="true"/>
            <div>
              <label for="address" class="block text-xs font-medium text-gray-700 mb-1">
                Alamat <span class="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                v-model="address"
                rows="5"
                placeholder="Masukkan alamat lengkap pemohon"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="
                  errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-xs text-red-600">
                {{  errors.address }}
              </p>
            </div>
            <div>
            <p class="text-xs font-poppins text-gray-700 mb-3">
                Unggah KTP <span class="text-red-500">*</span>
            </p>
            <div v-if="ktpPreview"
                  class="group flex items-center justify-between border p-3 rounded-lg">
                  <div class="flex items-center gap-3">
                    <img :src="ktpPreview" alt="preview" class="w-20 h-20 object-cover rounded" />
                    <span class="mx-4 text-sm text-gray-500">{{ ktp?.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button"
                      @click="previewImage('ktp')"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                      title="Pratinjau KTP"
                    >
                      <Eye :size="18" />
                    </button>
                    <button type="button"
                      @click="removeImage"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                      title="Hapus KTP"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
            </div>
            <div
                v-if="showKtpPreview"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div class="relative bg-white rounded-lg p-4 max-w-lg w-full">
                <button
                  @click="closeImagePreview"
                  class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                <X :size="20" />
                </button>

                <img
                  v-if="ktpPreview"
                  :src="ktpPreview"
                  class="w-full max-h-[70vh] object-contain rounded"
                />

              </div>
            </div>
            <div
              v-if="!ktpPreview"
              @click="triggerInput(ktpInputRef)"
              class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
              :class="
                errors.ktp
                  ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              "
            >
              <p class="text-sm font-medium text-gray-600">Click to upload image</p>
              <p class="text-xs text-gray-400 mt-1">JPG & PNG Max 5 MB</p>
            </div>

            <input
              ref="ktpInputRef"
              type="file"
              accept="image/jpeg, image/png"
              class="hidden"
              @change="(e) => handleSingleFileChange(e, 'ktp') "
            />
            <p v-if="errors.ktp" class="mt-1 text-xs text-red-600">
              {{  errors.ktp }}
            </p>
            </div>
          </form>

        <div class="px-6 pb-4 flex justify-end gap-3">
            <BaseButton
              type="button"
              variant="danger"
              @click="handleBack"
            >
              Batal
            </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
              @click="currentStep = 2"
            >
              Selanjutnya
            </BaseButton>
          </div>

        </div>

        <div v-if="currentStep === 2">
          <form class="p-6 space-y-5">
            <BaseInput id="childname" size="sm" v-model="childName" label="Nama Anak Asuh" placeholder="Masukkan nama lengkap anak asuh" :required="true"/>

            <div>
              <label for="gender" class="block text-xs font-poppins text-gray-700 mb-1">
                Jenis Kelamin <span class="text-red-500">*</span>
              </label>
              <select id="gender" v-model="gender"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="[
                  errors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
                  !gender ? 'text-gray-500' : 'text-gray-700'
                  ]">
                <option value="" disabled>Pilih jenis kelamin</option>
                <option v-for="cat in genders" :key="cat" :value="cat">
                  {{  cat.charAt(0).toUpperCase() + cat.slice(1)  }}
                </option>
              </select>
              <p v-if="errors.gender" class="mt-1 text-xs text-red-600">
                {{  errors.gender }}
              </p>
            </div>

            <div>
              <label for="category" class="block text-xs font-poppins text-gray-700 mb-1">
                Kategori <span class="text-red-500">*</span>
              </label>
              <select id="category" v-model="category"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                :class="[
                  errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
                  !category ? 'text-gray-500' : 'text-gray-700'
                  ]">
                <option value="" disabled>Pilih kategori anak asuh</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{  cat.charAt(0).toUpperCase() + cat.slice(1)  }}
                </option>
              </select>
              <p v-if="errors.category" class="mt-1 text-xs text-red-600">
                {{  errors.category }}
              </p>
            </div>

            <BaseInput id="birthplace" size="sm" v-model="birthplace" label="Tempat Lahir" placeholder="Masukkan tempat lahir anak asuh" :required="true" :error="errors.birthplace" />

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
                  !birthdate ? 'text-gray-500' : 'text-gray-700'
                ]"
              />
              <p v-if="errors.birth_date" class="mt-1 text-xs text-red-600">
                {{  errors.birth_date }}
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
                :class="
                  errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-xs text-red-600">
                {{  errors.address }}
              </p>
            </div>

            <div>
            <p class="text-xs font-poppins text-gray-700 mb-3">
                Unggah Foto <span class="text-red-500">*</span>
            </p>
            <div v-if="imagePreview"
                  class="group flex items-center justify-between border p-3 rounded-lg">
                  <div class="flex items-center gap-3">
                    <img :src="imagePreview" alt="preview" class="w-20 h-20 object-cover rounded" />
                    <span class="mx-4 text-sm text-gray-500">{{ image?.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button"
                      @click="previewImage('image')"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                      title="Pratinjau Foto"
                    >
                      <Eye :size="18" />
                    </button>
                    <button type="button"
                      @click="removeImage"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                      title="Hapus KTP"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
            </div>
            <div
                v-if="showImagePreview"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
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
              @click="triggerInput(imageInputRef)"
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
              @change="(e) => handleSingleFileChange(e, 'image')"
            />
            <p v-if="errors.image" class="mt-1 text-xs text-red-600">
              {{  errors.image }}
            </p>
            </div>

            <div>
            <p class="text-xs font-poppins text-gray-700 mb-3">
                Unggah Kartu Keluarga <span class="text-red-500">*</span>
            </p>
            <div v-if="familyCardPreview"
                  class="group flex items-center justify-between border p-3 rounded-lg">
                  <div class="flex items-center gap-3">
                    <iframe :src="familyCardPreview" alt="preview" class="w-20 h-20 object-cover rounded" />
                    <span class="mx-4 text-sm text-gray-500">{{ familyCard?.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button"
                      @click="previewPdf(familyCard)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                      title="Pratinjau Kartu Keluarga"
                    >
                      <Eye :size="18" />
                    </button>
                    <button type="button"
                      @click="removeImage"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                      title="Hapus Kartu Keluarga"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
            </div>

            <div
              v-if="!familyCardPreview"
              @click="triggerInput(familyCardInputRef)"
              class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
              :class="
                errors.familyCard
                  ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              "
            >
              <p class="text-sm font-medium text-gray-600">Click to upload file</p>
              <p class="text-xs text-gray-400 mt-1">PDF Max 5 MB</p>
            </div>

            <input
              ref="familyCardInputRef"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="(e) => handleSingleFileChange(e, 'familyCard')"
            />
            <p v-if="errors.familyCard" class="mt-1 text-xs text-red-600">
              {{  errors.familyCard }}
            </p>
            </div>

            <div>
            <p class="text-xs font-poppins text-gray-700 mb-3">
                Unggah SKTM <span class="text-red-500">*</span>
            </p>
            <div v-if="sktmPreview"
                  class="group flex items-center justify-between border p-3 rounded-lg">
                  <div class="flex items-center gap-3">
                    <iframe :src="sktmPreview" alt="preview" class="w-20 h-20 object-cover rounded" />
                    <span class="mx-4 text-sm text-gray-500">{{ sktm?.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button"
                      @click="previewPdf(sktm)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                      title="Pratinjau SKTM"
                    >
                      <Eye :size="18" />
                    </button>
                    <button type="button"
                      @click="removeImage"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                      title="Hapus SKTM"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
            </div>

            <div
              v-if="!sktmPreview"
              @click="triggerInput(sktmInputRef)"
              class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
              :class="
                errors.sktm
                  ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              "
            >
              <p class="text-sm font-medium text-gray-600">Click to upload file</p>
              <p class="text-xs text-gray-400 mt-1">PDF Max 5 MB</p>
            </div>

            <input
              ref="sktmInputRef"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="(e) => handleSingleFileChange(e, 'sktm')"
            />
            <p v-if="errors.sktm" class="mt-1 text-xs text-red-600">
              {{  errors.sktm }}
            </p>
            </div>
          </form>

        <div class="px-6 pb-4 flex justify-end gap-3">
            <BaseButton
              type="button"
              variant="white"
              @click="currentStep = 1"
            >
              Sebelumnya
            </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
            >
              Ajukan Anak Asuh
            </BaseButton>
          </div>

        </div>
      </div>
    </form>
  </div>
</template>
