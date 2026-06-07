<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { formatCurrency, formatStatus } from '@/utils/format'
import { Heart, Users, Baby, ChevronRight, Search, Loader2 } from 'lucide-vue-next'
import { useFinanceRecordSummary } from '@/composables/financeRecord/useFinanceRecordSummary'
import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { usePublishedSocialProgramList } from '@/composables/socialProgram/usePublishedSocialProgramList'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'

const router = useRouter()

const activeTab = ref<'donation' | 'social' | 'foster'>('donation')
const searchQuery = ref('')

const goToDetail = (type: 'donation' | 'social' | 'foster', slug: string) => {
  router.push({ name: 'report-detail', params: { type, slug } })
}

const hasLoadedDonation = ref(false)
const hasLoadedSocial = ref(false)
const hasLoadedFoster = ref(false)

watch(
  activeTab,
  (newVal) => {
    if (newVal === 'donation') hasLoadedDonation.value = true
    if (newVal === 'social') hasLoadedSocial.value = true
    if (newVal === 'foster') hasLoadedFoster.value = true
  },
  { immediate: true },
)

const donationPage = ref(1)
const socialPage = ref(1)
const fosterPage = ref(1)

const accumulatedDonation = ref<any[]>([])
const accumulatedSocial = ref<any[]>([])
const accumulatedFoster = ref<any[]>([])

const debouncedSearchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
  }, 500)
})

watch(debouncedSearchQuery, () => {
  donationPage.value = 1
  socialPage.value = 1
  fosterPage.value = 1
  
  accumulatedDonation.value = []
  accumulatedSocial.value = []
  accumulatedFoster.value = []
})

const donationParams = computed(() => ({ limit: 10, page: donationPage.value, search: debouncedSearchQuery.value }))
const socialParams = computed(() => ({ limit: 10, page: socialPage.value, search: debouncedSearchQuery.value }))
const fosterParams = computed(() => ({ limit: 10, page: fosterPage.value, search: debouncedSearchQuery.value }))

const { listQuery: donationQuery } = useDonationProgramList(donationParams, { enabled: hasLoadedDonation })
const { listQuery: socialQuery } = usePublishedSocialProgramList(socialParams, { enabled: hasLoadedSocial })
const { listQuery: fosterQuery } = useFosterChildrenList(fosterParams, false, { enabled: hasLoadedFoster })

watch(() => donationQuery.data.value, (newData) => {
  if (newData?.data?.donationPrograms) {
    if (donationPage.value === 1) {
      accumulatedDonation.value = [...newData.data.donationPrograms]
    } else {
      const existingIds = new Set(accumulatedDonation.value.map((i: any) => i.id))
      const newItems = newData.data.donationPrograms.filter((i: any) => !existingIds.has(i.id))
      accumulatedDonation.value.push(...newItems)
    }
  }
}, { immediate: true })

watch(() => socialQuery.data.value, (newData) => {
  if (newData?.data?.socialPrograms) {
    if (socialPage.value === 1) {
      accumulatedSocial.value = [...newData.data.socialPrograms]
    } else {
      const existingIds = new Set(accumulatedSocial.value.map((i: any) => i.id))
      const newItems = newData.data.socialPrograms.filter((i: any) => !existingIds.has(i.id))
      accumulatedSocial.value.push(...newItems)
    }
  }
}, { immediate: true })

watch(() => fosterQuery.data.value, (newData) => {
  if (newData?.data?.fosterChildren) {
    if (fosterPage.value === 1) {
      accumulatedFoster.value = [...newData.data.fosterChildren]
    } else {
      const existingIds = new Set(accumulatedFoster.value.map((i: any) => i.id))
      const newItems = newData.data.fosterChildren.filter((i: any) => !existingIds.has(i.id))
      accumulatedFoster.value.push(...newItems)
    }
  }
}, { immediate: true })

const { summaryQuery } = useFinanceRecordSummary()
const summary = computed(() => summaryQuery.data.value?.data)

const totalDonationExpense = computed(() => summary.value?.totalDonationProgramExpense || 0)
const totalSocialExpense = computed(() => summary.value?.totalSocialProgramExpense || 0)
const totalFosterExpense = computed(() => summary.value?.totalFosterChildrenExpense || 0)
const grandTotal = computed(
  () => totalDonationExpense.value + totalSocialExpense.value + totalFosterExpense.value,
)

