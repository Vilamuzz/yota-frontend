<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const router = useRouter()

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}

// Hero carousel
const currentSlide = ref(0)
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=600&fit=crop',
    title: 'Build Your Future',
    subtitle: 'Transform your ideas into reality with our powerful platform',
  },
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=600&fit=crop',
    title: 'Connect & Collaborate',
    subtitle: 'Join a community of innovators and creators',
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=600&fit=crop',
    title: 'Grow Together',
    subtitle: 'Scale your projects with cutting-edge tools and support',
  },
]

let slideInterval: number | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

onMounted(() => {
  slideInterval = window.setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Slides -->
      <div class="relative w-full h-full">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000"
          :class="currentSlide === index ? 'opacity-100' : 'opacity-0'"
        >
          <!-- Background Image -->
          <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-black opacity-40"></div>

          <!-- Content -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white px-4">
              <h2 class="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
                {{ slide.title }}
              </h2>
              <p class="text-xl md:text-2xl mb-8 animate-fade-in-delay">
                {{ slide.subtitle }}
              </p>
              <div class="flex gap-4 justify-center animate-fade-in-delay-2">
                <button
                  @click="handleRegister"
                  class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
                <button
                  @click="handleLogin"
                  class="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide Indicators -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="
            currentSlide === index ? 'bg-white w-8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
          "
        ></button>
      </div>
    </div>

    <!-- Welcome Section -->
    <section class="w-full">
      <div class="max-w-7xl mx-auto mt-12 px-6 md:px-12 lg:px-24">
        <div class="flex flex-col md:flex-row items-center gap-10">
          <div class="flex-1">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Selamat Datang</h2>
            <p class="text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit quo suscipit velit
              corrupti eos doloremque accusantium delectus neque possimus, quasi ullam nobis nulla.
              Similique veritatis quos molestiae debitis maiores nisi?
            </p>
          </div>

          <div class="w-40 h-40 md:w-56 md:h-56 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
              alt="Welcome"
              class="w-full h-full object-cover rounded-full shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>
