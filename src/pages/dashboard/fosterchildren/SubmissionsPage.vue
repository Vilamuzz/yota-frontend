<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import BaseSearch from '@/components/atoms/BaseSearch.vue';
import BaseFilter from '@/components/atoms/BaseFilter.vue';
import BaseTable from '@/components/molecules/BaseTable.vue';

const searchQuery = ref('')
const selectedGender = ref('all')
const selectedCategory = ref('all')

const clearFilters = () => {
  searchQuery.value = ''
  selectedGender.value = 'all'
  selectedCategory.value = 'all'
}

const genders = ['all', 'laki-laki', 'perempuan']
const categories = ['all', 'yatim', 'piatu', 'yatim piatu']
</script>

<template>
  <DashboardLayout>
    <template #title>Ajuan Anak Asuh</template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Cari anak asuh..."/>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="selectedGender !== 'all' || selectedCategory !== 'all'"
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Jenis Kelamin</label>
                      <select v-model="selectedGender"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option v-for="gender in genders" :key="gender" :value="gender">
                        {{  gender.charAt(0).toUpperCase() + gender.slice(1) }}
                      </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Kategori</label>
                      <select v-model="selectedCategory"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option v-for="category in categories" :key="category" :value="category">
                        {{  category.charAt(0).toUpperCase() + category.slice(1) }}
                      </option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150">
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

    <BaseTable></BaseTable>
  </DashboardLayout>
</template>
