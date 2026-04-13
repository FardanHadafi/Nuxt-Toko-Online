<template>
  <footer id="contact" class="w-full bg-[#f8f9fa] border-t border-gray-200">
    <div class="max-w-360 mx-auto px-4 py-20">
      <div class="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24">
        <div class="flex flex-col items-start lg:max-w-sm">
          <div class="flex items-center gap-3">
            <img
              src="/assets/products/Brand-Logo.avif"
              alt="Brand Logo"
              class="h-12"
            />
          </div>
          <p class="text-gray-500 mb-4 max-w-[280px] leading-relaxed text-sm">
            Exploring the tech and design shaping the world of tomorrow.
          </p>
          <button
            class="bg-[#111827] text-white px-7 py-3 font-medium text-sm hover:bg-gray-800 transition-colors cursor-pointer lg:mb-16"
          >
            About Us
          </button>
          <p class="text-gray-400 text-xs">
            ©2026 Uncover. All rights reserved.
          </p>
        </div>
        <div class="flex flex-wrap gap-16 lg:gap-32 w-full lg:w-auto">
          <div class="flex flex-col gap-4 text-sm mt-2 lg:mt-0">
            <h4 class="text-gray-500 mb-2">Pages</h4>
            <NuxtLink
              to="/"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Home</NuxtLink
            >
            <NuxtLink
              to="/category"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Categories</NuxtLink
            >
            <NuxtLink
              to="/product"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Products</NuxtLink
            >
            <NuxtLink
              to="/about"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >About</NuxtLink
            >
            <NuxtLink
              to="/contact"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Contact</NuxtLink
            >
          </div>
          <div class="flex flex-col gap-4 text-sm mt-2 lg:mt-0">
            <h4 class="text-gray-500 mb-2">Categories</h4>
            <NuxtLink
              to="/category/outdoor"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Outdoor</NuxtLink
            >
            <NuxtLink
              to="/category/sound-essentials"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Sound Essentials</NuxtLink
            >
            <NuxtLink
              to="/category/video-gear"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Video Gear</NuxtLink
            >
            <NuxtLink
              to="/category/best-sellers"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Best Sellers</NuxtLink
            >
          </div>
          <div class="flex flex-col gap-4 text-sm mt-2 lg:mt-0">
            <h4 class="text-gray-500 mb-2">Socials</h4>
            <NuxtLink
              to="#"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Twitter/X</NuxtLink
            >
            <NuxtLink
              to="#"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Instagram</NuxtLink
            >
            <NuxtLink
              to="#"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >Facebook</NuxtLink
            >
            <NuxtLink
              to="#"
              class="text-gray-900 font-medium hover:text-orange-500 transition-colors"
              >LinkedIn</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
