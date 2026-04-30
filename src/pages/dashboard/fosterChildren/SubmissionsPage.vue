<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Baby } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import { Category, Gender, type FosterChildrenCandidate } from '@/types/fosterChildren'
import router from '@/router'
import { ROLES } from '@/const/roles'

const searchQuery = ref('')
const selectedGender = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')


const clearFilters = () => {
  searchQuery.value = ''
  selectedGender.value = 'all'
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

const genders = ['all', 'laki-laki', 'perempuan']
const categories = ['all', 'yatim', 'piatu', 'yatim piatu']

const path = window.location.pathname.toLowerCase()

const role = ref(
  path.includes('chairman')
    ? ROLES.CHAIRMAN
    : ROLES.SOCIAL_MANAGER
)

const statusByRole: Record<string, string[]> = {
  [ROLES.CHAIRMAN]: ['Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
  [ROLES.SOCIAL_MANAGER]: ['Diajukan', 'Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
}
const statuses = computed(() => {
  return ['all', ...(statusByRole[role.value] ?? [])]
})

const limit = ref(10)
const pageOffset = ref(0)
const pagination = ref({
  has_prev: false,
  has_next: false,
})

const handleNextPage = () => {}
const handlePrevPage = () => {}

const children = ref<FosterChildrenCandidate[]>([
  {
    id: '1',
    slug: 'faris-ahad',
    name: 'Faris Ahad',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    gender: Gender.male,
    category: Category.yatim,
    address: 'Jl. Melati No. 12 Bandung',
    birthPlace: 'Bandung',
    birthDate: '2014-05-10',
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submitterName: 'Choi Youngjae',
    submitterPhone: '081234567890',
    submitterAddress: 'Jl. Melati No.2 Bandung',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submittedBy: '',
    status: 'Diajukan',
    rejectionReason: '',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    submitterName: 'Jung Woojin',
    submitterPhone: '081234567891',
    submitterAddress: 'Jl Mawar No. 7 Garut',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'Tia Mutiara',
    slug: 'tia-mutiara',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Garut',
    birthDate: '2015-02-15',
    address: 'Jl. Mawar No. 5 Garut',
    isGraduated: false,
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Menunggu Verifikasi',
    rejectionReason: '',
    submittedBy: '',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    submitterName: 'Jang Juwang',
    submitterPhone: '081234567892',
    submitterAddress: 'Jl. Kenanga No. 8 Tasikmalaya',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'Ahmad Rizki',
    slug: 'ahmad-rizki',
    gender: Gender.male,
    category: Category.yatimPiatu,
    birthPlace: 'Tasikmalaya',
    birthDate: '2013-08-20',
    isGraduated: false,
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    profilePicture: 'https://i.pravatar.cc/150?img=4',
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submittedBy: '',
    rejectionReason: '',
    status: 'Disetujui',
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    submitterName: 'Park Sungho',
    submitterPhone: '081234567893',
    submitterAddress: 'Jl. Dahlia No.8 Cimahi',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'Laila Salsabila',
    slug: 'laila-salsabila',
    gender: Gender.female,
    category: Category.yatimPiatu,
    birthPlace: 'Cimahi',
    birthDate: '2016-11-30',
    address: 'Jl. Dahlia No. 3 Cimahi',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    isGraduated: false,
    submittedBy:'',
    rejectionReason: '',
    status: 'Ditolak',
    createdAt: '2024-01-04',
  },
])

const filteredChildren = computed(() => {
  let data = [...children.value]
  if (role.value === ROLES.CHAIRMAN) {
    data = data.filter((child) => child.status !== 'Diajukan')
  }
  if (selectedStatus.value !== 'all') {
    data = data.filter((child) => child.status === selectedStatus.value)
  }
  if (selectedGender.value !== 'all') {
    data = data.filter((child) => child.gender === selectedGender.value)
  }
  if (selectedCategory.value !== 'all') {
    data = data.filter((child) => child.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    data = data.filter((child) =>
      child.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return data
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Disetujui':
      return 'bg-green-100 text-green-800'
    case 'Menunggu Verifikasi':
      return 'bg-purple-100 text-purple-800'
    case 'Diajukan':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-red-100 text-red-800'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const handleView = (child: FosterChildrenCandidate) => {
  if (role.value === ROLES.CHAIRMAN) {
    router.push({
      name: 'dashboard-chairman-foster-children-submissions-detail',
      params: { id: child.id },
    })
  } else {
    router.push({
      name: 'dashboard-foster-children-submissions-detail',
      params: { id: child.id },
    })
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Ajuan Anak Asuh</template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Cari anak asuh..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="selectedGender !== 'all' || selectedCategory !== 'all'"
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Jenis Kelamin</label>
                      <select
                        v-model="selectedGender"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="gender in genders" :key="gender" :value="gender">
                          {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Kategori</label>
                      <select
                        v-model="selectedCategory"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="status in statuses" :key="status" :value="status">
                          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </template>
              </BaseFilter>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseTable
      class="mt-6"
      :loading="false"
      loading.message="Memuat data ajuan anak asuh..."
      :is-empty="filteredChildren.length === 0"
      empty-message="Belum ada data ajuan anak asuh"
      :has-prev="pagination?.has_prev"
      :has-next="pagination?.has_next"
      v-model.limit="limit"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <Baby :size="64" class="text-gray-400" />
      </template>

      <template #headers>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">No</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">
          Nama Anak Asuh
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Jenis Kelamin
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Kategori
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Tanggal Pengajuan
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Status</th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in filteredChildren"
          :key="child.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.gender }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.category }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ formatDate(child.createdAt) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-poppins border',
                getStatusColor(child.status),
              ]"
            >
              {{ child.status.charAt(0).toUpperCase() + child.status.slice(1) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center relative">
            <button
              @click="handleView(child)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
              title="Lihat Detail"
            >
              <Eye :size="18" />
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </DashboardLayout>
</template>
