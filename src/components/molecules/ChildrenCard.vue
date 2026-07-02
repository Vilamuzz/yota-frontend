<script setup lang="ts">
import type { FosterChildren } from '@/types/fosterChildren'
import { formatStatus } from '@/utils/format'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  fosterChildren: FosterChildren
  to?: RouteLocationRaw
}>()

const emit = defineEmits(['view'])

const handleView = (fosterChildren: FosterChildren) => {
  emit('view', fosterChildren)
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0

  const parts = birthDate.split('-')
  const [p1, p2, p3] = parts

  if (!p1 || !p2 || !p3) return 0

  let year: number
  let month: number
  let day: number

  if (p1.length === 4) {
    year = Number(p1)
    month = Number(p2)
    day = Number(p3)
  } else {
    day = Number(p1)
    month = Number(p2)
    year = Number(p3)
  }

  if (!day || !month || !year) return 0

  const today = new Date()
  const birth = new Date(year, month - 1, day)

  let age = today.getFullYear() - birth.getFullYear()

  const isBeforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate())

  if (isBeforeBirthday) age--

  return age
}

function isMale(gender?: string) {
  if (!gender) return true

  const value = gender.toLowerCase()

  return (
    value === 'male' ||
    value === 'laki-laki' ||
    value === 'l' ||
    value === 'pria'
  )
}
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    @click="!to && handleView(fosterChildren)"
    class="relative rounded-xl border shadow-sm p-4 min-w-37.5 w-full text-left cursor-pointer transition-all duration-300 group block overflow-hidden hover:shadow-lg hover:-translate-y-1"
    :class="
      isMale(fosterChildren.gender)
        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-400'
        : 'bg-pink-50/40 border-pink-200 hover:border-pink-400'
    "
  >
    <!-- Badge Lulus -->
    <div
      v-if="fosterChildren.isGraduated"
      class="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow"
    >
      🎓 Lulus
    </div>

    <div
      class="flex flex-col items-center text-center gap-2 group-hover:scale-105 transition-transform duration-300"
    >
      <!-- Foto -->
      <img
        :src="fosterChildren.profilePicture"
        :alt="fosterChildren.name"
        class="w-20 h-20 rounded-full object-cover border-[3px] shadow-md"
        :class="
          isMale(fosterChildren.gender)
            ? 'border-blue-500'
            : 'border-pink-500'
        "
      />

      <!-- Nama -->
      <span
        class="text-white text-sm px-4 py-1 rounded-full font-semibold shadow"
        :class="
          isMale(fosterChildren.gender)
            ? 'bg-blue-500'
            : 'bg-pink-500'
        "
      >
        {{ fosterChildren.name }}
      </span>

      <!-- Informasi -->
      <div
        class="flex divide-x rounded-lg bg-white/80 backdrop-blur shadow-sm text-sm overflow-hidden"
      >
        <span class="px-3 py-1 font-semibold">
          {{ formatStatus(fosterChildren.category) }}
        </span>

        <span class="px-3 py-1 text-gray-600">
          {{ calculateAge(fosterChildren.birthDate) }} Tahun
        </span>
      </div>
    </div>
  </component>
</template>
