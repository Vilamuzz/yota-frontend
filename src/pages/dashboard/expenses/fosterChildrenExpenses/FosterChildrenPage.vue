<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Baby } from 'lucide-vue-next'
import { useFosterChildrenFilters } from '@/composables/fosterChildren/useFosterChildrenFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { formatDate } from '@/utils/format'

const {
  queryParams,
  limitOptions,
  genders,
  categories,
  statuses,
  searchQuery,
  pageOffset,
  fosterChildren,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
  clearFilters,
} = useFosterChildrenFilters()
</script>

<template>
  <DashboardLayout>
    <template #title>Pengeluaran Anak Asuh</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari anak asuh..."
            class="w-full sm:w-64"
          />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Jenis Kelamin</label
                  >
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="gender in genders" :key="gender" :value="gender">
                      {{ gender }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Kategori</label
                  >
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.isGraduated"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option
                      v-for="status in statuses"
                      :key="String(status.value)"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data anak asuh..."
        :is-empty="fosterChildren.length === 0"
        empty-message="Tidak ada data anak asuh"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Baby :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Jenis Kelamin
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Lahir
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(child, index) in fosterChildren"
            :key="child.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {{ child.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
              {{ child.gender }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full dark:bg-gray-700 dark:text-gray-300"
              >
                {{ child.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(child.birthDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <RouterLink
                  :to="{
                    name: 'dashboard-foster-children-expense-transaction',
                    params: { id: child.id },
                  }"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Lihat transaksi"
                >
                  <Eye :size="18" />
                </RouterLink>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
