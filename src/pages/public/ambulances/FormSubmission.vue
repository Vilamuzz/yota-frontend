<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Phone } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import { useAmbulanceRequestService } from '@/composables/ambulanceService/useAmbulanceRequestService'
import { AmbulanceServiceCategory, ambulanceServiceCategoryOptions } from '@/types/ambulanceHistory'

const router = useRouter()
const { showToast } = useToast()

const form = reactive({
  submitterName: '',
  submitterPhone: '',
  submitterIdCard: null as unknown as File,
  patientName: '',
  patientAddress: '',
  patientAge: '' as unknown as number,
  isInfectious: false,
  disease: '',
  isAbleToSit: false,
  pickupDate: '',
  pickupTime: '',
  destination: '',
  note: '',
  serviceCategory: '' as unknown as AmbulanceServiceCategory,
})

const isMortuary = computed(
  () => form.serviceCategory === AmbulanceServiceCategory.MORTUARY_SERVICE,
)

const isSocial = computed(() => form.serviceCategory === AmbulanceServiceCategory.SOCIAL_SERVICE)

const isEmergency = computed(
  () => form.serviceCategory === AmbulanceServiceCategory.EMERGENCY_SERVICE,
)

const errors = ref<Record<string, string>>({})

const { createMutation } = useAmbulanceRequestService()

const isLoading = computed(() => createMutation.isPending.value)

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
  router.push({ name: 'ambulance' })
}

