<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { ROLES } from '@/const/roles'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string
const program = route.query.program ? JSON.parse(route.query.program as string) : null

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const handleEdit = () => {
  router.push({
    name: 'dashboard-social-program-edit',
    params: { id: programId },
    query: { program: JSON.stringify(program) },
  })
}

const handleBack = () => {
  router.back()
}

// ✅ Modal Approval State
const showApprovalModal = ref(false)

const handleApprove = () => {
  showApprovalModal.value = true
}

const handleConfirmApprove = async () => {
  // TODO: hit API approve
  console.log('Setujui program:', programId)
  showApprovalModal.value = false
}

// ✅ Modal Rejection State
const showRejectionModal = ref(false)
const rejectionReason = ref('')
const rejectionError = ref(false)

const handleReject = () => {
  showRejectionModal.value = true
}

const handleConfirmReject = async () => {
  if (!rejectionReason.value.trim()) {
    rejectionError.value = true
    return
  }
  // TODO: hit API reject
  console.log('Tolak program:', programId, 'Alasan:', rejectionReason.value)
  showRejectionModal.value = false
  rejectionReason.value = ''
  rejectionError.value = false
}

const handleCloseRejectionModal = () => {
  showRejectionModal.value = false
  rejectionReason.value = ''
  rejectionError.value = false
}
</script>

<template>
  <DashboardLayout>
    <!-- TITLE -->
    <template #title>
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Detail Program Sosial</h1>
        <p class="text-sm text-gray-400 mt-1">Manajemen Program > Data Program > Detail</p>
      </div>
    </template>

    <!-- CONTAINER -->
    <div class="mt-6">
      <!-- HEADER CARD -->
      <div class="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="handleBack" class="text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft :size="24" />
          </button>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ program?.name }}</h2>
          </div>
        </div>
      </div>

      <!-- OVERVIEW -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Overview</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- LEFT -->
          <div>
            <!-- Nama Program -->
            <div class="mb-5">
              <p class="text-sm text-gray-500 mb-1">Nama Program</p>
              <div class="border rounded-lg px-4 py-2 bg-gray-50">
                {{ program?.name }}
              </div>
            </div>

            <!-- Detail Program -->
            <div class="mb-5">
              <p class="text-sm text-gray-500 mb-1">Detail Program</p>
              <div class="border rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-700">
                {{ program?.description }}
              </div>
            </div>

            <!-- Media -->
            <div>
              <p class="text-sm text-gray-500 mb-2">Media</p>
              <div v-if="program?.media?.length">
                <div
                  v-for="(file, index) in program.media"
                  :key="index"
                  class="flex items-center justify-between border rounded-lg px-3 py-2 mb-2"
                >
                  <div>
                    <p class="text-sm text-gray-800">{{ file.name }}</p>
                    <p class="text-xs text-gray-400">{{ file.size }}</p>
                  </div>
                  <button class="text-gray-400 hover:text-gray-700">👁️</button>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400">Tidak ada media</p>
            </div>
          </div>

          <!-- RIGHT -->
          <div>
            <!-- Nominal -->
            <div class="mb-5">
              <p class="text-sm text-gray-500 mb-1">Nominal Minimal Pembayaran</p>
              <div class="border rounded-lg px-4 py-2 bg-gray-50">
                Rp{{ program?.min_donation?.toLocaleString('id-ID') }}
              </div>
            </div>

            <!-- Ditagihkan -->
            <div class="mb-5">
              <p class="text-sm text-gray-500 mb-1">Ditagihkan Setiap</p>
              <div class="border rounded-lg px-4 py-2 bg-gray-50">
                {{ program?.billing_date }}
              </div>
            </div>

            <!-- Status Program — hanya KS -->
            <div v-if="!isChairman">
              <p class="text-sm text-gray-500 mb-2">Status Program</p>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-sm">
                  <input type="radio" disabled :checked="program?.status === 'active'" />
                  Berjalan
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="radio" disabled :checked="program?.status === 'pending'" />
                  Pending
                </label>
                <label class="flex items-center gap-2 text-sm">
                  <input type="radio" disabled :checked="program?.status === 'completed'" />
                  Selesai
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- BUTTON -->
        <div class="flex justify-end mt-8 gap-3">
          <!-- KS: tombol Edit -->
          <template v-if="!isChairman">
            <BaseButton variant="primary" @click="handleEdit">
              Edit
            </BaseButton>
          </template>

          <!-- Ketua: tombol Tolak + Setujui -->
          <template v-else>
            <BaseButton variant="danger" @click="handleReject">
              Tolak
            </BaseButton>
            <BaseButton variant="primary" @click="handleApprove">
              Setujui
            </BaseButton>
          </template>
        </div>
      </div>
    </div>

    <!-- APPROVAL CONFIRMATION MODAL -->
    <ConfirmationModal
      :show="showApprovalModal"
      title="Setujui Program Sosial?"
      :message="'Apakah Anda yakin ingin menyetujui program ini?\n\nPersetujuan ini akan menetapkan program tersebut sebagai program yang berjalan.'"
      @primary="handleConfirmApprove"
      @secondary="showApprovalModal = false"
      @close="showApprovalModal = false"
    />

    <!-- REJECTION MODAL -->
    <div
      v-if="showRejectionModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="handleCloseRejectionModal"
    >
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
        <div class="text-center py-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Tolak Program Sosial?</h2>
          <p class="text-gray-600 text-sm mb-6 whitespace-pre-line leading-relaxed">
            {{ 'Berikan alasan penolakan program ini.\n\nAlasan akan dikirimkan kepada pengaju program.' }}
          </p>

          <div class="text-left mb-6">
            <label class="text-sm text-gray-600 font-medium mb-1 block">
              Alasan Penolakan <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              rows="4"
              placeholder="Tulis alasan penolakan..."
              class="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2"
              :class="rejectionError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-primary-300'"
              @input="rejectionError = false"
            />
            <p v-if="rejectionError" class="text-xs text-red-500 mt-1">
              Alasan penolakan wajib diisi.
            </p>
          </div>

          <div class="flex flex-row gap-3">
            <BaseButton variant="outline" full-width @click="handleCloseRejectionModal">
              Batal
            </BaseButton>
            <BaseButton variant="danger" full-width @click="handleConfirmReject">
              Tolak Program
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

  </DashboardLayout>
</template>