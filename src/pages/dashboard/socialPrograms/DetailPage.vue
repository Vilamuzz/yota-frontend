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
  Receipt,
  File,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import AddOfflineSubscriptionModal from '@/components/molecules/AddOfflineSubscriptionModal.vue'
import ExpenseDetailModal from '@/components/molecules/ExpenseDetailModal.vue'
import FilePreviewModal from '@/components/molecules/FilePreviewModal.vue'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { useSocialProgramSubscriptionList } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionList'
import { useSocialProgramSubscriptionCreate } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionCreate'
import { useSocialProgramExpenseList } from '@/composables/socialProgramExpense/useSocialProgramExpenseList'
import { useSocialProgramExpenseDetail } from '@/composables/socialProgramExpense/useSocialProgramExpenseDetail'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { SocialProgramSubscriptionStatus } from '@/types/socialProgramSubscription'
import type {
  SocialProgramSubscriptionQueryParams,
  CreateOfflineSocialProgramSubscriptionRequest,
} from '@/types/socialProgramSubscription'
import type {
  SocialProgramExpense,
  SocialProgramExpenseQueryParams,
} from '@/types/socialProgramExpense'
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

// ── Subscription table ──────────────────────────────────────────
const subParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
  sortBy: undefined,
})

const {
  subscriptions,
  pagination: subPagination,
  isLoading: subLoading,
} = useSocialProgramSubscriptionList(programId, subParams)

const {
  pageOffset: subPageOffset,
  resetPagination: subResetPagination,
  handleNextPage: subNextPage,
  handlePrevPage: subPrevPage,
} = useCursorPagination(subParams)

