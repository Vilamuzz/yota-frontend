<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Layout,
  CreditCard,
  Info,
  Pencil,
  Calendar,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import AddOfflineSubscriptionModal from '@/components/molecules/AddOfflineSubscriptionModal.vue'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { useSocialProgramSubscriptionList } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionList'
import { useSocialProgramSubscriptionCreate } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionCreate'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { SocialProgramSubscriptionStatus } from '@/types/socialProgramSubscription'
import type { SocialProgramSubscriptionQueryParams, CreateOfflineSocialProgramSubscriptionRequest } from '@/types/socialProgramSubscription'
import { useSocialProgramStatus } from '@/composables/socialProgram/useSocialProgramStatus'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string

const authStore = useAuthStore()
const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const { detailQuery } = useSocialProgramDetail(programId)
const { approveMutation, rejectMutation, completeMutation } = useSocialProgramStatus()
const { showToast } = useToast()

const program = computed(() => detailQuery.data.value?.data || null)
const isLoading = detailQuery.isLoading

// Subscription table
const queryParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
  sortBy: undefined,
})

const { subscriptions, pagination, isLoading: subLoading } =
  useSocialProgramSubscriptionList(programId, queryParams)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const limitOptions = [10, 25, 50, 100]

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.status, queryParams.sortBy, queryParams.limit],
  () => resetPagination(),
)

const hasActiveFilters = computed(
  () => queryParams.status !== undefined || queryParams.sortBy !== undefined,
)

// Add Subscription Modal
const isAddModalOpen = ref(false)
const { createMutation, validationErrors, reset } = useSocialProgramSubscriptionCreate()

watch(isAddModalOpen, (val) => {
  if (val) reset()
})

const handleAddSubscription = (payload: CreateOfflineSocialProgramSubscriptionRequest) => {
  createMutation.mutate(
    { programId, payload },
    {
      onSuccess: () => {
        showToast('Pelanggan berhasil ditambahkan', 'success')
        isAddModalOpen.value = false
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal menambahkan pelanggan', 'error')
      },
    },
  )
}

// Summary computed
const totalCollectedFund = computed(() => program.value?.collectedFund ?? 0)
const totalExpense = computed(() => program.value?.totalExpense ?? 0)
const totalSubscribers = computed(() => program.value?.totalSubscribers ?? 0)

// APPROVE
const approveConfirmShow = ref(false)
const handleApprove = () => { approveConfirmShow.value = true }
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
const handleReject = () => { rejectModalShow.value = true }
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

// COMPLETE
const completeConfirmShow = ref(false)
const handleComplete = () => { completeConfirmShow.value = true }
const handleConfirmComplete = async () => {
  completeMutation.mutate(programId, {
    onSuccess: () => {
      showToast('Program berhasil diselesaikan!', 'success')
      completeConfirmShow.value = false
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Gagal menyelesaikan program', 'error')
    },
  })
}

const handleEdit = () => {
  router.push({ name: 'dashboard-social-programs-edit', params: { id: programId } })
}

