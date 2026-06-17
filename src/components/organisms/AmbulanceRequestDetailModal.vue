<script setup lang="ts">
import { computed } from 'vue'
import { useMyAmbulanceServiceDetail } from '@/composables/ambulanceService/useMyAmbulanceServiceDetail'
import { formatDate } from '@/utils/format'
import { formatAmbulanceServiceCategory } from '@/types/ambulanceHistory'
import {
  X,
  Loader2,
  Ambulance,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
} from 'lucide-vue-next'
import { formatPhoneWithDashes } from '@/utils/phone'
import { AmbulanceServiceStatus } from '@/types/ambulanceService'

const props = defineProps<{
  show: boolean
  id: string
}>()

const { detailQuery, ambulanceService, isLoading } = useMyMyAmbulanceServiceDetail()

function useMyMyAmbulanceServiceDetail() {
  return useMyAmbulanceServiceDetail(() => props.id, {
    enabled: computed(() => props.show && !!props.id),
  })
}

const statusConfig = computed(() => {
  if (!ambulanceService.value) return null

  switch (ambulanceService.value.status.toLowerCase()) {
    case AmbulanceServiceStatus.ACCEPTED:
      return {
        icon: CheckCircle2,
        bgClass: 'bg-green-50/80 border-green-100 text-green-800',
        iconBgClass: 'bg-green-100 text-green-600',
        label: 'Diterima & Ditugaskan',
        desc: 'Permintaan Anda telah disetujui. Ambulans dan pengemudi telah ditugaskan untuk menjemput.',
      }
    case AmbulanceServiceStatus.IN_SERVICE:
      return {
        icon: Ambulance,
        bgClass: 'bg-primary-50/80 border-primary-100 text-primary-800',
        iconBgClass: 'bg-primary-100 text-primary-600',
        label: 'Dalam Perjalanan',
        desc: 'Ambulans sedang dalam perjalanan untuk melayani permintaan Anda.',
      }
    case AmbulanceServiceStatus.DONE:
      return {
        icon: CheckCircle2,
        bgClass: 'bg-blue-50/80 border-blue-100 text-blue-800',
        iconBgClass: 'bg-blue-100 text-blue-600',
        label: 'Selesai',
        desc: 'Layanan ambulans telah selesai dilakukan. Terima kasih telah menggunakan layanan kami.',
      }
    case AmbulanceServiceStatus.REJECTED:
      return {
        icon: XCircle,
        bgClass: 'bg-red-50/80 border-red-100 text-red-800',
        iconBgClass: 'bg-red-100 text-red-600',
        label: 'Ditolak',
        desc: 'Maaf, permintaan layanan ambulans Anda tidak dapat dipenuhi oleh petugas.',
      }
    case AmbulanceServiceStatus.CANCELLED:
      return {
        icon: AlertTriangle,
        bgClass: 'bg-gray-50 border-gray-200 text-gray-800',
        iconBgClass: 'bg-gray-200 text-gray-600',
        label: 'Dibatalkan',
        desc: 'Permintaan layanan ambulans ini telah dibatalkan oleh Anda.',
      }
    case AmbulanceServiceStatus.PENDING:
    default:
      return {
        icon: Clock,
        bgClass: 'bg-yellow-50/80 border-yellow-100 text-yellow-800',
        iconBgClass: 'bg-yellow-100 text-yellow-600',
        label: 'Menunggu Persetujuan',
        desc: 'Permintaan Anda sedang dalam antrean verifikasi oleh petugas kami.',
      }
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="show"
          class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 font-poppins relative"
        >
          <!-- Background decoration -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-primary-50/40 rounded-full -mr-12 -mt-12 pointer-events-none"
          />

          <!-- Header -->
          <div
            class="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-md relative z-10 shrink-0"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center shrink-0"
              >
                <Ambulance :size="24" />
              </div>
              <div>
                <h3 class="text-lg font-black text-gray-900 leading-tight">Detail Permintaan</h3>
                <p class="text-xs font-mono text-gray-400 mt-0.5">ID: {{ id }}</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition flex items-center justify-center"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-8 overflow-y-auto space-y-6 relative z-10 flex-1">
            <!-- Loading State -->
            <div
              v-if="isLoading"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <Loader2 class="w-12 h-12 text-primary-400 animate-spin mb-4" />
              <p class="text-sm font-semibold text-gray-500 animate-pulse">
                Mengambil data detail dari server...
              </p>
            </div>

            <!-- Error State -->
            <div v-else-if="detailQuery.isError.value" class="text-center py-12">
              <div
                class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <XCircle :size="32" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">Gagal Memuat Detail</h3>
              <p class="text-sm text-gray-500 mb-6">
                Terjadi kesalahan saat mengambil detail permintaan ambulans.
              </p>
            </div>

            <!-- Data State -->
            <template v-else-if="ambulanceService">
              <!-- Status Alert Banner -->
              <div
                v-if="statusConfig"
                class="p-4 rounded-2xl border flex items-start gap-4"
                :class="statusConfig.bgClass"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :class="statusConfig.iconBgClass"
                >
                  <component :is="statusConfig.icon" :size="20" />
                </div>
                <div class="space-y-0.5">
                  <h4 class="text-sm font-bold uppercase tracking-wider">
                    {{ statusConfig.label }}
                  </h4>
                  <p class="text-xs leading-relaxed opacity-90">{{ statusConfig.desc }}</p>
                </div>
              </div>

              <!-- Content Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Applicant Info -->
                <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <h4
                    class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <User :size="14" />
                    Informasi Pemohon
                  </h4>

                  <div class="space-y-3">
                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Nama Pemohon</span
                      >
                      <p class="text-sm font-bold text-gray-800">
                        {{ ambulanceService.submitterName }}
                      </p>
                    </div>

                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Nomor Telepon</span
                      >
                      <a
                        :href="`https://wa.me/+62${ambulanceService.submitterPhone}`"
                        class="text-sm font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone :size="14" />
                        {{ formatPhoneWithDashes(ambulanceService.submitterPhone) }}
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Service Info -->
                <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <h4
                    class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Calendar :size="14" />
                    Detail Layanan
                  </h4>

                  <div class="space-y-3">
                    <div class="flex items-center gap-4 justify-between">
                      <div>
                        <span
                          class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                          >Kategori</span
                        >
                        <span
                          class="inline-block px-2 py-0.5 bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-bold uppercase tracking-wider rounded-lg mt-0.5"
                        >
                          {{ formatAmbulanceServiceCategory(ambulanceService.serviceCategory) }}
                        </span>
                      </div>
                      <div>
                        <span
                          class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right"
                          >Tanggal Layanan</span
                        >
                        <p class="text-xs font-bold text-gray-700 mt-0.5 text-right">
                          {{ formatDate(ambulanceService.pickupDate) }}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Tanggal Pengajuan</span
                      >
                      <p class="text-xs font-semibold text-gray-600 flex items-center gap-1 mt-0.5">
                        <Clock :size="12" />
                        {{ formatDate(ambulanceService.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Address Details (Full Width) -->
              <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2">
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <MapPin :size="14" />
                  Alamat Penjemputan / Tujuan
                </h4>
                <p
                  class="text-sm font-semibold text-gray-700 leading-relaxed bg-white border border-gray-100/80 p-3.5 rounded-xl"
                >
                  {{ ambulanceService.patientAddress }}
                </p>
              </div>

              <!-- Request Reason (Full Width) -->
              <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2">
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <FileText :size="14" />
                  Alasan Permintaan Layanan
                </h4>
                <p
                  class="text-sm font-medium text-gray-600 leading-relaxed bg-white border border-gray-100/80 p-3.5 rounded-xl italic"
                >
                  "{{ ambulanceService.note || 'Tidak ada alasan tambahan yang diberikan.' }}"
                </p>
              </div>

              <!-- Rejection Reason (If Rejected) -->
              <div
                v-if="
                  ambulanceService.status.toLowerCase() === 'rejected' &&
                  ambulanceService.rejectionReason
                "
                class="p-5 rounded-2xl bg-red-50/50 border border-red-100 space-y-2"
              >
                <h4
                  class="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <XCircle :size="14" />
                  Alasan Penolakan dari Petugas
                </h4>
                <p
                  class="text-sm font-bold text-red-800 leading-relaxed bg-white border border-red-100/50 p-3.5 rounded-xl"
                >
                  {{ ambulanceService.rejectionReason }}
                </p>
              </div>

              <!-- Assigned Ambulance details (If Accepted/Done and Ambulance Assigned) -->
              <div
                v-if="ambulanceService.assignedAmbulance"
                class="p-6 rounded-3xl bg-emerald-50/30 border-2 border-dashed border-emerald-100 space-y-5"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  >
                    <Ambulance :size="20" />
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-gray-800 leading-tight">
                      Petugas & Ambulans Ditugaskan
                    </h4>
                    <p class="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      Informasi Armada Penjemput
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Plate Number / Vehicle Details -->
                  <div
                    class="bg-white border border-emerald-100/60 rounded-2xl p-4 flex flex-col justify-center"
                  >
                    <span
                      class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2"
                      >Plat Nomor Kendaraan</span
                    >
                    <div>
                      <!-- Indonesian styled license plate -->
                      <div
                        class="inline-block px-4 py-1.5 bg-gray-900 border border-gray-800 text-white font-mono font-bold tracking-widest text-sm rounded-lg shadow-inner select-all"
                      >
                        {{ ambulanceService.assignedAmbulance.plateNumber }}
                      </div>
                    </div>
                  </div>

                  <!-- Driver Details -->
                  <div class="bg-white border border-emerald-100/60 rounded-2xl p-4 space-y-2.5">
                    <div class="flex items-center gap-2">
                      <User :size="16" class="text-emerald-500" />
                      <div>
                        <span
                          class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider"
                          >Pengemudi</span
                        >
                        <p class="text-xs font-bold text-gray-800">
                          {{ ambulanceService.assignedAmbulance.driver.username }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between border-t border-gray-50 pt-2">
                      <div class="flex items-center gap-2">
                        <Phone :size="16" class="text-emerald-500" />
                        <div>
                          <span
                            class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider"
                            >Telepon</span
                          >
                          <a
                            :href="`https://wa.me/+62${ambulanceService.assignedAmbulance.driver.phone}`"
                            class="text-xs font-bold text-gray-700"
                          >
                            {{
                              formatPhoneWithDashes(ambulanceService.assignedAmbulance.driver.phone)
                            }}
                          </a>
                        </div>
                      </div>
                      <a
                        :href="`https://wa.me/+62${ambulanceService.assignedAmbulance.driver.phone}`"
                        target="_blank"
                        class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center shrink-0"
                        title="Hubungi Pengemudi"
                      >
                        <PhoneCall :size="14" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div
            class="px-8 py-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-md flex justify-end shrink-0 relative z-10"
          ></div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