const validate = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.submitterName.trim()) newErrors.submitterName = 'Nama pengaju wajib diisi'
  if (!form.submitterPhone.trim()) {
    newErrors.submitterPhone = 'Nomor telepon pengaju wajib diisi'
  } else if (!/^[0-9]{8,15}$/.test(form.submitterPhone)) {
    newErrors.submitterPhone = 'Nomor telepon tidak valid'
  }
  if (!form.submitterIdCard) newErrors.submitterIdCard = 'Unggah foto KTP pengaju wajib diisi'
  if (!isEmergency.value && !form.patientName.trim()) {
    newErrors.patientName = isSocial.value
      ? 'Nama lembaga wajib diisi'
      : isMortuary.value
        ? 'Nama almarhum wajib diisi'
        : 'Nama pasien wajib diisi'
  }
  if (isEmergency.value && !form.patientAddress.trim()) {
    newErrors.patientAddress = 'Alamat penjemputan wajib diisi'
  }
  if (!isEmergency.value && !form.pickupDate) {
    newErrors.pickupDate = isSocial.value
      ? 'Tanggal acara wajib diisi'
      : 'Tanggal penjemputan wajib diisi'
  }
  if (!isEmergency.value && !form.pickupTime) {
    newErrors.pickupTime = isSocial.value
      ? 'Waktu acara wajib diisi'
      : 'Waktu penjemputan wajib diisi'
  }
  if (!isSocial.value && !isEmergency.value && !form.destination.trim()) {
    newErrors.destination = 'Tujuan wajib diisi'
  }
  if (isSocial.value && !form.note.trim()) {
    newErrors.note = 'Detail acara wajib diisi untuk menjelaskan acara'
  }
  if (!form.serviceCategory) newErrors.serviceCategory = 'Kategori layanan wajib diisi'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = () => {
  if (!validate()) {
    showToast('Mohon lengkapi data dengan benar', 'error')
    return
  }

  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  const payload = {
    ...form,
    patientAge:
      isSocial.value || isEmergency.value
        ? undefined
        : form.patientAge
          ? Number(form.patientAge)
          : undefined,
    destination: isSocial.value
      ? 'Layanan Sosial / Acara'
      : isEmergency.value
        ? 'Layanan Darurat'
        : form.destination,
    pickupDate: isEmergency.value ? currentDate : form.pickupDate,
    pickupTime: isEmergency.value ? currentTime : form.pickupTime,
  }

  createMutation.mutate(payload, {
    onSuccess: () => {
      showToast('Permintaan ambulans berhasil dikirim!', 'success')
      router.push({ name: 'ambulance' })
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal mengirim permintaan ambulans'), 'error')
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-[Poppins]">
    <!-- Header -->
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
        <h1 class="text-xl font-bold text-slate-800">Form Permintaan Ambulans</h1>
        <p class="text-sm text-slate-500 mt-1">
          Lengkapi data pengaju, informasi pasien, dan detail penjemputan dengan benar
        </p>
      </div>
    </div>

    <form
      class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mx-auto mt-6 w-[92%] max-w-5xl mb-10"
      @submit.prevent="handleSubmit"
    >
      <div class="p-6 space-y-5">
        <!-- Section Header -->
        <div
          class="bg-linear-to-r from-red-500 via-rose-600 to-orange-500 rounded-2xl p-6 text-white shadow-md"
        >
          <h2 class="text-2xl font-bold">Data Permintaan Ambulans</h2>
          <p class="text-sm opacity-90 mt-1">
            Lengkapi informasi pengaju, pasien, dan detail penjemputan
          </p>
        </div>

        <!-- Form Body -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <!-- ── Submitter Info ── -->
          <div class="mb-2">
            <h3 class="text-lg font-semibold text-slate-800">Informasi Pengaju</h3>
            <p class="text-sm text-slate-500 mt-1">Data diri orang yang mengajukan permintaan</p>
          </div>

          <!-- Submitter Name & Phone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Nama Pengaju <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.submitterName"
                type="text"
                placeholder="Masukkan nama lengkap pengaju"
                class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="errors.submitterName ? 'border-red-300 bg-red-50' : 'border-slate-300'"
              />
              <p v-if="errors.submitterName" class="mt-1 text-xs text-red-600">
                {{ errors.submitterName }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Nomor Telepon <span class="text-red-500">*</span></label
              >
              <div class="relative flex items-center">
                <!-- Prefix Container -->
                <div
                  class="absolute left-4 flex items-center gap-1.5 text-slate-400 select-none pointer-events-none"
                >
                  <Phone :size="16" />
                  <span class="text-sm font-medium border-r border-slate-300 pr-1.5">+62</span>
                </div>
                <!-- Input field -->
                <input
                  v-model="form.submitterPhone"
                  type="text"
                  inputmode="numeric"
                  placeholder="8123456789"
                  class="w-full pl-20 pr-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  :class="errors.submitterPhone ? 'border-red-300 bg-red-50' : 'border-slate-300'"
                  @input="
                    form.submitterPhone = form.submitterPhone
                      .replace(/^(\+62|62|0)/, '')
                      .replace(/[^0-9]/g, '')
                  "
                />
              </div>
              <p v-if="errors.submitterPhone" class="mt-1 text-xs text-red-600">
                {{ errors.submitterPhone }}
              </p>
            </div>
          </div>

          <!-- Submitter ID Card -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Unggah Foto KTP Pengaju <span class="text-red-500">*</span></label
            >
            <input
              type="file"
              accept="image/*"
              class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
              :class="errors.submitterIdCard ? 'border-red-300 bg-red-50' : 'border-slate-300'"
              @change="
                (e) => (form.submitterIdCard = (e.target as HTMLInputElement).files?.[0] as File)
              "
            />
            <p v-if="errors.submitterIdCard" class="mt-1 text-xs text-red-600">
              {{ errors.submitterIdCard }}
            </p>
          </div>

          <!-- Kategori Layanan -->
          <div class="border-t border-slate-100 pt-4">
            <label for="serviceCategory" class="block text-sm font-medium text-slate-700 mb-2"
              >Kategori Layanan <span class="text-red-500">*</span></label
            >
            <select
              id="serviceCategory"
              v-model="form.serviceCategory"
              class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              :class="errors.serviceCategory ? 'border-red-300 bg-red-50' : 'border-slate-300'"
            >
              <option value="" disabled>Pilih kategori layanan</option>
              <option
                v-for="cat in ambulanceServiceCategoryOptions"
                :key="cat.value"
                :value="cat.value"
              >
                {{ cat.label }}
              </option>
            </select>
            <p v-if="errors.serviceCategory" class="mt-1 text-xs text-red-600">
              {{ errors.serviceCategory }}
            </p>
          </div>

          <!-- ── Patient Info ── -->
          <div class="border-t border-slate-100 pt-4">
            <h3 class="text-lg font-semibold text-slate-800">
              {{
                isSocial
                  ? 'Informasi Lembaga'
                  : isMortuary
                    ? 'Informasi Almarhum'
                    : 'Informasi Pasien'
              }}
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              {{
                isSocial
                  ? 'Data diri lembaga yang membutuhkan ambulans'
                  : isMortuary
                    ? 'Data diri almarhum yang membutuhkan ambulans'
                    : 'Data diri pasien yang membutuhkan ambulans'
              }}
            </p>
            <div
              :class="['grid grid-cols-1 gap-5', !isSocial && !isEmergency ? 'md:grid-cols-2' : '']"
            >
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >{{ isSocial ? 'Nama Lembaga' : isMortuary ? 'Nama Almarhum' : 'Nama Pasien' }}
                  <span v-if="!isEmergency" class="text-red-500">*</span></label
                >
                <input
                  v-model="form.patientName"
                  type="text"
                  :placeholder="
                    isSocial
                      ? 'Masukkan nama lengkap lembaga'
                      : isMortuary
                        ? 'Masukkan nama lengkap almarhum'
                        : isEmergency
                          ? 'Masukkan nama lengkap pasien (opsional)'
                          : 'Masukkan nama lengkap pasien'
                  "
                  class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  :class="errors.patientName ? 'border-red-300 bg-red-50' : 'border-slate-300'"
                />
                <p v-if="errors.patientName" class="mt-1 text-xs text-red-600">
                  {{ errors.patientName }}
                </p>
              </div>

              <div v-if="!isSocial && !isEmergency">
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  {{ isMortuary ? 'Usia Almarhum' : 'Usia Pasien' }}
                </label>
                <input
                  v-model="form.patientAge"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  max="150"
                  :placeholder="isMortuary ? 'Masukkan usia almarhum' : 'Masukkan usia pasien'"
                  class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{
                isSocial
                  ? 'Alamat Acara'
                  : isEmergency
                    ? 'Alamat Penjemputan'
                    : isMortuary
                      ? 'Alamat Almarhum'
                      : 'Alamat Pasien'
              }}
              <span v-if="isEmergency" class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.patientAddress"
              rows="3"
              :placeholder="
                isSocial
                  ? 'Masukkan alamat lengkap acara'
                  : isEmergency
                    ? 'Masukkan alamat lengkap penjemputan'
                    : isMortuary
                      ? 'Masukkan alamat lengkap almarhum'
                      : 'Masukkan alamat lengkap pasien'
              "
              class="w-full px-4 py-3 text-sm border rounded-xl bg-white transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              :class="errors.patientAddress ? 'border-red-300 bg-red-50' : 'border-slate-300'"
            ></textarea>
            <p v-if="errors.patientAddress" class="mt-1 text-xs text-red-600">
              {{ errors.patientAddress }}
            </p>
          </div>

          <div v-if="!isSocial && !isEmergency">
            <label class="block text-sm font-medium text-slate-700 mb-2">Penyakit / Kondisi</label>
            <input
              v-model="form.disease"
              type="text"
              :placeholder="
                isMortuary
                  ? 'Masukkan riwayat penyakit almarhum (opsional)'
                  : 'Masukkan penyakit atau kondisi pasien (opsional)'
              "
              class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div v-if="!isSocial && !isEmergency" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
              <input
                id="isInfectious"
                v-model="form.isInfectious"
                type="checkbox"
                class="w-4 h-4 rounded accent-rose-500 cursor-pointer"
              />
              <label for="isInfectious" class="text-sm font-medium text-slate-700 cursor-pointer">
                {{
                  isMortuary
                    ? 'Almarhum memiliki riwayat penyakit menular'
                    : 'Pasien memiliki penyakit menular'
                }}
              </label>
            </div>

            <div
              v-if="!isMortuary"
              class="flex items-center gap-3 p-4 border border-slate-200 rounded-xl"
            >
              <input
                id="isAbleToSit"
                v-model="form.isAbleToSit"
                type="checkbox"
                class="w-4 h-4 rounded accent-rose-500 cursor-pointer"
              />
              <label for="isAbleToSit" class="text-sm font-medium text-slate-700 cursor-pointer">
                Pasien dapat duduk sendiri
              </label>
            </div>
          </div>

          <div v-if="!isEmergency" class="border-t border-slate-100 pt-4">
            <h3 class="text-lg font-semibold text-slate-800">
              {{ isSocial ? 'Detail Acara' : 'Detail Penjemputan' }}
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              {{
                isSocial
                  ? 'Informasi waktu dan lokasi acara'
                  : 'Informasi waktu dan tujuan ambulans'
              }}
            </p>
          </div>

          <div v-if="!isEmergency" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="pickupDate" class="block text-sm font-medium text-slate-700 mb-2">
                {{ isSocial ? 'Tanggal Acara' : 'Tanggal Penjemputan' }}
                <span class="text-red-500">*</span>
              </label>
              <input
                id="pickupDate"
                v-model="form.pickupDate"
                type="date"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="
                  errors.pickupDate ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                "
              />
              <p v-if="errors.pickupDate" class="mt-1 text-xs text-red-600">
                {{ errors.pickupDate }}
              </p>
            </div>

            <div>
              <label for="pickupTime" class="block text-sm font-medium text-slate-700 mb-2">
                {{ isSocial ? 'Waktu Acara' : 'Waktu Penjemputan' }}
                <span class="text-red-500">*</span>
              </label>
              <input
                id="pickupTime"
                v-model="form.pickupTime"
                type="time"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="
                  errors.pickupTime ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                "
              />
              <p v-if="errors.pickupTime" class="mt-1 text-xs text-red-600">
                {{ errors.pickupTime }}
              </p>
            </div>
          </div>

          <div v-if="!isSocial && !isEmergency">
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Tujuan <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.destination"
              type="text"
              placeholder="Masukkan tujuan / rumah sakit tujuan"
              class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              :class="errors.destination ? 'border-red-300 bg-red-50' : 'border-slate-300'"
            />
            <p v-if="errors.destination" class="mt-1 text-xs text-red-600">
              {{ errors.destination }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ isSocial ? 'Detail Acara' : 'Catatan Tambahan' }}
              <span v-if="isSocial" class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.note"
              rows="3"
              :placeholder="
                isSocial
                  ? 'Jelaskan detail acara (wajib)'
                  : 'Informasi tambahan yang perlu disampaikan (opsional)'
              "
              class="w-full px-4 py-3 text-sm border rounded-xl bg-white transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              :class="errors.note ? 'border-red-300 bg-red-50' : 'border-slate-300'"
            ></textarea>
            <p v-if="errors.note" class="mt-1 text-xs text-red-600">
              {{ errors.note }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3"></div>
      </div>
    </form>

    <!-- Footer -->
    <div class="sticky bottom-0 z-40 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
      <BaseButton
        @click="handleSubmit"
        type="button"
        variant="primary"
        :loading="isLoading"
        :disabled="isLoading"
        size="lg"
        class="flex-1 h-14 font-bold shadow-lg shadow-primary-200"
      >
        Ajukan Permintaan
      </BaseButton>
    </div>
  </div>
</template>
