<script setup lang="ts">
import { computed } from 'vue'
import { useMyFosterChildrenCandidateDetail } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateDetail'
import { formatDate } from '@/utils/format'
import { Gender, Category } from '@/types/fosterChildren'
import {
  X,
  Loader2,
  Baby,
  User,
  Phone,
  MapPin,
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  ExternalLink,
  Shield,
  FileCheck,
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  id: string
}>()

const { detailQuery, candidate, isLoading } = useMyFosterChildrenCandidateDetail(() => props.id, {
  enabled: computed(() => props.show && !!props.id),
})

const statusConfig = computed(() => {
  if (!candidate.value) return null

  switch (candidate.value.status.toLowerCase()) {
    case 'accepted':
    case 'approved':
      return {
        icon: CheckCircle2,
        bgClass: 'bg-green-50/80 border-green-100 text-green-800',
        iconBgClass: 'bg-green-100 text-green-600',
        label: 'Diterima',
        desc: 'Selamat! Pengajuan calon anak asuh Anda telah disetujui sepenuhnya.',
      }
    case 'social_manager_accepted':
      return {
        icon: Shield,
        bgClass: 'bg-indigo-50/80 border-indigo-100 text-indigo-800',
        iconBgClass: 'bg-indigo-100 text-indigo-600',
        label: 'Disetujui Manajer Sosial',
        desc: 'Pengajuan telah disetujui oleh Manajer Sosial dan sedang diproses untuk verifikasi akhir.',
      }
    case 'rejected':
      return {
        icon: XCircle,
        bgClass: 'bg-red-50/80 border-red-100 text-red-800',
        iconBgClass: 'bg-red-100 text-red-600',
        label: 'Ditolak',
        desc: 'Maaf, pengajuan calon anak asuh ini ditolak oleh petugas.',
      }
    case 'cancelled':
    case 'canceled':
      return {
        icon: AlertTriangle,
        bgClass: 'bg-gray-50 border-gray-200 text-gray-800',
        iconBgClass: 'bg-gray-200 text-gray-600',
        label: 'Dibatalkan',
        desc: 'Pengajuan calon anak asuh ini telah dibatalkan oleh Anda.',
      }
    case 'pending':
    default:
      return {
        icon: Clock,
        bgClass: 'bg-yellow-50/80 border-yellow-100 text-yellow-800',
        iconBgClass: 'bg-yellow-100 text-yellow-600',
        label: 'Menunggu Verifikasi',
        desc: 'Pengajuan sedang dalam antrean verifikasi oleh tim manajer kami.',
      }
  }
})

const getGenderLabel = (g: string) => {
  if (g === Gender.male) return 'Laki-laki'
  if (g === Gender.female) return 'Perempuan'
  return g
}

