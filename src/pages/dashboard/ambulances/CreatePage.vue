<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Ambulance as AmbulanceIcon, ShieldCheck, Settings } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAmbulanceCreate } from '@/composables/ambulance/useAmbulanceCreate'
import { useDriverAccountList } from '@/composables/account/useAccountList'
import { ambulanceSchema } from '@/schemas/ambulance.schema'
import { AmbulanceStatus } from '@/types/ambulance'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { Upload, Camera } from 'lucide-vue-next'

const router = useRouter()
const { showToast } = useToast()
const { createMutation, validationErrors } = useAmbulanceCreate()

const form = reactive({
  plateNumber: '',
  driverId: '',
  status: AmbulanceStatus.Available as string,
  image: null as File | null,
  imagePreview: null as string | null,
})

const driverQueryParams = reactive({
  limit: 100,
  search: undefined,
})

const { accounts: drivers, isLoading: isLoadingDrivers } = useDriverAccountList(driverQueryParams)

const errors = ref<Record<string, string>>({})

const statuses = [
  { label: 'Tersedia', value: AmbulanceStatus.Available },
  { label: 'Sedang Digunakan', value: AmbulanceStatus.InUse },
  { label: 'Pemeliharaan', value: AmbulanceStatus.Maintenance },
]

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

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.image = file
    form.imagePreview = URL.createObjectURL(file)
  }
}

const handleSubmit = () => {
  const result = ambulanceSchema.safeParse({
    plateNumber: form.plateNumber.trim(),
    driverId: form.driverId,
    status: form.status,
    image: form.image,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi data dengan benar', 'error')
    return
  }

  createMutation.mutate(result.data, {
    onSuccess: () => {
      showToast('Ambulans berhasil ditambahkan!', 'success')
      router.push({ name: 'dashboard-ambulance' })
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal menambahkan ambulans'), 'error')
    },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Ambulans Baru</template>

    <div class="max-w-full mx-auto space-y-6">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Vehicle Details -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
                <AmbulanceIcon :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Kendaraan
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="plateNumber"
                v-model="form.plateNumber"
                label="Nomor Plat"
                placeholder="mis. AD 1234 ABC"
                :error="errors.plateNumber || validationErrors?.plateNumber"
                required
              />
              <div>
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
                >
                  Sopir <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.driverId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-500': errors.driverId || validationErrors?.driverId }"
                  :disabled="isLoadingDrivers"
                >
                  <option value="" disabled>
                    {{ isLoadingDrivers ? 'Memuat sopir...' : 'Pilih Sopir' }}
                  </option>
                  <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                    {{ driver.username }} ({{ driver.email }})
                  </option>
                </select>
                <p
                  v-if="errors.driverId || validationErrors?.driverId"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.driverId || validationErrors?.driverId }}
                </p>
              </div>
            </div>

            <div
              class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-3"
            >
              <ShieldCheck class="text-green-500 shrink-0 mt-0.5" :size="18" />
              <div>
                <p
                  class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1"
                >
                  Status Verifikasi
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Pastikan data nomor plat sesuai dengan STNK kendaraan untuk keperluan administrasi
                  dan pelacakan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Status & Actions -->
        <div class="space-y-6">
          <!-- Ambulance Image -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Ambulans
            </h3>

            <div class="flex justify-center">
              <div
                class="relative w-full aspect-video rounded-xl border-4 border-dashed overflow-hidden transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
                :class="[
                  form.imagePreview
                    ? 'border-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
                ]"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="handleImageChange"
                />

                <div
                  v-if="!form.imagePreview"
                  class="h-full flex flex-col items-center justify-center p-4 text-center"
                >
                  <Camera class="text-gray-300 mb-2" :size="32" />
                  <p class="text-[10px] font-medium text-gray-500 uppercase">
                    Pilih Foto Kendaraan
                  </p>
                </div>

                <template v-else>
                  <img :src="form.imagePreview" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Upload class="text-white" :size="24" />
                  </div>
                </template>
              </div>
            </div>
            <p v-if="errors.image" class="text-center text-[10px] text-red-600">
              {{ errors.image }}
            </p>
          </div>

          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex items-center gap-2 mb-2">
              <Settings class="text-gray-400" :size="16" />
              <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Pengaturan Status
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="s in statuses"
                :key="s.value"
                type="button"
                @click="form.status = s.value"
                class="flex items-center justify-between px-3 py-3 rounded-xl border transition-all duration-200 text-xs font-medium"
                :class="[
                  form.status === s.value
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                    : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                ]"
              >
                {{ s.label }}
                <div
                  v-if="form.status === s.value"
                  class="w-2 h-2 rounded-full bg-primary-300 shadow-[0_0_8px_rgba(var(--color-primary-500),0.8)]"
                ></div>
              </button>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
              <BaseButton type="submit" variant="primary" :loading="isLoading" class="w-full">
                Simpan
              </BaseButton>
              <BaseButton
                type="button"
                variant="danger"
                @click="router.push({ name: 'dashboard-ambulance' })"
                :disabled="isLoading"
                class="w-full"
              >
                Batal
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
