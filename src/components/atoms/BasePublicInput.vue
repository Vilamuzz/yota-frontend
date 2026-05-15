<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  modelValue: string
  id: string
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  showPasswordToggle?: boolean
  showPasswordStrength?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  size: 'md',
  showPasswordToggle: false,
  showPasswordStrength: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

// Password strength calculation
const passwordStrength = computed(() => {
  if (props.type !== 'password' || !props.showPasswordStrength || !props.modelValue) {
    return { level: 0, text: '', color: '' }
  }

  const password = props.modelValue
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  strength = Math.min(strength, 4)

  const levels = [
    { level: 0, text: '', color: '' },
    { level: 1, text: 'Lemah', color: 'bg-red-500' },
    { level: 2, text: 'Cukup', color: 'bg-orange-500' },
    { level: 3, text: 'Baik', color: 'bg-yellow-500' },
    { level: 4, text: 'Sangat Kuat', color: 'bg-green-500' },
  ]

  return levels[strength]
})

const inputClasses = computed(() => {
  const base =
    'w-full border rounded-xl focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all duration-300 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-white border-gray-200 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal'

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  }

  const errorClass = props.error
    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
    : 'border-gray-200'
  const paddingClass = props.showPasswordToggle && props.type === 'password' ? 'pr-12' : ''

  return `${base} ${sizes[props.size]} ${errorClass} ${paddingClass}`
})

const labelClasses = computed(() => {
  return 'block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1.5 ml-1'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="w-full font-poppins">
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative group">
      <!-- Prefix Slot -->
      <div
        v-if="$slots.prefix"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-400 transition-colors duration-300 pointer-events-none"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :class="[
          inputClasses,
          $slots.prefix ? 'pl-11' : '',
          $slots.suffix || (showPasswordToggle && type === 'password') ? 'pr-11' : '',
        ]"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Suffix Slot -->
      <div
        v-if="$slots.suffix"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <slot name="suffix" />
      </div>

      <!-- Password Toggle Button -->
      <button
        v-if="showPasswordToggle && type === 'password'"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-400 focus:outline-none transition-colors duration-300"
        :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
      >
        <Eye v-if="!showPassword" :size="20" />
        <EyeOff v-else :size="20" />
      </button>
    </div>

    <!-- Password Strength Indicator -->
    <div
      v-if="showPasswordStrength && type === 'password' && modelValue && passwordStrength"
      class="mt-3 space-y-2"
    >
      <div class="flex gap-1.5">
        <div
          v-for="i in 4"
          :key="i"
          class="h-1 flex-1 rounded-full transition-all duration-500"
          :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-100'"
        ></div>
      </div>
      <p
        v-if="passwordStrength.text"
        class="text-[10px] font-black uppercase tracking-widest"
        :class="{
          'text-red-500': passwordStrength.level === 1,
          'text-orange-500': passwordStrength.level === 2,
          'text-yellow-500': passwordStrength.level === 3,
          'text-green-500': passwordStrength.level === 4,
        }"
      >
        Kekuatan Sandi: {{ passwordStrength.text }}
      </p>
    </div>

    <div class="min-h-5 mt-1">
      <p v-if="error" class="text-[10px] font-bold text-red-500 ml-1">
        {{ error }}
      </p>
      <p v-else-if="hint" class="text-[10px] font-medium text-gray-400 ml-1">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
