<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Pencil, HandHeart, CalendarDays, Tag, Layout } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useDonationProgramAdminDetail } from '@/composables/donationProgram/useDonationProgramAdminDetail'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { DonationProgramCategoryEnum, DonationProgramStatusEnum } from '@/types/donationProgram'

const router = useRouter()
const route = useRoute()
const donationId = route.params.id as string

const { detailQuery, isDonationLoading } = useDonationProgramAdminDetail(donationId)

const donation = computed(() => detailQuery.data.value?.data || null)

const formatCategory = (cat: DonationProgramCategoryEnum) => {
  if (cat === DonationProgramCategoryEnum.EDUCATION) return 'Pendidikan'
  if (cat === DonationProgramCategoryEnum.HEALTH) return 'Kesehatan'
  if (cat === DonationProgramCategoryEnum.ENVIRONMENT) return 'Lingkungan'
  if (cat === DonationProgramCategoryEnum.SOCIAL) return 'Sosial'
  if (cat === DonationProgramCategoryEnum.DISASTER) return 'Bencana'
  if (cat === DonationProgramCategoryEnum.HUMANITY) return 'Kemanusiaan'
  if (cat === DonationProgramCategoryEnum.OTHER) return 'Lainnya'
  return cat
}

const progressPercent = computed(() => {
  const collected = donation.value?.collectedFund ?? 0
  const target = donation.value?.fundTarget ?? 0
  if (!target || target <= 0) return 0
  return Math.min((collected / target) * 100, 100)
})

const isEditable = computed(() => {
  if (!donation.value) return false
  return (
    donation.value.status !== DonationProgramStatusEnum.COMPLETED &&
    donation.value.status !== DonationProgramStatusEnum.EXPIRED &&
    donation.value.status !== DonationProgramStatusEnum.ARCHIVED
  )
})

const handleEdit = () => {
  router.push({
    name: 'dashboard-donation-programs-edit',
    params: { id: donationId },
  })
}

const handleBack = () => {
  router.push({ name: 'dashboard-donation-programs' })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Program Donasi</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading Skeleton -->
      <div
        v-if="isDonationLoading && !donation"
        class="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div
          class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-gray-500 text-sm animate-pulse">Memuat detail program donasi...</p>
      </div>

      <!-- Detail View -->
      <div v-else-if="donation" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <HandHeart :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Program
              </h3>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                >
                  Judul Program
                </label>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ donation.title }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                  >
                    Kategori
                  </label>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCategory(donation.category) }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                  >
                    Status
                  </label>
                  <div
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit',
                      getStatusColor(donation.status),
                    ]"
                  >
                    {{ formatStatus(donation.status) }}
                  </div>
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
                  {{ donation.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Target & collected Details Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <Tag :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Detail Dana & Target
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
                >
                  Target Dana
                </label>
                <p class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(donation.fundTarget) }}
                </p>
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
                >
                  Dana Terkumpul
                </label>
                <p class="text-xl font-bold text-primary-500 dark:text-primary-300">
                  {{ formatCurrency(donation.collectedFund) }}
                </p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-300 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
              <div
                class="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium"
              >
                <span>Progres: {{ Math.round(progressPercent) }}%</span>
                <span
                  >Selisih:
                  {{
                    formatCurrency(Math.max(0, donation.fundTarget - donation.collectedFund))
                  }}</span
                >
              </div>
            </div>

            <!-- Timeline dates -->
            <div class="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-gray-700">
              <div class="flex items-start gap-3">
                <CalendarDays class="text-gray-400 mt-0.5" :size="18" />
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tanggal Mulai
                  </label>
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {{ formatDate(donation.startDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <CalendarDays class="text-gray-400 mt-0.5" :size="18" />
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tanggal Selesai
                  </label>
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {{ formatDate(donation.endDate) }}
                  </p>
                </div>
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
              class="relative w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-900"
            >
              <img
                v-if="donation.coverImage"
                :src="donation.coverImage"
                :alt="donation.title"
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
              <BaseButton
                v-if="isEditable"
                variant="primary"
                class="w-full flex items-center justify-center gap-2"
                @click="handleEdit"
              >
                <Pencil :size="16" />
                Edit Program
              </BaseButton>

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
          Program donasi tidak ditemukan atau terjadi kesalahan saat memuat data.
        </p>
        <BaseButton variant="primary" class="mt-4" @click="handleBack">
          Kembali ke Daftar
        </BaseButton>
      </div>
    </div>
  </DashboardLayout>
</template>