const subLimitOptions = [10, 25, 50, 100]
const subSearchQuery = ref('')
let subSearchTimeout: ReturnType<typeof setTimeout>
watch(subSearchQuery, (val) => {
  clearTimeout(subSearchTimeout)
  subSearchTimeout = setTimeout(() => {
    subParams.search = val || undefined
    subResetPagination()
  }, 400)
})
watch(
  () => [subParams.status, subParams.sortBy, subParams.limit],
  () => subResetPagination(),
)
const hasSubFilters = computed(
  () => subParams.status !== undefined || subParams.sortBy !== undefined,
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

// ── Expense table (read-only) ───────────────────────────────────
const expParams = reactive<SocialProgramExpenseQueryParams>({
  limit: 10,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
  sortBy: undefined,
})

const {
  socialProgramExpenses,
  pagination: expPagination,
  isLoading: expLoading,
} = useSocialProgramExpenseList(programId, expParams)

const displayedTotalExpense = computed(() => {
  const sum = socialProgramExpenses.value.reduce((total, expense) => {
    return total + Number(expense.amount || 0)
  }, 0)

  return sum > 0 ? sum : program.value?.totalExpense ?? 0
})

const {
  pageOffset: expPageOffset,
  resetPagination: expResetPagination,
  handleNextPage: expNextPage,
  handlePrevPage: expPrevPage,
} = useCursorPagination(expParams)

const expLimitOptions = [10, 25, 50, 100]
const expSearchInput = ref('')
let expSearchTimeout: ReturnType<typeof setTimeout>
watch(expSearchInput, (val) => {
  clearTimeout(expSearchTimeout)
  expSearchTimeout = setTimeout(() => {
    expParams.search = val || undefined
    expResetPagination()
  }, 400)
})
watch(
  () => [expParams.limit, expParams.sortBy],
  () => expResetPagination(),
)
const hasExpFilters = computed(
  () => expParams.search !== undefined || expParams.sortBy !== undefined,
)

// Expense detail & file preview modal
const isDetailModalOpen = ref(false)
const isFilePreviewModalOpen = ref(false)
const selectedFileUrl = ref<string | null>(null)
const selectedExpenseDetail = ref<SocialProgramExpense | null>(null)
const selectedExpenseIdForDetail = ref<string>('')
const { detailQuery: expenseDetailQuery } = useSocialProgramExpenseDetail(
  selectedExpenseIdForDetail,
)
const modalExpenseData = computed(
  () => expenseDetailQuery.data.value?.data || selectedExpenseDetail.value,
)

function openDetailModal(expense: SocialProgramExpense) {
  selectedExpenseDetail.value = expense
  selectedExpenseIdForDetail.value = expense.id
  isDetailModalOpen.value = true
}
function openFilePreviewModal(fileUrl: string) {
  selectedFileUrl.value = fileUrl
  isFilePreviewModalOpen.value = true
}

// ── Summary ─────────────────────────────────────────────────────
const totalCollectedFund = computed(() => {
  return subscriptions.value.reduce((total, subscription) => {
    const donation = Number(subscription.totalDonation || 0)
    if (donation <= 0) return total

    if (subscription.status === SocialProgramSubscriptionStatus.ACTIVE) {
      return total + donation
    }

    return total + 0
  }, 0)
})
const totalExpense = computed(() => displayedTotalExpense.value)
const totalSubscribers = computed(() => program.value?.totalSubscribers ?? 0)

// ── Program actions ─────────────────────────────────────────────
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

const completeConfirmShow = ref(false)
const handleComplete = () => {
  completeConfirmShow.value = true
}
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

const handleEdit = () =>
  router.push({ name: 'dashboard-social-programs-edit', params: { id: programId } })
const handleBack = () => router.push({ name: 'dashboard-social-programs' })
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Program Berkelanjutan</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading -->
      <div
        v-if="isLoading && !program"
        class="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div
          class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-gray-500 text-sm animate-pulse">Memuat detail program...</p>
      </div>

      <template v-else-if="program">
        <!-- Top Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Informasi Utama -->
            <div
              class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
            >
              <div
                class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700"
              >
                <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                  <Layout :size="20" />
                </div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                >
                  Informasi Program
                </h3>
              </div>
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                    >Judul Program</label
                  >
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ program.title }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                    >Status</label
                  >
                  <div
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit',
                      getStatusColor(program.status),
                    ]"
                  >
                    {{ formatStatus(program.status) }}
                  </div>
                </div>
                  <div v-if="program.status === SocialProgramStatusEnum.REJECTED && program.rejectionReason">
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                    >Alasan Penolakan</label
                  >
                  <div class="px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-sm text-red-700 dark:text-red-300">
                    {{ program.rejectionReason }}
                  </div>
                </div>
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                    >Deskripsi Program</label
                  >
                  <div
                    class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                  >
                    {{ program.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Konfigurasi Pembayaran -->
            <div
              class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
            >
              <div
                class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700"
              >
                <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                  <CreditCard :size="20" />
                </div>
                <h3
                  class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                >
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
                      >Minimal Nominal</label
                    >
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
                      >Hari Penagihan</label
                    >
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
                <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Program ini ditambahkan pada {{ formatDate(program.createdAt) }}.
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Gambar + Aksi -->
          <div class="space-y-6">
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
            <div
              class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
            >
              <div class="flex flex-col gap-3">
                <template v-if="isChairman && program.status === SocialProgramStatusEnum.PENDING">
                  <BaseButton
                    variant="primary"
                    class="w-full flex items-center justify-center gap-2"
                    :loading="approveMutation.isPending.value"
                    @click="handleApprove"
                  >
                    <Check :size="16" /> Terima Program
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    class="w-full flex items-center justify-center gap-2"
                    :loading="rejectMutation.isPending.value"
                    @click="handleReject"
                  >
                    <X :size="16" /> Tolak Program
                  </BaseButton>
                </template>
                <template v-else-if="!isChairman">
                  <BaseButton
                    v-if="
                      program.status !== SocialProgramStatusEnum.COMPLETED &&
                      program.status !== SocialProgramStatusEnum.REJECTED
                    "
                    variant="primary"
                    class="w-full flex items-center justify-center gap-2"
                    @click="handleEdit"
                  >
                    <Pencil :size="16" /> Edit Program
                  </BaseButton>
                  <BaseButton
                    v-if="program.status === SocialProgramStatusEnum.ACTIVE"
                    variant="primary"
                    class="w-full flex items-center justify-center gap-2"
                    :loading="completeMutation.isPending.value"
                    @click="handleComplete"
                  >
                    <CheckCircle :size="16" /> Selesaikan Program
                  </BaseButton>
                </template>
                <BaseButton variant="outline" class="w-full" @click="handleBack"
                  >Kembali</BaseButton
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4"
          >
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp :size="24" class="text-green-500" />
            </div>
            <div>
              <p
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
              >
                Total Pemasukan
              </p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(totalCollectedFund) }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4"
          >
            <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <TrendingDown :size="24" class="text-red-500" />
            </div>
            <div>
              <p
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
              >
                Total Pengeluaran
              </p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(totalExpense) }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4"
          >
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users :size="24" class="text-blue-500" />
            </div>
            <div>
              <p
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
              >
                Pelanggan Aktif
              </p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalSubscribers }}</p>
            </div>
          </div>
        </div>

        <!-- Tabel Pelanggan -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
        >
          <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <Users :size="20" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Daftar Pelanggan
            </h3>
          </div>

          <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div class="flex flex-row gap-3 w-full md:w-auto">
              <BaseSearch
                v-model="subSearchQuery"
                placeholder="Cari Pelanggan..."
                class="flex-1 w-full"
              />
              <BaseFilter :has-active-filters="hasSubFilters" class="w-auto shrink-0">
                <template #default>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                        >Status</label
                      >
                      <select
                        v-model="subParams.status"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                      >
                        <option :value="undefined">Semua</option>
                        <option :value="SocialProgramSubscriptionStatus.ACTIVE">Aktif</option>
                        <option :value="SocialProgramSubscriptionStatus.INACTIVE">Berhenti</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                        >Urutkan</label
                      >
                      <select
                        v-model="subParams.sortBy"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      >
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
              <Plus :size="20" class="mr-1" /> Tambah Pelanggan
            </BaseButton>
          </div>

          <BaseTable
            :loading="subLoading"
            loading-message="Memuat data pelanggan..."
            :is-empty="subscriptions.length === 0"
            empty-message="Belum ada pelanggan untuk program ini"
            :has-prev="!!subPagination?.prevCursor"
            :has-next="!!subPagination?.nextCursor"
            v-model:limit="subParams.limit"
            :limit-options="subLimitOptions"
            @prev="subPrevPage(subPagination)"
            @next="subNextPage(subPagination)"
          >
            <template #empty-icon><Users :size="96" class="mx-auto mb-2 text-gray-300" /></template>
            <template #headers>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">
                No
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nama Pelanggan
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Lama Berlangganan
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Total Donasi
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
                Aksi
              </th>
            </template>
            <template #rows>
              <tr
                v-for="(sub, index) in subscriptions"
                :key="sub.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200"
                >
                  {{ subPageOffset * subParams.limit! + index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {{ sub.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
                      getStatusColor(sub.status),
                    ]"
                  >
                    {{ formatStatus(sub.status) }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ sub.totalPaidPeriods }} periode
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ formatCurrency(sub.totalDonation) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <BaseIconButton
                    :to="{
                      name: 'dashboard-social-program-subscription-invoices',
                      params: { id: programId, subscriptionId: sub.id },
                    }"
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

        <!-- Tabel Pengeluaran (Read-Only) -->
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
        >
          <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
              <Receipt :size="20" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Rincian Pengeluaran
            </h3>
          </div>

          <div class="flex flex-row gap-3 w-full md:w-auto">
            <BaseSearch
              v-model="expSearchInput"
              placeholder="Cari pengeluaran..."
              class="flex-1 w-full"
            />
            <BaseFilter :has-active-filters="hasExpFilters" class="w-auto shrink-0">
              <template #default>
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                      >Urutkan</label
                    >
                    <select
                      v-model="expParams.sortBy"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    >
                      <option :value="undefined">Bawaan (Terbaru)</option>
                      <option value="created_at asc">Terlama Dibuat</option>
                      <option value="title asc">Judul (A-Z)</option>
                      <option value="title desc">Judul (Z-A)</option>
                      <option value="amount asc">Nominal Terendah</option>
                      <option value="amount desc">Nominal Tertinggi</option>
                      <option value="expense_date desc">Tanggal Pengeluaran (Terbaru)</option>
                      <option value="expense_date asc">Tanggal Pengeluaran (Terlama)</option>
                    </select>
                  </div>
                </div>
              </template>
            </BaseFilter>
          </div>

          <BaseTable
            :loading="expLoading"
            loading-message="Memuat data pengeluaran..."
            :is-empty="socialProgramExpenses.length === 0"
            empty-message="Belum ada data pengeluaran untuk program ini"
            :has-prev="!!expPagination?.prevCursor"
            :has-next="!!expPagination?.nextCursor"
            v-model:limit="expParams.limit"
            :limit-options="expLimitOptions"
            @prev="expPrevPage(expPagination)"
            @next="expNextPage(expPagination)"
          >
            <template #empty-icon
              ><Receipt :size="96" class="mx-auto mb-2 text-gray-300"
            /></template>
            <template #headers>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">
                No
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Judul
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Nominal
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Tanggal Pengeluaran
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Bukti
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
                Aksi
              </th>
            </template>
            <template #rows>
              <tr
                v-for="(expense, index) in socialProgramExpenses"
                :key="expense.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200"
                >
                  {{ expPageOffset * expParams.limit! + index + 1 }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium max-w-xs truncate text-gray-600 dark:text-gray-200"
                >
                  {{ expense.title }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
                >
                  {{ formatCurrency(expense.amount) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
                >
                  {{ formatDate(expense.expenseDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    v-if="expense.proofFile"
                    @click="openFilePreviewModal(expense.proofFile)"
                    class="p-1 hover:bg-green-50 text-green-500 rounded transition-colors duration-150 inline-block dark:hover:bg-green-900/20"
                    title="Lihat bukti pengeluaran"
                  >
                    <File :size="18" />
                  </button>
                  <span v-else class="text-gray-500 dark:text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <BaseIconButton
                    @click="openDetailModal(expense)"
                    title="Lihat detail pengeluaran"
                    variant="primary"
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

    <!-- Add Offline Subscription Modal -->
    <AddOfflineSubscriptionModal
      :show="isAddModalOpen"
      :program-id="programId"
      :loading="createMutation.isPending.value"
      :errors="validationErrors"
      @close="isAddModalOpen = false"
      @submit="handleAddSubscription"
    />

    <!-- Expense Detail Modal -->
    <ExpenseDetailModal
      :show="isDetailModalOpen"
      :expense="modalExpenseData"
      @close="isDetailModalOpen = false"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
      :show="isFilePreviewModalOpen"
      :file-url="selectedFileUrl"
      @close="isFilePreviewModalOpen = false"
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
