<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Loader2,
  User,
  GraduationCap,
  FileText,
  FileCheck,
  MapPin,
  Calendar,
  School,
  Tag,
  Pencil,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { getStatusColor } from '@/utils/statusColor'
import { useAdminFosterChildrenDetail } from '@/composables/fosterChildren/useFosterChildrenAdminDetail'

const route = useRoute()
const router = useRouter()

const fosterChildId = route.params.id as string

const { detailQuery } = useAdminFosterChildrenDetail(fosterChildId)

const child = computed(() => detailQuery.data.value?.data)

const formatCategory = (value?: string) => {
  if (!value) return '-'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const educationLabel = computed(() => {
  if (!child.value?.educationLevel) return '-'
  return `Kelas ${child.value.educationLevel}`
})
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Anak Asuh</template>

    <div v-if="detailQuery.isPending.value" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="animate-spin w-10 h-10 text-primary-500"/>
      <p class="mt-4 text-gray-500">Memuat data...</p>
    </div>

    <div v-else-if="child" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div class="flex items-center gap-3 border-b pb-4 mb-6">
            <div class="p-2 rounded-lg bg-primary-50 text-primary-500">
              <User :size="20"/>
            </div>

            <h3 class="font-bold uppercase tracking-wider text-sm">
              Identitas Anak
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-xs uppercase text-gray-400">Nama Lengkap</p>
              <p class="font-semibold mt-1">{{ child.name }}</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Jenis Kelamin</p>
              <p class="font-semibold mt-1">{{ formatCategory(child.gender) }}</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Kategori</p>
              <p class="font-semibold mt-1">{{ formatCategory(child.category) }}</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Tempat Lahir</p>
              <p class="font-semibold mt-1">{{ child.birthPlace }}</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Tanggal Lahir</p>
              <div class="flex items-center gap-2 mt-1">
                <Calendar
                  :size="16"
                  class="text-primary-500"
                />
                <span class="font-semibold">{{ child.birthDate }}</span>
              </div>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Sekolah</p>
              <div class="flex items-center gap-2 mt-1">
                <School
                  :size="16"
                  class="text-primary-500"
                />
                <span class="font-semibold">{{ child.schoolName }}</span>
              </div>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Tingkat Pendidikan</p>
              <div class="flex items-center gap-2 mt-1">
                <GraduationCap
                  :size="16"
                  class="text-primary-500"
                />
                <span class="font-semibold"> {{ educationLabel }}</span>
              </div>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400"> Status</p>
              <span
                class="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold"
                :class="child.isGraduated
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'"
              >
                {{ child.isGraduated ? 'Lulus' : 'Masih Sekolah' }}
              </span>
            </div>
          </div>

          <div class="mt-8">
            <p class="text-xs uppercase text-gray-400">Alamat</p>
            <div class="flex gap-2 mt-2">
              <MapPin
                :size="18"
                class="text-primary-500 mt-1 shrink-0"
              />
              <p class="font-medium">{{ child.address }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Tag :size="20"/>
            </div>
            <h3 class="font-bold uppercase tracking-wider text-sm">Prestasi</h3>
          </div>
          <div v-if="child.achievements?.length" class="space-y-3">
            <div
              v-for="achievement in child.achievements"
              :key="achievement.id"
              class="flex justify-between items-center rounded-xl border p-4"
            >
              <div class="flex items-center gap-3">
                <FileCheck
                  class="text-primary-500"
                  :size="20"
                />
                <div>
                  <p class="font-semibold">{{ achievement.title }}</p>
                </div>
              </div>
              <a
                :href="achievement.url"
                target="_blank"
                class="text-primary-500 hover:underline"
              >
                Lihat
              </a>
            </div>
          </div>

          <div v-else class="py-8 text-center text-gray-400">
            Belum memiliki prestasi.
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div class="flex justify-center">
            <img
              v-if="child.profilePicture"
              :src="child.profilePicture"
              class="w-44 h-44 rounded-full object-cover border-4 border-primary-100"
            />

            <div v-else class="w-44 h-44 rounded-full bg-gray-100 flex items-center justify-center">
              <User
                :size="70"
                class="text-gray-400"
              />
            </div>
          </div>

          <div class="text-center mt-5">
            <h2 class="text-xl font-bold">{{ child.name }}</h2>
            <p class="text-gray-500 mt-1">{{ child.schoolName }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 class="text-sm uppercase font-bold tracking-wider mb-5">Dokumen</h3>
          <div class="space-y-3">
            <a
              v-if="child.familyCard"
              :href="child.familyCard"
              target="_blank"
              class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div class="flex items-center gap-3">
                <FileText
                  :size="20"
                  class="text-primary-500"
                />
                <span class="font-medium">Kartu Keluarga</span>
              </div>

              <span class="text-primary-500 text-sm font-semibold">
                Lihat
              </span>
            </a>
            <a
              v-if="child.sktm"
              :href="child.sktm"
              target="_blank"
              class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div class="flex items-center gap-3">
                <FileText
                  :size="20"
                  class="text-primary-500"
                />
                <span class="font-medium">Surat Keterangan Tidak Mampu</span>
              </div>

              <span class="text-primary-500 text-sm font-semibold">Lihat</span>
            </a>

            <div
              v-if="!child.familyCard && !child.sktm"
              class="text-center py-6 text-gray-400 text-sm"
            >
              Dokumen belum tersedia.
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 class="text-sm uppercase font-bold tracking-wider mb-4">Status Anak</h3>
          <div class="flex items-center justify-between">
            <span>Status Anak Asuh</span>
            <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(child.isGraduated ? 'completed' : 'active'),
                ]"
              >
                <GraduationCap v-if="child.isGraduated" :size="12" />
                {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
              </span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div class="space-y-3">
            <BaseButton variant="primary" class="w-full"
              @click="
                router.push({name: 'dashboard-foster-children-edit',params: {id: child.id}})"
            >
              <Pencil
                :size="18"
                class="mr-2"
              />
              Edit Data
            </BaseButton>

            <BaseButton
                variant="outline"
                class="w-full flex items-center justify-center gap-2"
                @click="router.push({ name: 'dashboard-foster-children-transaction-detail',params: {id: child.id} })"
              >
                <TrendingUp :size="16" class="text-green-500" />
                Lihat Pemasukan
              </BaseButton>

              <BaseButton
                variant="outline"
                class="w-full flex items-center justify-center gap-2"
              >
                <TrendingDown :size="16" class="text-red-500" />
                Lihat Pengeluaran
              </BaseButton>

            <BaseButton variant="outline" class="w-full" @click="router.back()">
              Kembali
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
