<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <nav class="fixed top-4 left-4 right-4 z-50">
    <div class="bg-white rounded-2xl shadow-lg px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-indigo-600 cursor-pointer" @click="router.push('/')">
            Yota
          </h1>
        </div>

        <!-- Menu Links & Profile -->
        <div class="flex items-center gap-8">
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-6">
            <a
              href="#features"
              class="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
            >
              Features
            </a>
            <a
              href="#about"
              class="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              class="text-gray-700 hover:text-indigo-600 font-medium transition duration-200"
            >
              Contact
            </a>
          </div>

          <!-- Profile/Auth Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="handleLogin"
              class="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition duration-200"
            >
              Login
            </button>
            <button
              @click="handleRegister"
              class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
