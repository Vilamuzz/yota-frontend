<script setup lang="ts">
const props = defineProps({
  currentStep: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['step-click'])

const steps = [
  { number: 1, label: 'Data Pemohon' },
  { number: 2, label: 'Data Anak Asuh' },
]

const handleClick = (step: number) => {
  emit('step-click', step)
}
</script>

<template>
  <div class="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 mb-6">
    <div
      v-for="step in steps"
      :key="step.number"
      class="flex items-center gap-2 cursor-pointer"
      @click="handleClick(step.number)"
    >
      <div
        :class="[
          'flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-poppins transition-all duration-300',
          props.currentStep === step.number
            ? 'bg-primary-300 text-white shadow-md shadow-primary-300/20'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        ]"
      >
        <span
          class="w-5 h-5 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shrink-0"
          :class="
            props.currentStep === step.number
              ? 'bg-white text-primary-400'
              : 'bg-gray-300 text-gray-600'
          "
        >
          {{ step.number }}
        </span>
        <span
          :class="[
            'whitespace-nowrap font-medium',
            props.currentStep === step.number ? 'block' : 'hidden sm:block',
          ]"
        >
          {{ step.label }}
        </span>
      </div>
    </div>
  </div>
</template>
