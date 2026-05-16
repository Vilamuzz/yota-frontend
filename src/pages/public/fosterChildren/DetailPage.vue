<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { useFosterChildrenDetail } from '@/composables/fosterChildren/useFosterChildrenDetail'
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Award,
  Heart,
  User,
  Info,
  ExternalLink,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const childId = computed(() => route.params.slug as string)

const { detailQuery } = useFosterChildrenDetail(childId)
const child = computed(() => detailQuery.data.value?.data)

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0
  const parts = birthDate.split('-')
  const [p1, p2, p3] = parts
  if (!p1 || !p2 || !p3) return 0

  let year: number, month: number, day: number
  if (p1.length === 4) {
    year = Number(p1)
    month = Number(p2)
    day = Number(p3)
  } else {
    day = Number(p1)
    month = Number(p2)
    year = Number(p3)
  }

  const today = new Date()
  const birth = new Date(year, month - 1, day)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--
  }
  return age
}

const handleBack = () => {
  router.push({ name: 'foster-children' })
}

const handleDonasi = () => {
  router.push({ name: 'foster-children-donation', params: { slug: childId.value } })
}

const formatCategory = (cat: string) => {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-10 font-poppins">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- Loading State -->
        <div v-if="detailQuery.isPending.value" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <BaseSkeleton variant="image" class="h-96 w-full rounded-3xl" />
          </div>
          <div class="lg:col-span-2 space-y-6">
            <BaseSkeleton variant="text-2xl" class="w-1/2" />
            <div class="space-y-4">
              <BaseSkeleton variant="text-sm" class="w-full" v-for="i in 4" :key="i" />
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="detailQuery.isError.value"
          class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100"
        >
          <div
            class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"
          >
            <Info :size="32" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p class="text-gray-500 mb-6 max-w-sm mx-auto">
            Terjadi kesalahan saat mencoba mengambil data anak asuh. Silakan coba lagi nanti.
          </p>
          <BaseButton variant="primary" @click="detailQuery.refetch()">Coba Lagi</BaseButton>
        </div>

        <!-- Content -->
        <div v-else-if="child" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
          <!-- Profile Sidebar -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-2">
              <div class="aspect-3/4 rounded-2xl overflow-hidden">
                <img
                  :src="child.profilePicture"
                  :alt="child.name"
                  class="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                />
              </div>
              <div class="p-6 text-center">
                <h1 class="text-2xl font-black text-gray-900 mb-2">{{ child.name }}</h1>
                <div class="flex items-center justify-center gap-2">
                  <span
                    class="px-3 py-1 bg-primary-50 text-primary-400 text-xs font-bold rounded-full uppercase tracking-wider"
                  >
                    {{ formatCategory(child.category) }}
                  </span>
                  <span
                    class="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider"
                  >
                    {{ calculateAge(child.birthDate) }} Tahun
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Info -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 class="font-bold text-gray-900 flex items-center gap-2">
                <Info :size="18" class="text-primary-300" />
                Informasi Singkat
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <MapPin :size="16" class="text-gray-400 mt-0.5" />
                  <div class="text-sm">
                    <p class="text-gray-400 text-[10px] font-bold uppercase">Asal</p>
                    <p class="text-gray-700">{{ child.birthPlace }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <User :size="16" class="text-gray-400 mt-0.5" />
                  <div class="text-sm">
                    <p class="text-gray-400 text-[10px] font-bold uppercase">Jenis Kelamin</p>
                    <p class="text-gray-700">{{ formatCategory(child.gender) }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <GraduationCap :size="16" class="text-gray-400 mt-0.5" />
                  <div class="text-sm">
                    <p class="text-gray-400 text-[10px] font-bold uppercase">Status Pendidikan</p>
                    <p class="text-gray-700">
                      {{ child.isGraduated ? 'Sudah Lulus' : 'Masih Bersekolah' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Donation Action -->
            <div
              class="bg-primary-300 rounded-3xl p-8 text-white shadow-xl shadow-primary-300/20 relative overflow-hidden group"
            >
              <Heart
                class="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform group-hover:scale-110 transition-transform duration-500"
              />
              <h3 class="text-xl font-black mb-2 relative z-10">
                Bantu Masa Depan {{ child.name.split(' ')[0] }}
              </h3>
              <p class="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
                Setiap kontribusi Anda sangat berarti bagi kelangsungan pendidikan dan masa depan
                anak ini.
              </p>
              <BaseButton
                variant="primary"
                class="w-full bg-white text-primary-300! hover:bg-primary-400! hover:text-white! border-none shadow-lg relative z-10 font-black py-4 rounded-xl"
                @click="handleDonasi"
              >
                DONASI SEKARANG
              </BaseButton>
            </div>
          </div>

          <!-- Main Details -->
          <div class="lg:col-span-8 space-y-8">
            <!-- Full Details Card -->
            <div class="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 class="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span class="w-2 h-8 bg-primary-300 rounded-full"></span>
                Profil Lengkap
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div class="space-y-1 border-l-2 border-gray-50 pl-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Nama Lengkap
                  </p>
                  <p class="text-lg font-bold text-gray-900">{{ child.name }}</p>
                </div>
                <div class="space-y-1 border-l-2 border-gray-50 pl-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Tempat, Tanggal Lahir
                  </p>
                  <p class="text-lg font-bold text-gray-900">
                    {{ child.birthPlace }}, {{ child.birthDate }}
                  </p>
                </div>
                <div class="space-y-1 border-l-2 border-gray-50 pl-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Jenis Kelamin
                  </p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCategory(child.gender) }}</p>
                </div>
                <div class="space-y-1 border-l-2 border-gray-50 pl-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Kategori Anak
                  </p>
                  <p class="text-lg font-bold text-gray-900">
                    {{ formatCategory(child.category) }}
                  </p>
                </div>
                <div class="md:col-span-2 space-y-1 border-l-2 border-gray-50 pl-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Alamat Domisili
                  </p>
                  <p class="text-lg font-bold text-gray-900 leading-relaxed">{{ child.address }}</p>
                </div>
              </div>
            </div>

            <!-- Achievements Gallery -->
            <div class="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 class="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Award :size="28" class="text-primary-300" />
                Prestasi & Sertifikat
              </h2>

              <div
                v-if="child.achievements && child.achievements.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div
                  v-for="cert in child.achievements"
                  :key="cert.id"
                  class="group bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-white rounded-xl text-primary-300 shadow-sm">
                      <Award :size="24" />
                    </div>
                    <a
                      :href="cert.url"
                      target="_blank"
                      class="p-2 text-gray-400 hover:text-primary-300 transition-colors"
                      title="Lihat Dokumen"
                    >
                      <ExternalLink :size="18" />
                    </a>
                  </div>
                  <h4 class="font-bold text-gray-900 line-clamp-2 leading-tight min-h-2.5rem">
                    {{ cert.title }}
                  </h4>
                  <div
                    class="mt-4 pt-4 border-t border-gray-200/50 flex justify-between items-center"
                  >
                    <span class="text-[10px] font-black text-primary-300 uppercase tracking-widest"
                      >Terverifikasi</span
                    >
                    <a
                      :href="cert.url"
                      target="_blank"
                      class="text-xs font-bold text-primary-300 hover:underline"
                    >
                      Lihat Detail
                    </a>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl"
              >
                <div
                  class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300"
                >
                  <Award :size="24" />
                </div>
                <p class="text-gray-400 text-sm font-medium">Belum ada prestasi yang ditambahkan</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Back Button -->
        <button
          @click="handleBack"
          class="flex items-center gap-2 text-gray-500 hover:text-primary-400 transition-colors mb-8 group"
        >
          <ArrowLeft :size="20" class="transition-transform group-hover:-translate-x-1" />
          <span class="font-medium">Kembali ke Daftar Anak Asuh</span>
        </button>
      </div>
    </div>
  </PublicLayout>
</template>
