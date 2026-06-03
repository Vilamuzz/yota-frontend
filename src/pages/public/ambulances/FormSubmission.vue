<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import { useAmbulanceRequestService } from '@/composables/ambulanceService/useAmbulanceRequestService'
import { AmbulanceServiceCategory, serviceCategoryOptions } from '@/types/ambulanceHistory'

const router = useRouter()
const { showToast } = useToast()

const form = reactive({
  applicantName: '',
  applicantPhone: '',
  applicantAddress: '',
  requestDate: '',
  requestReason: '',
  serviceCategory: '' as unknown as AmbulanceServiceCategory,
})

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

  if (!form.applicantName.trim()) newErrors.applicantName = 'Nama pemohon wajib diisi'
  if (!form.applicantPhone.trim()) {
    newErrors.applicantPhone = 'Nomor telepon wajib diisi'
  } else if (!/^[0-9]{8,15}$/.test(form.applicantPhone)) {
    newErrors.applicantPhone = 'Nomor telepon tidak valid'
  }
  if (!form.applicantAddress.trim()) newErrors.applicantAddress = 'Alamat wajib diisi'
  if (!form.requestDate) newErrors.requestDate = 'Tanggal permintaan wajib diisi'
  if (!form.requestReason.trim()) newErrors.requestReason = 'Alasan permintaan wajib diisi'
  if (!form.serviceCategory) newErrors.serviceCategory = 'Kategori layanan wajib diisi'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = () => {
  if (!validate()) {
    showToast('Mohon lengkapi data dengan benar', 'error')
    return
  }

  createMutation.mutate({ ...form, accountId: '' }, {
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
          Lengkapi data pemohon dan detail kebutuhan ambulans dengan benar
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
            Lengkapi informasi pemohon dan alasan kebutuhan ambulans
          </p>
        </div>

        <!-- Form Body -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
          <div class="mb-2">
            <h3 class="text-lg font-semibold text-slate-800">Informasi Pemohon</h3>
            <p class="text-sm text-slate-500 mt-1">
              Pastikan data yang dimasukkan sudah benar dan valid
            </p>
          </div>

          <!-- Applicant Name & Phone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Nama Pemohon <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.applicantName"
                type="text"
                placeholder="Masukkan nama lengkap pemohon"
                class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="errors.applicantName ? 'border-red-300 bg-red-50' : 'border-slate-300'"
              />
              <p v-if="errors.applicantName" class="mt-1 text-xs text-red-600">
                {{ errors.applicantName }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2"
                >Nomor Telepon <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.applicantPhone"
                type="text"
                inputmode="numeric"
                placeholder="Masukkan nomor telepon"
                class="w-full px-4 py-3 text-sm border rounded-xl bg-white text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="errors.applicantPhone ? 'border-red-300 bg-red-50' : 'border-slate-300'"
                @input="form.applicantPhone = form.applicantPhone.replace(/[^0-9]/g, '')"
              />
              <p v-if="errors.applicantPhone" class="mt-1 text-xs text-red-600">
                {{ errors.applicantPhone }}
              </p>
            </div>
          </div>

          <!-- Applicant Address -->
          <div>
            <label for="applicantAddress" class="block text-sm font-medium text-slate-700 mb-2"
              >Alamat Pemohon <span class="text-red-500">*</span></label
            >
            <textarea
              id="applicantAddress"
              v-model="form.applicantAddress"
              rows="4"
              placeholder="Masukkan alamat lengkap pemohon"
              class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              :class="
                errors.applicantAddress ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              "
            ></textarea>
            <p v-if="errors.applicantAddress" class="mt-2 text-xs text-red-600">
              {{ errors.applicantAddress }}
            </p>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100 pt-4">
            <h3 class="text-lg font-semibold text-slate-800">Detail Permintaan</h3>
            <p class="text-sm text-slate-500 mt-1">Informasi mengenai kebutuhan ambulans</p>
          </div>

          <!-- Request Date & Category -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="requestDate" class="block text-sm font-medium text-slate-700 mb-2"
                >Tanggal Permintaan <span class="text-red-500">*</span></label
              >
              <input
                id="requestDate"
                v-model="form.requestDate"
                type="date"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="
                  errors.requestDate ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                "
              />
              <p v-if="errors.requestDate" class="mt-1 text-xs text-red-600">
                {{ errors.requestDate }}
              </p>
            </div>

            <div>
              <label for="serviceCategory" class="block text-sm font-medium text-slate-700 mb-2"
                >Kategori Layanan <span class="text-red-500">*</span></label
              >
              <select
                id="serviceCategory"
                v-model="form.serviceCategory"
                class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                :class="
                  errors.serviceCategory ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                "
              >
                <option value="" disabled>Pilih kategori layanan</option>
                <option v-for="cat in serviceCategoryOptions" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
              <p v-if="errors.serviceCategory" class="mt-1 text-xs text-red-600">
                {{ errors.serviceCategory }}
              </p>
            </div>
          </div>

          <!-- Request Reason -->
          <div>
            <label for="requestReason" class="block text-sm font-medium text-slate-700 mb-2"
              >Alasan Permintaan <span class="text-red-500">*</span></label
            >
            <textarea
              id="requestReason"
              v-model="form.requestReason"
              rows="5"
              placeholder="Jelaskan kondisi dan alasan membutuhkan ambulans"
              class="w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              :class="
                errors.requestReason ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              "
            ></textarea>
            <p v-if="errors.requestReason" class="mt-2 text-xs text-red-600">
              {{ errors.requestReason }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <BaseButton type="button" variant="danger" @click="handleBack">Batal</BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isLoading" :disabled="isLoading">
            Ajukan Permintaan
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>