const totalDonationProgramsCount = computed(() => summary.value?.totalDonationProgram || 0)
const totalSocialProgramsCount = computed(() => summary.value?.totalSocialProgram || 0)
const totalFosterChildrenCount = computed(() => summary.value?.totalFosterChildren || 0)

const filteredDonation = computed(() => accumulatedDonation.value)
const filteredSocial = computed(() => accumulatedSocial.value)
const filteredFoster = computed(() => accumulatedFoster.value)

const isAnyFetching = computed(() => {
  if (activeTab.value === 'donation') return donationQuery.isFetching.value
  if (activeTab.value === 'social') return socialQuery.isFetching.value
  if (activeTab.value === 'foster') return fosterQuery.isFetching.value
  return false
})

const hasNextPage = computed(() => {
  if (activeTab.value === 'donation') {
    const pag = donationQuery.data.value?.data?.pagination
    return pag ? pag.page < pag.totalPages : false
  }
  if (activeTab.value === 'social') {
    const pag = socialQuery.data.value?.data?.pagination
    return pag ? pag.page < pag.totalPages : false
  }
  if (activeTab.value === 'foster') {
    const pag = fosterQuery.data.value?.data?.pagination
    return pag ? pag.page < pag.totalPages : false
  }
  return false
})

const loadNextPage = () => {
  if (isAnyFetching.value) return

  if (activeTab.value === 'donation' && hasNextPage.value) {
    donationPage.value++
  } else if (activeTab.value === 'social' && hasNextPage.value) {
    socialPage.value++
  } else if (activeTab.value === 'foster' && hasNextPage.value) {
    fosterPage.value++
  }
}

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

