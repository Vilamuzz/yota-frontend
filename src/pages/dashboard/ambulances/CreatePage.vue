<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Ambulance as AmbulanceIcon, ArrowLeft, ShieldCheck, Settings } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAmbulanceCreate } from '@/composables/ambulance/useAmbulanceCreate'
import { ambulanceSchema } from '@/schemas/ambulance.schema'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const { showToast } = useToast()
const { createMutation, validationErrors } = useAmbulanceCreate()

const form = reactive({
  plateNumber: '',
  model: '',
  status: 'available',
})

const errors = ref<Record<string, string>>({})

const statuses = [
  { label: 'Tersedia', value: 'available' },
  { label: 'Sedang Digunakan', value: 'in_use' },
  { label: 'Pemeliharaan', value: 'maintenance' },
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

const handleSubmit = () => {
  const result = ambulanceSchema.safeParse({
    plateNumber: form.plateNumber.trim(),
    model: form.model.trim(),
    status: form.status,
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
      router.push({ name: 'dashboard-ambulances' })
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
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <BaseButton variant="outline" size="md" @click="router.push({ name: 'dashboard-ambulances' })">
          <ArrowLeft :size="18" class="mr-2" />
          Kembali
        </BaseButton>
      </div>

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
              <BaseInput
                id="model"
                v-model="form.model"
                label="Model / Tipe"
                placeholder="mis. Toyota Hiace"
                :error="errors.model || validationErrors?.model"
                required
              />
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <ShieldCheck class="text-green-500 shrink-0 mt-0.5" :size="18" />
              <div>
                <p class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Status Verifikasi</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Pastikan data nomor plat sesuai dengan STNK kendaraan untuk keperluan administrasi dan pelacakan.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Status & Actions -->
        <div class="space-y-6">
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
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400'
                    : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
              >
                {{ s.label }}
                <div v-if="form.status === s.value" class="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--color-primary-500),0.8)]"></div>
              </button>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
              <BaseButton type="submit" variant="primary" :loading="isLoading" class="w-full py-4 rounded-xl shadow-lg shadow-primary-500/20">
                SIMPAN KENDARAAN
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                @click="router.push({ name: 'dashboard-ambulances' })"
                :disabled="isLoading"
                class="w-full rounded-xl"
              >
                BATAL
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