const handleBack = () => {
  router.push({ name: 'dashboard-social-programs' })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Program Sosial</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading -->
      <div
        v-if="isLoading && !program"
        class="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm animate-pulse">Memuat detail program...</p>
      </div>

      <template v-else-if="program">
        <!-- Top Section: Info + Gambar + Aksi -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Info Program -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
              <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                  <Layout :size="20" />
                </div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Informasi Program
                </h3>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Judul Program</label>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ program.title }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                  <div :class="['px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit', getStatusColor(program.status)]">
                    {{ formatStatus(program.status) }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Deskripsi Program</label>
                  <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {{ program.description }}
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
              <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                  <CreditCard :size="20" />
                </div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Konfigurasi Pembayaran</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <CreditCard :size="20" class="text-gray-400" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Minimal Nominal</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(program.minimumAmount) }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Calendar :size="20" class="text-gray-400" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hari Penagihan</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white">Setiap Tanggal {{ program.billingDay }}</p>
                  </div>
                </div>
              </div>
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                <Info :size="20" class="text-blue-500 shrink-0" />
                <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Program ini ditambahkan pada {{ formatDate(program.createdAt) }}.
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Gambar + Aksi -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
              <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center">Foto Sampul Program</h3>
              <div class="relative w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-900">
                <img v-if="program.coverImage" :src="program.coverImage" :alt="program.title" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Layout :size="48" class="mb-2 opacity-20" />
                  <span class="text-xs">Tidak ada foto sampul</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div class="flex flex-col gap-3">
                <template v-if="isChairman && program.status === SocialProgramStatusEnum.PENDING">
                  <BaseButton variant="primary" class="w-full flex items-center justify-center gap-2" :loading="approveMutation.isPending.value" @click="handleApprove">
                    <Check :size="16" /> Terima Program
                  </BaseButton>
                  <BaseButton variant="danger" class="w-full flex items-center justify-center gap-2" :loading="rejectMutation.isPending.value" @click="handleReject">
                    <X :size="16" /> Tolak Program
                  </BaseButton>
                </template>
                <template v-else-if="!isChairman">
                  <BaseButton
                    v-if="program.status !== SocialProgramStatusEnum.COMPLETED && program.status !== SocialProgramStatusEnum.REJECTED"
                    variant="primary" class="w-full flex items-center justify-center gap-2" @click="handleEdit"
                  >
                    <Pencil :size="16" /> Edit Program
                  </BaseButton>
                  <BaseButton
                    v-if="program.status === SocialProgramStatusEnum.ACTIVE"
                    variant="success" class="w-full flex items-center justify-center gap-2"
                    :loading="completeMutation.isPending.value" @click="handleComplete"
                  >
                    <CheckCircle :size="16" /> Selesaikan Program
                  </BaseButton>
                </template>
                <BaseButton variant="outline" class="w-full" @click="handleBack">Kembali</BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp :size="24" class="text-green-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Pemasukan</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(totalCollectedFund) }}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <TrendingDown :size="24" class="text-red-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(totalExpense) }}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users :size="24" class="text-blue-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pelanggan Aktif</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalSubscribers }}</p>
            </div>
          </div>
        </div>

        <!-- Tabel Pelanggan -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <Users :size="20" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Daftar Pelanggan</h3>
          </div>

          <!-- Search, Filter, Tambah -->
          <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div class="flex flex-row gap-3 w-full md:w-auto">
              <BaseSearch v-model="searchQuery" placeholder="Cari Pelanggan..." class="flex-1 w-full" />
              <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
                <template #default>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                      <select v-model="queryParams.status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800">
                        <option :value="undefined">Semua</option>
                        <option :value="SocialProgramSubscriptionStatus.ACTIVE">Aktif</option>
                        <option :value="SocialProgramSubscriptionStatus.INACTIVE">Berhenti</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Urutkan</label>
                      <select v-model="queryParams.sortBy" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white">
                        <option :value="undefined">Bawaan (Terbaru)</option>
                        <option value="total_donation desc">Donasi Tertinggi</option>
                        <option value="total_donation asc">Donasi Terendah</option>
                        <option value="total_paid_periods desc">Periode Bayar Terbanyak</option>
                        <option value="total_paid_periods asc">Periode Bayar Tersedikit</option>
                      </select>
                    </div>
                  </div>
                </template>
              </BaseFilter>
            </div>
            <BaseButton
              v-if="!isChairman"
              variant="primary"
              class="w-full sm:w-auto justify-center"
              @click="isAddModalOpen = true"
            >
              <Plus :size="20" class="mr-1" />
              Tambah Pelanggan
            </BaseButton>
          </div>

          <BaseTable
            :loading="subLoading"
            loading-message="Memuat data pelanggan..."
            :is-empty="subscriptions.length === 0"
            empty-message="Belum ada pelanggan untuk program ini"
            :has-prev="!!pagination?.prevCursor"
            :has-next="!!pagination?.nextCursor"
            v-model:limit="queryParams.limit"
            :limit-options="limitOptions"
            @prev="handlePrevPage(pagination)"
            @next="handleNextPage(pagination)"
          >
            <template #empty-icon>
              <Users :size="96" class="mx-auto mb-2 text-gray-300" />
            </template>
            <template #headers>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pelanggan</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Lama Berlangganan</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Total Donasi</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">Aksi</th>
            </template>
            <template #rows>
              <tr
                v-for="(sub, index) in subscriptions"
                :key="sub.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
                  {{ pageOffset * queryParams.limit! + index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {{ sub.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider', getStatusColor(sub.status)]">
                    {{ formatStatus(sub.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300">
                  {{ sub.totalPaidPeriods }} periode
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300">
                  {{ formatCurrency(sub.totalDonation) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <BaseIconButton
                    :to="{ name: 'dashboard-social-program-subscription-invoices', params: { id: programId, subscriptionId: sub.id } }"
                    title="Lihat riwayat tagihan"
                    variant="info"
                  >
                    <Eye :size="18" />
                  </BaseIconButton>
                </td>
              </tr>
            </template>
          </BaseTable>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <p class="text-gray-500">Program tidak ditemukan atau terjadi kesalahan saat memuat data.</p>
        <BaseButton variant="primary" class="mt-4" @click="handleBack">Kembali ke Daftar</BaseButton>
      </div>
    </div>

    <!-- Add Offline Subscription Modal -->
    <AddOfflineSubscriptionModal
      :show="isAddModalOpen"
      :program-id="programId"
      :loading="createMutation.isPending.value"
      :errors="validationErrors"
      @close="isAddModalOpen = false"
      @submit="handleAddSubscription"
    />
  </DashboardLayout>

  <!-- APPROVE MODAL -->
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

  <!-- COMPLETE MODAL -->
  <ConfirmationModal
    :show="completeConfirmShow"
    :title="`Selesaikan ${program?.title}?`"
    message="Program ini akan ditandai sebagai Selesai. Tindakan ini tidak dapat dibatalkan."
    primary-button-text="Selesaikan"
    secondary-button-text="Batal"
    :icon="CheckCircle"
    :primary-button-loading="completeMutation.isPending.value"
    @primary="handleConfirmComplete"
    @secondary="completeConfirmShow = false"
    @close="completeConfirmShow = false"
  />
</template>