const getCategoryLabel = (cat: string) => {
  if (cat === Category.yatim) return 'Yatim'
  if (cat === Category.piatu) return 'Piatu'
  if (cat === Category.yatimPiatu) return 'Yatim Piatu'
  return cat
}
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
                <Baby :size="24" />
              </div>
              <div>
                <h3 class="text-lg font-black text-gray-900 leading-tight">
                  Detail Pengajuan Anak Asuh
                </h3>
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
                Terjadi kesalahan saat mengambil detail pengajuan calon anak asuh.
              </p>
            </div>

            <!-- Data State -->
            <template v-else-if="candidate">
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

              <!-- Profile summary row -->
              <div
                class="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gray-50/40 border border-gray-100/80"
              >
                <img
                  :src="candidate.profilePicture"
                  :alt="candidate.name"
                  class="w-24 h-24 rounded-2xl object-cover bg-gray-100 border border-gray-100 shadow-sm"
                />
                <div class="text-center sm:text-left space-y-1.5">
                  <h4 class="text-xl font-black text-gray-950 leading-tight">
                    {{ candidate.name }}
                  </h4>
                  <div
                    class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5"
                  >
                    <span
                      class="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary-100"
                    >
                      {{ getCategoryLabel(candidate.category) }}
                    </span>
                    <span
                      class="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-200"
                    >
                      {{ getGenderLabel(candidate.gender) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400">
                    Diajukan pada {{ formatDate(candidate.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Information Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Personal Info -->
                <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <h4
                    class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <User :size="14" />
                    Biodata Calon Anak Asuh
                  </h4>

                  <div class="space-y-3">
                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Tempat, Tanggal Lahir</span
                      >
                      <p class="text-sm font-semibold text-gray-800">
                        {{ candidate.birthPlace }}, {{ formatDate(candidate.birthDate) }}
                      </p>
                    </div>

                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Sekolah / Pendidikan</span
                      >
                      <p class="text-sm font-semibold text-gray-800">
                        Kelas {{ candidate.educationLevel }} - {{ candidate.schoolName }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Submitter Info -->
                <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <h4
                    class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Clock :size="14" />
                    Informasi Pengaju (Submitter)
                  </h4>

                  <div class="space-y-3">
                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Nama Pengaju</span
                      >
                      <p class="text-sm font-bold text-gray-800">{{ candidate.submitterName }}</p>
                    </div>

                    <div>
                      <span
                        class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >Nomor Telepon</span
                      >
                      <a
                        :href="`tel:${candidate.submitterPhone}`"
                        class="text-sm font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone :size="14" />
                        {{ candidate.submitterPhone }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Candidate Address -->
              <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2">
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <MapPin :size="14" />
                  Alamat Calon Anak Asuh
                </h4>
                <p
                  class="text-sm font-semibold text-gray-700 leading-relaxed bg-white border border-gray-100/80 p-3.5 rounded-xl"
                >
                  {{ candidate.address }}
                </p>
              </div>

              <!-- Submitter Address -->
              <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2">
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <MapPin :size="14" />
                  Alamat Pengaju
                </h4>
                <p
                  class="text-sm font-semibold text-gray-700 leading-relaxed bg-white border border-gray-100/80 p-3.5 rounded-xl"
                >
                  {{ candidate.submitterAddress }}
                </p>
              </div>

              <!-- Rejection Reason (If Rejected) -->
              <div
                v-if="candidate.status.toLowerCase() === 'rejected' && candidate.rejectionReason"
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
                  {{ candidate.rejectionReason }}
                </p>
              </div>

              <!-- Documents Uploaded Section -->
              <div class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4">
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <FileCheck :size="14" />
                  Berkas Dokumen Persyaratan
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- KK -->
                  <a
                    v-if="candidate.familyCard"
                    :href="candidate.familyCard"
                    target="_blank"
                    class="p-3 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-500 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-between transition group/doc"
                  >
                    <span>Kartu Keluarga (KK)</span>
                    <ExternalLink
                      :size="14"
                      class="text-gray-400 group-hover/doc:text-primary-500"
                    />
                  </a>

                  <!-- SKTM -->
                  <a
                    v-if="candidate.sktm"
                    :href="candidate.sktm"
                    target="_blank"
                    class="p-3 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-500 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-between transition group/doc"
                  >
                    <span>Berkas SKTM</span>
                    <ExternalLink
                      :size="14"
                      class="text-gray-400 group-hover/doc:text-primary-500"
                    />
                  </a>

                  <!-- Submitter KTP -->
                  <a
                    v-if="candidate.submitterIdCard"
                    :href="candidate.submitterIdCard"
                    target="_blank"
                    class="p-3 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-500 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-between transition group/doc"
                  >
                    <span>KTP Pengaju</span>
                    <ExternalLink
                      :size="14"
                      class="text-gray-400 group-hover/doc:text-primary-500"
                    />
                  </a>
                </div>
              </div>

              <!-- Achievements Section -->
              <div
                v-if="candidate.achievements && candidate.achievements.length > 0"
                class="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-4"
              >
                <h4
                  class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <Trophy :size="14" />
                  Daftar Prestasi ({{ candidate.achievements.length }})
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="item in candidate.achievements"
                    :key="item.id"
                    class="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl"
                  >
                    <img
                      v-if="item.url"
                      :src="item.url"
                      :alt="item.alt || item.title"
                      class="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-50 border border-gray-100"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-gray-800 truncate" :title="item.title">
                        {{ item.title }}
                      </p>
                      <a
                        v-if="item.url"
                        :href="item.url"
                        target="_blank"
                        class="text-[10px] font-bold text-primary-500 hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        Lihat Sertifikat
                        <ExternalLink :size="10" />
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
