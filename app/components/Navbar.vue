<template>
  <div class="fixed top-0 left-0 z-50 w-full">
    <div
      class="relative flex items-center justify-center bg-white/50 backdrop-blur-xs shadow-sm border border-white/50 px-6 py-3 h-24"
    >
      <div class="absolute left-0 pl-50">
        <img
          src="/assets/products/Brand-Logo.avif"
          alt="Brand Logo"
          class="h-12 object-contain cursor-pointer"
        />
      </div>
      <nav
        class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500"
      >
        <NuxtLink to="/" class="hover:text-gray-900 transition-colors"
          >Home</NuxtLink
        >
        <NuxtLink to="/products" class="hover:text-gray-900 transition-colors"
          >Categories</NuxtLink
        >
        <NuxtLink
          to="/testimonial"
          class="hover:text-gray-900 transition-colors"
          >Products</NuxtLink
        >
        <NuxtLink to="/about" class="hover:text-gray-900 transition-colors"
          >About</NuxtLink
        >
        <NuxtLink to="/about" class="hover:text-gray-900 transition-colors"
          >Contact</NuxtLink
        >
      </nav>
    </div>
  </div>
</template>
