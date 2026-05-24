<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, Trash2, X, Camera, UploadCloud } from 'lucide-vue-next'
import BaseStepper from '@/components/atoms/BaseStepper.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useFosterChildrenCandidateCreate } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateCreate'
import { fosterChildrenCandidateRequestSchema } from '@/schemas/fosterChildrenCandidateRequest.schema'
import { Gender, Category } from '@/types/fosterChildren'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const { showToast } = useToast()
const { createMutation, validationErrors } = useFosterChildrenCandidateCreate()

const currentStep = ref(1)

const form = reactive({
  submitterName: '',
  submitterPhone: '',
  submitterAddress: '',
  submitterIdCard: null as File | null,
  submitterIdCardPreview: null as string | null,
  name: '',
  gender: '' as Gender | '',
  category: '' as Category | '',
  birthPlace: '',
  birthDate: '',
  address: '',
  schoolName: '',
  educationLevel: undefined as number | undefined,
  profilePicture: null as File | null,
  profilePicturePreview: null as string | null,
  familyCard: null as File | null,
  familyCardPreview: null as string | null,
  sktm: null as File | null,
  sktmPreview: null as string | null,
})

const errors = ref<Record<string, string>>({})
const showKtpPreview = ref(false)
const showImagePreview = ref(false)

const isLoading = computed(() => createMutation.isPending.value)

const genders = [
  { label: 'Laki-laki', value: Gender.male },
  { label: 'Perempuan', value: Gender.female },
]

const categories = [
  { label: 'Yatim', value: Category.yatim },
  { label: 'Piatu', value: Category.piatu },
  { label: 'Yatim Piatu', value: Category.yatimPiatu },
]

const educationLevels = [
  { label: 'Kelas 1', value: 1 },
  { label: 'Kelas 2', value: 2 },
  { label: 'Kelas 3', value: 3 },
  { label: 'Kelas 4', value: 4 },
  { label: 'Kelas 5', value: 5 },
  { label: 'Kelas 6', value: 6 },
  { label: 'Kelas 7', value: 7 },
  { label: 'Kelas 8', value: 8 },
  { label: 'Kelas 9', value: 9 },
  { label: 'Kelas 10', value: 10 },
  { label: 'Kelas 11', value: 11 },
  { label: 'Kelas 12', value: 12 },
]

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

const handleBack = () => {
  router.push({ name: 'foster-children' })
}

const handleStepClick = (step: number) => {
  if (step === 2) {
    const step1Result = fosterChildrenCandidateRequestSchema
      .pick({
        submitterName: true,
        submitterPhone: true,
        submitterAddress: true,
        submitterIdCard: true,
      })
      .safeParse(form)

    if (!step1Result.success) {
      errors.value = getZodErrors(step1Result)
      showToast('Mohon lengkapi data pemohon terlebih dahulu', 'error')
      return
    }
  }
  currentStep.value = step
}

const handleNextStep = () => {
  const step1Result = fosterChildrenCandidateRequestSchema
    .pick({
      submitterName: true,
      submitterPhone: true,
      submitterAddress: true,
      submitterIdCard: true,
    })
    .safeParse(form)

  if (!step1Result.success) {
    errors.value = getZodErrors(step1Result)
    showToast('Mohon lengkapi data pemohon dengan benar', 'error')
    return
  }

  currentStep.value = 2
}

const triggerInput = (id: string) => {
  const input = document.getElementById(id) as HTMLInputElement
  input?.click()
}

const handleFileChange = (
  event: Event,
  field: keyof typeof form,
  previewField?: keyof typeof form,
) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validation
  const isImage = ['submitterIdCard', 'profilePicture'].includes(field as string)
  if (isImage) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showToast('Format harus JPG/PNG', 'error')
      return
    }
  } else {
    if (file.type !== 'application/pdf') {
      showToast('Format harus PDF', 'error')
      return
    }
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran maksimal 5MB', 'error')
    return
  }

  ;(form as any)[field] = file
  if (previewField) {
    ;(form as any)[previewField] = URL.createObjectURL(file)
  }
}

