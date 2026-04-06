<script setup lang="ts">

const props = defineProps({
  currentStep: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['step-click'])

const steps = [
  { number: 1, label: 'Data Pemohon' },
  { number: 2, label: 'Data Anak Asuh' }
]

const handleClick = (step: number) => {
  emit('step-click', step)
}
</script>

<template>
  <div class="flex items-center justify-center gap-3 mb-6">
    <div
      v-for="step in steps"
      :key="step.number"
      class="flex items-center gap-2 cursor-pointer"
      @click="handleClick(step.number)"
    >
      <div :class="[
        'flex items-center gap-2 px-4 py-1 rounded-full text-sm font-poppins transition',
        props.currentStep === step.number
        ? 'bg-primary-300 text-white'
        : 'bg-gray-200 text-gray-600',
      ]">
      <span class="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
        :class="props.currentStep === step.number
        ? 'bg-white text-primary-300'
        : 'bg-gray-400 text-gray-200'">
        {{ step.number }}
      </span>
      {{  step.label  }}
      </div>
    </div>
  </div>
</template>
