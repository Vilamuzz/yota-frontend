<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string
const program = route.query.program ? JSON.parse(route.query.program as string) : null

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
          <button
            @click="handleBack"
            class="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft :size="24" />
          </button>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ program?.name }}</h2>
          </div>
        </div>
      </div>

      <!-- DETAIL CARDS -->
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

                    <!-- icon mata -->
                    <button class="text-gray-400 hover:text-gray-700">
                    👁️
                    </button>
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

            <!-- Status -->
            <div>
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
        <div class="flex justify-end mt-8">
        <BaseButton variant="primary" @click="handleEdit" :loading="isLoading">
            Edit
          </BaseButton>
        </div>
        </div>

    </div>
  </DashboardLayout>
</template>