const removeFile = (field: keyof typeof form, previewField?: keyof typeof form) => {
  ;(form as any)[field] = null
  if (previewField) {
    ;(form as any)[previewField] = null
  }
}

const previewPdf = (file: File | null) => {
  if (!file) return
  const url = URL.createObjectURL(file)
  window.open(url)
}

const handleSubmit = () => {
  const result = fosterChildrenCandidateRequestSchema.safeParse({
    ...form,
    gender: form.gender || undefined,
    category: form.category || undefined,
    educationLevel: form.educationLevel !== undefined ? Number(form.educationLevel) : undefined,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi data dengan benar', 'error')
    return
  }

  createMutation.mutate(result.data, {
    onSuccess: () => {
      showToast('Pengajuan anak asuh berhasil dikirim!', 'success')
      router.push({ name: 'foster-children' })
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal mengirim pengajuan'), 'error')
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-[Poppins]">
    <div
      class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center gap-4"
    >
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
        @click="handleBack"
      >
        <ArrowLeft :size="28" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-800">Form Pengajuan Anak Asuh</h1>
        <p class="text-sm text-slate-500 mt-1">
          Lengkapi data pemohon dan calon anak asuh dengan benar
        </p>
      </div>
    </div>

    <form
      class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mx-auto mt-6 w-[92%] max-w-5xl"
    >
      <div class="p-6 space-y-5">
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <BaseStepper :currentStep="currentStep" @step-click="handleStepClick" />
        </div>

        <div v-if="currentStep === 1" class="space-y-6">
          <div
            class="bg-linear-to-r from-primary-300 via-green-700 to-emerald-500 rounded-2xl p-6 text-white shadow-md"
          >
            <h2 class="text-2xl font-bold">Data Pemohon</h2>
            <p class="text-sm opacity-90 mt-1">
              Lengkapi informasi pemohon untuk proses pengajuan anak asuh
            </p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-slate-800">Informasi Pemohon</h3>
              <p class="text-sm text-slate-500 mt-1">
                Pastikan data yang dimasukkan sudah benar dan valid
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Nama Pemohon <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.submitterName"
                  type="text"
                  placeholder="Masukkan nama lengkap pemohon"
                  class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p
                  v-if="errors.submitterName || validationErrors?.submitterName"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.submitterName || validationErrors?.submitterName }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Nomor Telepon <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.submitterPhone"
                  type="text"
                  inputmode="numeric"
                  placeholder="Masukkan nomor telepon"
                  class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  @input="form.submitterPhone = form.submitterPhone.replace(/[^0-9]/g, '')"
                />
                <p
                  v-if="errors.submitterPhone || validationErrors?.submitterPhone"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.submitterPhone || validationErrors?.submitterPhone }}
                </p>
              </div>
            </div>

            <div class="mt-5">
              <label for="submitterAddress" class="block text-sm font-medium text-slate-700 mb-2"
                >Alamat Lengkap <span class="text-red-500">*</span></label
              >
              <textarea
                id="submitterAddress"
                v-model="form.submitterAddress"
                rows="5"
                placeholder="Masukkan alamat lengkap pemohon"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                :class="
                  errors.submitterAddress || validationErrors?.submitterAddress
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 bg-white'
                "
              ></textarea>
              <p
                v-if="errors.submitterAddress || validationErrors?.submitterAddress"
                class="mt-2 text-xs text-red-600"
              >
                {{ errors.submitterAddress || validationErrors?.submitterAddress }}
              </p>
            </div>

            <div class="mt-8">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h4 class="text-sm font-semibold text-slate-700">
                    Upload KTP Pemohon <span class="text-red-500">*</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-1">Format JPG/PNG maksimal 5 MB</p>
                </div>
              </div>

              <div
                v-if="form.submitterIdCardPreview"
                class="group mt-2 p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    :src="form.submitterIdCardPreview"
                    alt="preview"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <p class="text-sm font-medium text-slate-700 truncate">
                    {{ form.submitterIdCard?.name }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="showKtpPreview = true"
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Eye :size="16" />
                  </button>
                  <button
                    type="button"
                    @click="removeFile('submitterIdCard', 'submitterIdCardPreview')"
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>

              <div
                v-if="showKtpPreview"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              >
                <div class="relative bg-white rounded-lg p-4 max-w-lg w-full">
                  <button
                    @click="showKtpPreview = false"
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <X :size="20" />
                  </button>
                  <img
                    v-if="form.submitterIdCardPreview"
                    :src="form.submitterIdCardPreview"
                    class="w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
              </div>

              <div
                v-if="!form.submitterIdCardPreview"
                @click="triggerInput('ktpInput')"
                class="relative mt-2 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                :class="
                  errors.submitterIdCard || validationErrors?.submitterIdCard
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                "
              >
                <Camera class="w-8 h-8 mb-3 text-slate-400" />
                <p class="text-sm font-semibold text-slate-700">Klik untuk upload KTP</p>
                <p class="text-xs text-slate-500 mt-2">JPG / PNG Maks. 5 MB</p>
              </div>
              <input
                id="ktpInput"
                type="file"
                accept="image/jpeg, image/png"
                class="hidden"
                @change="(e) => handleFileChange(e, 'submitterIdCard', 'submitterIdCardPreview')"
              />
              <p
                v-if="errors.submitterIdCard || validationErrors?.submitterIdCard"
                class="mt-2 text-xs text-red-600"
              >
                {{ errors.submitterIdCard || validationErrors?.submitterIdCard }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3">
            <BaseButton type="button" variant="danger" @click="handleBack">Batal</BaseButton>
            <BaseButton
              type="button"
              variant="primary"
              @click="handleNextStep"
              :disabled="isLoading"
              >Selanjutnya</BaseButton
            >
          </div>
        </div>

        <div v-if="currentStep === 2" class="space-y-6">
          <div
            class="bg-linear-to-r from-primary-300 via-green-700 to-emerald-500 rounded-2xl p-6 text-white shadow-md"
          >
            <h2 class="text-2xl font-bold">Data Anak Asuh</h2>
            <p class="text-sm opacity-90 mt-1">
              Lengkapi informasi calon anak asuh beserta dokumen pendukung
            </p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-slate-800">Informasi Anak Asuh</h3>
              <p class="text-sm text-slate-500 mt-1">
                Pastikan data anak asuh sesuai dokumen resmi
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Nama Anak Asuh <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Masukkan nama lengkap anak asuh"
                  class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p v-if="errors.name || validationErrors?.name" class="mt-1 text-xs text-red-600">
                  {{ errors.name || validationErrors?.name }}
                </p>
              </div>

              <div>
                <label for="gender" class="block text-sm font-medium text-slate-700 mb-2"
                  >Jenis Kelamin <span class="text-red-500">*</span></label
                >
                <select
                  id="gender"
                  v-model="form.gender"
                  class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  :class="
                    errors.gender || validationErrors?.gender
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 bg-white'
                  "
                >
                  <option value="" disabled>Pilih jenis kelamin</option>
                  <option v-for="g in genders" :key="g.value" :value="g.value">
                    {{ g.label }}
                  </option>
                </select>
                <p
                  v-if="errors.gender || validationErrors?.gender"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.gender || validationErrors?.gender }}
                </p>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-slate-700 mb-2"
                  >Kategori <span class="text-red-500">*</span></label
                >
                <select
                  id="category"
                  v-model="form.category"
                  class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  :class="
                    errors.category || validationErrors?.category
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 bg-white'
                  "
                >
                  <option value="" disabled>Pilih kategori anak asuh</option>
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
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
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Tempat Lahir <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.birthPlace"
                  type="text"
                  placeholder="Masukkan tempat lahir anak asuh"
                  class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  :class="
                    errors.birthPlace || validationErrors?.birthPlace
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300'
                  "
                />
                <p
                  v-if="errors.birthPlace || validationErrors?.birthPlace"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.birthPlace || validationErrors?.birthPlace }}
                </p>
              </div>

              <div>
                <label for="birthdate" class="block text-sm font-medium text-slate-700 mb-2"
                  >Tanggal Lahir <span class="text-red-500">*</span></label
                >
                <input
                  id="birthdate"
                  v-model="form.birthDate"
                  type="date"
                  class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  :class="
                    errors.birthDate || validationErrors?.birthDate
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 bg-white'
                  "
                />
                <p
                  v-if="errors.birthDate || validationErrors?.birthDate"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.birthDate || validationErrors?.birthDate }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Nama Sekolah <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.schoolName"
                  type="text"
                  placeholder="Masukkan nama sekolah"
                  class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p
                  v-if="errors.schoolName || validationErrors?.schoolName"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.schoolName || validationErrors?.schoolName }}
                </p>
              </div>

              <div>
                <label for="educationLevel" class="block text-sm font-medium text-slate-700 mb-2"
                  >Tingkat Pendidikan <span class="text-red-500">*</span></label
                >
                <select
                  id="educationLevel"
                  v-model="form.educationLevel"
                  class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  :class="
                    errors.educationLevel || validationErrors?.educationLevel
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 bg-white'
                  "
                >
                  <option :value="undefined" disabled>Pilih tingkat pendidikan</option>
                  <option v-for="el in educationLevels" :key="el.value" :value="el.value">
                    {{ el.label }}
                  </option>
                </select>
                <p
                  v-if="errors.educationLevel || validationErrors?.educationLevel"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.educationLevel || validationErrors?.educationLevel }}
                </p>
              </div>
            </div>

            <div class="mt-5">
              <label for="childAddress" class="block text-sm font-medium text-slate-700 mb-2"
                >Alamat Lengkap <span class="text-red-500">*</span></label
              >
              <textarea
                id="childAddress"
                v-model="form.address"
                rows="5"
                placeholder="Masukkan alamat lengkap anak asuh"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                :class="
                  errors.address || validationErrors?.address
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 bg-white'
                "
              ></textarea>
              <p
                v-if="errors.address || validationErrors?.address"
                class="mt-2 text-xs text-red-600"
              >
                {{ errors.address || validationErrors?.address }}
              </p>
            </div>

            <div class="mt-8">
              <div class="mb-5">
                <h3 class="text-lg font-semibold text-slate-800">Dokumen Pendukung</h3>
                <p class="text-sm text-slate-500 mt-1">Upload seluruh dokumen yang dibutuhkan</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <!-- Foto -->
                <div class="border border-slate-200 rounded-2xl p-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2"
                    >Upload Foto Anak <span class="text-red-500">*</span></label
                  >
                  <div v-if="form.profilePicturePreview" class="space-y-3">
                    <img
                      :src="form.profilePicturePreview"
                      class="w-full h-48 object-cover rounded-xl"
                    />
                    <div class="flex justify-center items-center gap-2">
                      <button
                        type="button"
                        @click="showImagePreview = true"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye :size="16" />
                      </button>
                      <button
                        type="button"
                        @click="removeFile('profilePicture', 'profilePicturePreview')"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </div>
                  <div
                    v-else
                    @click="triggerInput('imageInput')"
                    class="relative border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                  >
                    <Camera class="w-8 h-8 mb-3 text-slate-400" />
                    <p class="text-sm font-medium text-slate-700">Upload Foto</p>
                    <p class="text-xs text-slate-500 mt-2">JPG / PNG</p>
                  </div>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/jpeg, image/png"
                    class="hidden"
                    @change="(e) => handleFileChange(e, 'profilePicture', 'profilePicturePreview')"
                  />
                  <p
                    v-if="errors.profilePicture || validationErrors?.profilePicture"
                    class="mt-2 text-xs text-red-600"
                  >
                    {{ errors.profilePicture || validationErrors?.profilePicture }}
                  </p>
                </div>

                <!-- Kartu Keluarga -->
                <div class="border border-slate-200 rounded-2xl p-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2"
                    >Upload Kartu Keluarga <span class="text-red-500">*</span></label
                  >
                  <div v-if="form.familyCardPreview" class="space-y-3">
                    <div
                      class="h-48 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center px-4 text-center"
                    >
                      <p class="text-sm font-semibold text-slate-700">
                        {{ form.familyCard?.name }}
                      </p>
                      <p class="text-xs text-slate-500 mt-2">PDF Document</p>
                    </div>
                    <div class="flex justify-center items-center gap-2">
                      <button
                        type="button"
                        @click="previewPdf(form.familyCard)"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye :size="16" />
                      </button>
                      <button
                        type="button"
                        @click="removeFile('familyCard', 'familyCardPreview')"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </div>
                  <div
                    v-else
                    @click="triggerInput('familyCardInput')"
                    class="relative border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                  >
                    <UploadCloud class="w-8 h-8 mb-3 text-slate-400" />
                    <p class="text-sm font-medium text-slate-700">Upload KK</p>
                    <p class="text-xs text-slate-500 mt-2">PDF Maks. 5 MB</p>
                  </div>
                  <input
                    id="familyCardInput"
                    type="file"
                    accept="application/pdf"
                    class="hidden"
                    @change="(e) => handleFileChange(e, 'familyCard', 'familyCardPreview')"
                  />
                  <p
                    v-if="errors.familyCard || validationErrors?.familyCard"
                    class="mt-2 text-xs text-red-600"
                  >
                    {{ errors.familyCard || validationErrors?.familyCard }}
                  </p>
                </div>

                <!-- SKTM -->
                <div class="border border-slate-200 rounded-2xl p-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2"
                    >Upload SKTM <span class="text-red-500">*</span></label
                  >
                  <div v-if="form.sktmPreview" class="space-y-3">
                    <div
                      class="h-48 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center px-4 text-center"
                    >
                      <p class="text-sm font-semibold text-slate-700">{{ form.sktm?.name }}</p>
                      <p class="text-xs text-slate-500 mt-2">PDF Document</p>
                    </div>
                    <div class="flex justify-center items-center gap-2">
                      <button
                        type="button"
                        @click="previewPdf(form.sktm)"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye :size="16" />
                      </button>
                      <button
                        type="button"
                        @click="removeFile('sktm', 'sktmPreview')"
                        class="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </div>
                  <div
                    v-else
                    @click="triggerInput('sktmInput')"
                    class="relative border-2 border-dashed border-slate-300 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                  >
                    <UploadCloud class="w-8 h-8 mb-3 text-slate-400" />
                    <p class="text-sm font-medium text-slate-700">Upload SKTM</p>
                    <p class="text-xs text-slate-500 mt-2">PDF Maks. 5 MB</p>
                  </div>
                  <input
                    id="sktmInput"
                    type="file"
                    accept="application/pdf"
                    class="hidden"
                    @change="(e) => handleFileChange(e, 'sktm', 'sktmPreview')"
                  />
                  <p v-if="errors.sktm || validationErrors?.sktm" class="mt-2 text-xs text-red-600">
                    {{ errors.sktm || validationErrors?.sktm }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Image Preview Modal -->
          <div
            v-if="showImagePreview"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div class="relative bg-white rounded-lg p-4 max-w-lg w-full">
              <button
                @click="showImagePreview = false"
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X :size="20" />
              </button>
              <img
                v-if="form.profilePicturePreview"
                :src="form.profilePicturePreview"
                class="w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3">
            <BaseButton type="button" variant="white" @click="currentStep = 1" :disabled="isLoading"
              >Sebelumnya</BaseButton
            >
            <BaseButton type="button" variant="primary" :loading="isLoading" @click="handleSubmit"
              >Ajukan Anak Asuh</BaseButton
            >
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
