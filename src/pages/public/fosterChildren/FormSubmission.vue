<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, Trash2, X, Camera, Upload } from 'lucide-vue-next'
import BaseStepper from '@/components/atoms/BaseStepper.vue'
import BasePublicInput from '@/components/atoms/BasePublicInput.vue'
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

    <form
      class="bg-white rounded-xl border-gray-100 shadow-sm overflow-hidden mx-auto mt-5 w-[90%]"
    >
      <div class="p-6 space-y-5">
        <BaseStepper :currentStep="currentStep" @step-click="handleStepClick" />

        <div v-if="currentStep === 1">
          <form class="p-6 space-y-5">
            <BasePublicInput
              id="applicantName"
              size="sm"
              v-model="form.submitterName"
              label="Nama Pemohon"
              placeholder="Masukkan nama lengkap pemohon"
              :error="errors.submitterName || validationErrors?.submitterName"
              :required="true"
            />
            <BasePublicInput
              id="numberPhone"
              size="sm"
              v-model="form.submitterPhone"
              label="Nomor Telepon"
              placeholder="Masukkan nomor telepon pemohon"
              :error="errors.submitterPhone || validationErrors?.submitterPhone"
              :required="true"
            />
            <div>
              <label
                for="address"
                class="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1"
              >
                Alamat <span class="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                v-model="form.submitterAddress"
                rows="5"
                placeholder="Masukkan alamat lengkap pemohon"
                class="w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal px-4 py-2 text-xs"
                :class="
                  errors.submitterAddress || validationErrors?.submitterAddress
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-gray-200'
                "
              ></textarea>
              <p
                v-if="errors.submitterAddress || validationErrors?.submitterAddress"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.submitterAddress || validationErrors?.submitterAddress }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1">
                Unggah KTP <span class="text-red-500">*</span>
              </p>
              <div
                v-if="form.submitterIdCardPreview"
                class="group flex items-center justify-between border p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="form.submitterIdCardPreview"
                    alt="preview"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <span class="mx-4 text-sm text-gray-500">{{ form.submitterIdCard?.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="showKtpPreview = true"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    title="Pratinjau KTP"
                  >
                    <Eye :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="removeFile('submitterIdCard', 'submitterIdCardPreview')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="Hapus KTP"
                  >
                    <Trash2 :size="18" />
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
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.submitterIdCard || validationErrors?.submitterIdCard
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                "
              >
                <Camera class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-black text-gray-500 uppercase">Click to upload image</p>
                <p class="text-[8px] text-gray-400 mt-1 uppercase">JPG & PNG Max 5 MB</p>
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
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.submitterIdCard || validationErrors?.submitterIdCard }}
              </p>
            </div>
          </form>

          <div class="px-6 pb-4 flex justify-end gap-3">
            <BaseButton type="button" variant="danger" @click="handleBack"> Batal </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
              @click="handleNextStep"
              :disabled="isLoading"
            >
              Selanjutnya
            </BaseButton>
          </div>
        </div>

        <div v-if="currentStep === 2">
          <form class="p-6 space-y-5">
            <BasePublicInput
              id="childname"
              size="sm"
              v-model="form.name"
              label="Nama Anak Asuh"
              placeholder="Masukkan nama lengkap anak asuh"
              :error="errors.name || validationErrors?.name"
              :required="true"
            />

            <div>
              <label
                for="gender"
                class="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1"
              >
                Jenis Kelamin <span class="text-red-500">*</span>
              </label>
              <select
                id="gender"
                v-model="form.gender"
                class="w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 font-medium px-4 py-2 text-xs"
                :class="[
                  errors.gender || validationErrors?.gender
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-gray-200',
                  !form.gender ? 'text-gray-400 font-normal' : 'text-gray-900',
                ]"
              >
                <option value="" disabled>Pilih jenis kelamin</option>
                <option v-for="g in genders" :key="g.value" :value="g.value">
                  {{ g.label }}
                </option>
              </select>
              <p
                v-if="errors.gender || validationErrors?.gender"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.gender || validationErrors?.gender }}
              </p>
            </div>

            <div>
              <label
                for="category"
                class="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1"
              >
                Kategori <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="form.category"
                class="w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 font-medium px-4 py-2 text-xs"
                :class="[
                  errors.category || validationErrors?.category
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-gray-200',
                  !form.category ? 'text-gray-400 font-normal' : 'text-gray-900',
                ]"
              >
                <option value="" disabled>Pilih kategori anak asuh</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
              <p
                v-if="errors.category || validationErrors?.category"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.category || validationErrors?.category }}
              </p>
            </div>

            <BasePublicInput
              id="birthplace"
              size="sm"
              v-model="form.birthPlace"
              label="Tempat Lahir"
              placeholder="Masukkan tempat lahir anak asuh"
              :required="true"
              :error="errors.birthPlace || validationErrors?.birthPlace"
            />

            <div>
              <label
                for="birthdate"
                class="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1"
              >
                Tanggal Lahir <span class="text-red-500">*</span>
              </label>
              <input
                id="birthdate"
                v-model="form.birthDate"
                type="date"
                class="w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 font-medium px-4 py-2 text-xs"
                :class="[
                  errors.birthDate || validationErrors?.birthDate
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-gray-200',
                  !form.birthDate ? 'text-gray-400 font-normal' : 'text-gray-900',
                ]"
              />
              <p
                v-if="errors.birthDate || validationErrors?.birthDate"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.birthDate || validationErrors?.birthDate }}
              </p>
            </div>

            <div>
              <label
                for="address"
                class="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1"
              >
                Alamat <span class="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                v-model="form.address"
                rows="5"
                placeholder="Masukkan alamat lengkap anak asuh"
                class="w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal px-4 py-2 text-xs"
                :class="
                  errors.address || validationErrors?.address
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-gray-200'
                "
              ></textarea>
              <p
                v-if="errors.address || validationErrors?.address"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.address || validationErrors?.address }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1">
                Unggah Foto <span class="text-red-500">*</span>
              </p>
              <div
                v-if="form.profilePicturePreview"
                class="group flex items-center justify-between border p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="form.profilePicturePreview"
                    alt="preview"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <span class="mx-4 text-sm text-gray-500">{{ form.profilePicture?.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="showImagePreview = true"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    title="Pratinjau Foto"
                  >
                    <Eye :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="removeFile('profilePicture', 'profilePicturePreview')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="Hapus Foto"
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
              <div
                v-if="!form.profilePicturePreview"
                @click="triggerInput('imageInput')"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.profilePicture || validationErrors?.profilePicture
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                "
              >
                <Camera class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-black text-gray-500 uppercase">Click to upload image</p>
                <p class="text-[8px] text-gray-400 mt-1 uppercase">JPG & PNG Max 5 MB</p>
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
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.profilePicture || validationErrors?.profilePicture }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1">
                Unggah Kartu Keluarga <span class="text-red-500">*</span>
              </p>
              <div
                v-if="form.familyCardPreview"
                class="group flex items-center justify-between border p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <iframe
                    :src="form.familyCardPreview"
                    alt="preview"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <span class="mx-4 text-sm text-gray-500">{{ form.familyCard?.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="previewPdf(form.familyCard)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    title="Pratinjau Kartu Keluarga"
                  >
                    <Eye :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="removeFile('familyCard', 'familyCardPreview')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="Hapus Kartu Keluarga"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>

              <div
                v-if="!form.familyCardPreview"
                @click="triggerInput('familyCardInput')"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.familyCard || validationErrors?.familyCard
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                "
              >
                <Upload class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-black text-gray-500 uppercase">Click to upload file</p>
                <p class="text-[8px] text-gray-400 mt-1 uppercase">PDF Max 5 MB</p>
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
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.familyCard || validationErrors?.familyCard }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1">
                Unggah SKTM <span class="text-red-500">*</span>
              </p>
              <div
                v-if="form.sktmPreview"
                class="group flex items-center justify-between border p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <iframe
                    :src="form.sktmPreview"
                    alt="preview"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <span class="mx-4 text-sm text-gray-500">{{ form.sktm?.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="previewPdf(form.sktm)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                    title="Pratinjau SKTM"
                  >
                    <Eye :size="18" />
                  </button>
                  <button
                    type="button"
                    @click="removeFile('sktm', 'sktmPreview')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="Hapus SKTM"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>

              <div
                v-if="!form.sktmPreview"
                @click="triggerInput('sktmInput')"
                class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
                :class="
                  errors.sktm || validationErrors?.sktm
                    ? 'border-red-300 bg-red-50 hover:bg-red-50/70'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                "
              >
                <Upload class="text-gray-300 mb-2" :size="32" />
                <p class="text-[10px] font-black text-gray-500 uppercase">Click to upload file</p>
                <p class="text-[8px] text-gray-400 mt-1 uppercase">PDF Max 5 MB</p>
              </div>

              <input
                id="sktmInput"
                type="file"
                accept="application/pdf"
                class="hidden"
                @change="(e) => handleFileChange(e, 'sktm', 'sktmPreview')"
              />
              <p
                v-if="errors.sktm || validationErrors?.sktm"
                class="mt-1 text-[10px] font-bold text-red-500 ml-1"
              >
                {{ errors.sktm || validationErrors?.sktm }}
              </p>
            </div>
          </form>

          <div class="px-6 pb-4 flex justify-end gap-3">
            <BaseButton type="button" variant="white" @click="currentStep = 1" :disabled="isLoading">
              Sebelumnya
            </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
              :loading="isLoading"
              @click="handleSubmit"
            >
              Ajukan Anak Asuh
            </BaseButton>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
