<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Layout, CreditCard, Info, Pencil, Calendar, Check, X, AlertCircle } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { useSocialProgramStatus } from '@/composables/socialProgram/useSocialProgramStatus'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useToast } from '@/composables/ui/useToast'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string

const authStore = useAuthStore()
const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const { detailQuery } = useSocialProgramDetail(programId)
const { approveMutation, rejectMutation } = useSocialProgramStatus()
const { showToast } = useToast()

const program = computed(() => detailQuery.data.value?.data || null)

const isLoading = detailQuery.isLoading

// APPROVE
const approveConfirmShow = ref(false)
const handleApprove = () => {
  approveConfirmShow.value = true
}

const handleConfirmApprove = async () => {
  approveMutation.mutate(programId, {
    onSuccess: () => {
      showToast('Program berhasil disetujui!', 'success')
      approveConfirmShow.value = false
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Gagal menyetujui program', 'error')
    },
  })
}

// REJECT
const rejectModalShow = ref(false)
const handleReject = () => {
  rejectModalShow.value = true
}

const handleConfirmReject = async (reason: string) => {
  rejectMutation.mutate(
    { id: programId, reason },
    {
      onSuccess: () => {
        showToast('Program berhasil ditolak', 'success')
        rejectModalShow.value = false
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Gagal menolak program', 'error')
      },
    },
  )
}

const handleEdit = () => {
  router.push({
    name: 'dashboard-social-programs-edit',
    params: { id: programId },
  })
}

const handleBack = () => {
  router.push({ name: 'dashboard-social-programs' })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Program Sosial</template>

    <div class="max-w-full mx-auto space-y-6">
      <div
        v-if="isLoading && !program"
        class="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div
          class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-gray-500 text-sm animate-pulse">Memuat detail program...</p>
      </div>

      <div v-else-if="program" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <Layout :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Program
              </h3>
            </div>

            <div class="space-y-4">
              <div class="w-full">
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                >
                  Judul Program
                </label>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ program.title }}
                </p>
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                >
                  Status
                </label>
                <div
                  v-if="program"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit',
                    getStatusColor(program.status),
                  ]"
                >
                  {{ formatStatus(program.status) }}
                </div>
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                >
                  Deskripsi Program
                </label>
                <div
                  class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                >
                  {{ program.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Configuration Section -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <CreditCard :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Konfigurasi Pembayaran
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex items-start gap-4">
                <div
                  class="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <CreditCard :size="20" class="text-gray-400" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                  >
                    Minimal Nominal
                  </label>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ formatCurrency(program.minimumAmount) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div
                  class="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <Calendar :size="20" class="text-gray-400" />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                  >
                    Hari Penagihan
                  </label>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    Setiap Tanggal {{ program.billingDay }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3"
            >
              <Info :size="20" class="text-blue-500 shrink-0" />
              <div class="space-y-1">
                <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Program ini ditambahkan pada {{ formatDate(program.createdAt) }}.
                </p>
                <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  Saat ini terdapat {{ program.totalSubscribers }} donatur aktif yang berlangganan
                  program ini.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Media & Actions -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Sampul Program
            </h3>

            <div
              class="relative w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-900"
            >
              <img
                v-if="program.coverImage"
                :src="program.coverImage"
                :alt="program.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-gray-400"
              >
                <Layout :size="48" class="mb-2 opacity-20" />
                <span class="text-xs">Tidak ada foto sampul</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex flex-col gap-3">
              <template v-if="isChairman && program?.status === SocialProgramStatusEnum.PENDING">
                <BaseButton
                  variant="primary"
                  class="w-full flex items-center justify-center gap-2"
                  :loading="approveMutation.isPending.value"
                  @click="handleApprove"
                >
                  <Check :size="16" />
                  Terima Program
                </BaseButton>

                <BaseButton
                  variant="danger"
                  class="w-full flex items-center justify-center gap-2"
                  :loading="rejectMutation.isPending.value"
                  @click="handleReject"
                >
                  <X :size="16" />
                  Tolak Program
                </BaseButton>
              </template>

              <template
                v-else-if="
                  !isChairman &&
                  program?.status !== SocialProgramStatusEnum.COMPLETED &&
                  program?.status !== SocialProgramStatusEnum.REJECTED
                "
              >
                <BaseButton
                  variant="primary"
                  class="w-full flex items-center justify-center gap-2"
                  @click="handleEdit"
                >
                  <Pencil :size="16" />
                  Edit Program
                </BaseButton>
              </template>

              <BaseButton variant="outline" class="w-full" @click="handleBack">
                Kembali
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
      >
        <p class="text-gray-500">
          Program tidak ditemukan atau terjadi kesalahan saat memuat data.
        </p>
        <BaseButton variant="primary" class="mt-4" @click="handleBack"
          >Kembali ke Daftar</BaseButton
        >
      </div>
    </div>
  </DashboardLayout>

  <!-- APPROVE CONFIRMATION MODAL -->
  <ConfirmationModal
    :show="approveConfirmShow"
    :title="`Setujui ${program?.title}?`"
    message="Program ini akan disetujui dan status akan berubah menjadi Aktif/Berjalan."
    primary-button-text="Setujui"
    secondary-button-text="Batal"
    :icon="Check"
    :primary-button-loading="approveMutation.isPending.value"
    @primary="handleConfirmApprove"
    @secondary="approveConfirmShow = false"
    @close="approveConfirmShow = false"
  />

  <!-- REJECT MODAL -->
  <RejectConfirmationModal
    :show="rejectModalShow"
    :title="`Tolak ${program?.title}?`"
    message="Berikan alasan penolakan untuk program ini."
    primary-button-text="Tolak"
    secondary-button-text="Batal"
    :icon="AlertCircle"
    :primary-button-loading="rejectMutation.isPending.value"
    @primary="handleConfirmReject"
    @secondary="rejectModalShow = false"
    @close="rejectModalShow = false"
  />
</template>
