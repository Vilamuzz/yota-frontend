<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import { ref, reactive, watch } from 'vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import SocialProgramCard from '@/components/molecules/SocialProgramCard.vue'
import { usePublishedSocialProgramList } from '@/composables/socialProgram/usePublishedSocialProgramList'
import type { SocialProgramQueryParams } from '@/types/socialProgram'

const searchQuery = ref('')
const queryParams = reactive<SocialProgramQueryParams>({
  limit: 12,
  search: undefined,
})

const { socialPrograms, isLoading } = usePublishedSocialProgramList(queryParams)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
  }, 400)
})
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-18 font-poppins">
      <div class="max-w-7xl mx-auto">
        <!-- TITLE -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-500 mb-3">PROGRAM SOSIAL</h1>

          <p class="text-gray-500 max-w-2xl mx-auto">
            Mari berpartisipasi dalam berbagai program sosial untuk membantu saudara kita yang
            membutuhkan. Sedekah Anda akan menjadi kebaikan yang terus mengalir.
          </p>
        </div>

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-10">
          <BasePublicSearch v-model="searchQuery" />
        </div>

        <!-- GRID -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-xl h-80 animate-pulse border border-gray-200"
          ></div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SocialProgramCard
            v-for="program in socialPrograms"
            :key="program.id"
            :program="program"
          />

          <!-- EMPTY STATE -->
          <div
            v-if="socialPrograms.length === 0"
            class="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16"
          >
            <div class="bg-white rounded-2xl p-12 border border-dashed border-gray-300">
              <p class="text-gray-400">Program tidak ditemukan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
