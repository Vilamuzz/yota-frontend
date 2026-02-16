<template>
  <footer class="bg-white mt-16 border-t">
    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <!-- Left: Logo + Address -->
        <div class="flex-1">
          <h3 class="text-2xl font-bold text-indigo-600">Yota</h3>
          <p class="text-sm text-gray-600 mt-2">123 Startup Lane<br />Jakarta, Indonesia 12345</p>
        </div>

        <!-- Right: Contact/Social (left) & Services (right) -->
        <div class="flex gap-12">
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Contact</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>
                Email:
                <a href="mailto:support@yota.example" class="hover:text-indigo-600">
                  support@yota.example
                </a>
              </li>
              <li>
                Phone:
                <a href="tel:+6281234567890" class="hover:text-indigo-600">+62 812-3456-7890</a>
              </li>
              <li class="flex items-center gap-3 mt-2">
                <a href="#" class="text-gray-500 hover:text-indigo-600">Twitter</a>
                <a href="#" class="text-gray-500 hover:text-indigo-600">LinkedIn</a>
                <a href="#" class="text-gray-500 hover:text-indigo-600">Instagram</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Services</h4>
            <ul class="text-sm text-gray-600 space-y-2">
              <li><a href="#service1" class="hover:text-indigo-600">Consulting</a></li>
              <li><a href="#service2" class="hover:text-indigo-600">Development</a></li>
              <li><a href="#service3" class="hover:text-indigo-600">Design</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
