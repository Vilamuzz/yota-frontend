<script setup lang="ts">
</script>

<template>
  <div class="grid md:grid-cols-2 gap-6 mt-10 font-[Poppins]">

    <!-- Manfaat -->
    <div
      class="
      bg-[var(--color-primary-300)]
      text-white
      rounded-xl
      p-6
      shadow
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-lg
      hover:scale-[1.02]
      "
    >
      <h3 class="text-lg font-semibold mb-4">
        Manfaat Berlangganan
      </h3>

      <ol class="space-y-2 text-sm leading-relaxed list-decimal list-inside">
        <li>Mendapatkan kemudahan berdonasi tanpa harus mengingat setiap bulan</li>
        <li>Membuka pintu amal jariyah yang terus mengalir selama program berjalan</li>
        <li>Menghadirkan harapan dan senyum bagi mereka yang sedang berjuang</li>
        <li>Membantu keberlangsungan program sosial secara konsisten dan terencana</li>
        <li>Memberikan dampak nyata dan berkelanjutan bagi mereka yang membutuhkan</li>
      </ol>
    </div>

    <!-- Cara -->
    <div
      class="
      bg-white
      border
      border-gray-200
      rounded-xl
      p-6
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-lg
      hover:scale-[1.02]
      "
    >
      <h3 class="text-lg font-semibold text-[var(--color-primary-300)] mb-4">
        Cara Berlangganan
      </h3>

      <ol class="space-y-2 text-sm text-gray-600 leading-relaxed list-decimal list-inside">
        <li>Klik tombol <b>"Berlangganan"</b>.</li>
        <li>Pilih atau masukkan nominal donasi.</li>
        <li>Konfirmasi data dan lanjutkan ke pembayaran.</li>
        <li>Lakukan pembayaran melalui metode yang tersedia.</li>
        <li>Donasi akan tercatat otomatis setiap bulan.</li>
        <li>Jika tidak membayar hingga periode berikutnya, langganan berhenti otomatis.</li>
      </ol>
    </div>

  </div>
</template>