watch(loadMoreTrigger, (el) => {
  if (observer) {
    observer.disconnect()
  }
  if (el) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadNextPage()
      }
    }, {
      rootMargin: '100px',
    })
    observer.observe(el)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 px-4 sm:px-8 lg:px-18 font-poppins">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-primary-500 mb-3 uppercase tracking-wide">
            Laporan Pengeluaran
          </h1>
          <p class="text-gray-500 max-w-2xl mx-auto">
            Transparansi penggunaan dana. Setiap rupiah yang Anda percayakan kami
            pertanggungjawabkan secara terbuka dan terperinci.
          </p>
        </div>

        <!-- Summary Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div
            class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-2 lg:col-span-1"
          >
            <p class="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">
              Total Pengeluaran
            </p>
            <p class="text-2xl font-black text-gray-900">{{ formatCurrency(grandTotal) }}</p>
            <p class="text-xs text-gray-400 mt-1">Semua program</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                <Heart :size="16" class="text-rose-500" />
              </div>
              <span class="text-xs font-medium text-gray-500">Donasi</span>
            </div>
            <p class="text-lg font-bold text-gray-900">
              {{ formatCurrency(totalDonationExpense) }}
            </p>
            <p class="text-xs text-gray-400">{{ totalDonationProgramsCount }} program</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users :size="16" class="text-blue-500" />
              </div>
              <span class="text-xs font-medium text-gray-500">Sosial</span>
            </div>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(totalSocialExpense) }}</p>
            <p class="text-xs text-gray-400">{{ totalSocialProgramsCount }} program</p>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Baby :size="16" class="text-emerald-500" />
              </div>
              <span class="text-xs font-medium text-gray-500">Anak Asuh</span>
            </div>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(totalFosterExpense) }}</p>
            <p class="text-xs text-gray-400">{{ totalFosterChildrenCount }} anak</p>
          </div>
        </div>

        <!-- Toolbar: Search -->
        <div class="mb-8">
          <div class="relative w-full sm:w-80">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari program atau nama anak asuh..."
              class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
            />
          </div>
        </div>

        <!-- Tabs -->
        <div
          class="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm mb-8 w-fit"
        >
          <button
            v-for="tab in [
              { key: 'donation', label: 'Program Donasi', icon: Heart },
              { key: 'social', label: 'Program Sosial', icon: Users },
              { key: 'foster', label: 'Anak Asuh', icon: Baby },
            ]"
            :key="tab.key"
            @click="((activeTab = tab.key as any), (searchQuery = ''))"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            :class="
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            "
          >
            <component :is="tab.icon" :size="15" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Donation Programs -->
        <template v-if="activeTab === 'donation'">
          <div v-if="filteredDonation.length > 0" class="space-y-4">
            <div
              v-for="program in filteredDonation"
              :key="program.id"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-100 transition-all duration-200 cursor-pointer"
              @click="goToDetail('donation', program.slug)"
            >
              <div class="flex items-center gap-5 p-5">
                <img
                  :src="program.coverImage"
                  :alt="program.title"
                  class="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 truncate">{{ program.title }}</h3>
                  <div class="flex items-center gap-4 mt-1 text-sm">
                    <span class="text-gray-400"
                      >Target:
                      <span class="text-gray-700 font-medium">{{
                        formatCurrency(program.fundTarget)
                      }}</span></span
                    >
                    <span class="text-gray-400"
                      >Terkumpul:
                      <span class="text-gray-700 font-medium">{{
                        formatCurrency(program.collectedFund)
                      }}</span></span
                    >
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs text-gray-400 mb-0.5">Total Pengeluaran</p>
                  <p class="text-xl font-black text-rose-500">
                    {{ formatCurrency(program.totalExpense!) }}
                  </p>
                </div>
                <div class="ml-2 p-2 rounded-lg text-gray-400">
                  <ChevronRight :size="20" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-24 text-gray-400">
            <Search :size="40" class="mx-auto mb-3 opacity-40" />
            <p>Tidak ada program donasi yang cocok.</p>
          </div>
        </template>

        <!-- Social Programs -->
        <template v-else-if="activeTab === 'social'">
          <div v-if="filteredSocial.length > 0" class="space-y-4">
            <div
              v-for="program in filteredSocial"
              :key="program.id"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-100 transition-all duration-200 cursor-pointer"
              @click="goToDetail('social', program.slug)"
            >
              <div class="flex items-center gap-5 p-5">
                <img
                  :src="program.coverImage"
                  :alt="program.title"
                  class="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 truncate">{{ program.title }}</h3>
                  <p class="text-sm text-gray-400 mt-1">
                    <span class="font-medium text-gray-600">{{ program.totalSubscribers }}</span>
                    pelanggan aktif
                  </p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs text-gray-400 mb-0.5">Total Pengeluaran</p>
                  <p class="text-xl font-black text-blue-500">
                    {{ formatCurrency(program.totalExpense!) }}
                  </p>
                </div>
                <div class="ml-2 p-2 rounded-lg text-gray-400">
                  <ChevronRight :size="20" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-24 text-gray-400">
            <Search :size="40" class="mx-auto mb-3 opacity-40" />
            <p>Tidak ada program sosial yang cocok.</p>
          </div>
        </template>

        <!-- Foster Children -->
        <template v-else-if="activeTab === 'foster'">
          <div v-if="filteredFoster.length > 0" class="space-y-4">
            <div
              v-for="child in filteredFoster"
              :key="child.id"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-100 transition-all duration-200 cursor-pointer"
              @click="goToDetail('foster', child.slug || '')"
            >
              <div class="flex items-center gap-5 p-5">
                <img
                  :src="child.profilePicture"
                  :alt="child.name"
                  class="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-emerald-100"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900">{{ child.name }}</h3>
                  <span
                    class="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold"
                  >
                    {{ formatStatus(child.category) }}
                  </span>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs text-gray-400 mb-0.5">Total Pengeluaran</p>
                  <p class="text-xl font-black text-emerald-600">
                    {{ formatCurrency(child.totalExpense!) }}
                  </p>
                </div>
                <div class="ml-2 p-2 rounded-lg text-gray-400">
                  <ChevronRight :size="20" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-24 text-gray-400">
            <Search :size="40" class="mx-auto mb-3 opacity-40" />
            <p>Tidak ada anak asuh yang cocok.</p>
          </div>
        </template>

        <!-- Infinite Scroll Trigger -->
        <div
          v-if="hasNextPage"
          ref="loadMoreTrigger"
          class="h-20 w-full flex items-center justify-center mt-6"
        >
          <Loader2 class="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
