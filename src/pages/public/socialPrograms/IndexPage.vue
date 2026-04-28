<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import { ref, computed } from 'vue'
import SocialProgramCard from '@/components/molecules/SocialProgramCard.vue'

const searchQuery = ref('')

const programs = ref([
  {
    id: 1,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?1',
  },
  {
    id: 2,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?2',
  },
  {
    id: 3,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?3',
  },
  {
    id: 4,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?4',
  },
  {
    id: 5,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?5',
  },
  {
    id: 6,
    title: 'Santunan Rutin Anak Yatim Piatu & Dhuafa Setiap Bulan',
    minimum: 500000,
    image: 'https://picsum.photos/400/250?6',
  },
])

const filteredPrograms = computed(() =>
  programs.value.filter((p) => p.title.toLowerCase().includes(searchQuery.value.toLowerCase())),
)
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-4 font-[var(--font-poppins)]">
      <div class="max-w-7xl mx-auto">
        <!-- TITLE -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-[var(--color-primary-500)] mb-3">PROGRAM SOSIAL</h1>

          <p class="text-gray-500 max-w-2xl mx-auto">
            Mari berpartisipasi dalam berbagai program sosial untuk membantu saudara kita yang
            membutuhkan. Sedekah Anda akan menjadi kebaikan yang terus mengalir.
          </p>
        </div>

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-10">
          <div class="flex items-center gap-3 w-full max-w-xl">
            <!-- Search -->
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Mau konsisten sedekah untuk siapa?"
                class="w-full border border-gray-300 rounded-full py-3 px-5 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
              />

              <svg
                class="w-5 h-5 text-gray-400 absolute right-4 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </div>

            <!-- SORT -->
            <button
              class="w-11 h-11 bg-[var(--color-primary-300)] hover:bg-[var(--color-primary-400)] transition text-white rounded-full flex items-center justify-center shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4h18M6 8h12M10 12h4M12 16h0M14 20h-4"
                />
              </svg>
            </button>

            <!-- FILTER -->
            <button
              class="w-11 h-11 bg-[var(--color-primary-300)] hover:bg-[var(--color-primary-400)] transition text-white rounded-full flex items-center justify-center shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4h18l-7 8v6l-4 2v-8L3 4z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SocialProgramCard
            v-for="program in filteredPrograms"
            :key="program.id"
            :program="program"
          />

          <!-- EMPTY STATE -->
          <div
            v-if="filteredPrograms.length === 0"
            class="col-span-3 text-center py-16 text-gray-400"
          >
            Program tidak ditemukan.
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
