<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
const { smoother } = useSmoother();

const handleNavClick = (e, path) => {
  const hash = path.split("#")[1];
  const targetPath = path.split("#")[0];

  if (hash && (route.path === targetPath || targetPath === "")) {
    if (smoother.value) {
      e.preventDefault();
      smoother.value.scrollTo(`#${hash}`, true);
    }
  }
};
</script>

<template>
  <div class="fixed top-0 left-0 z-50 w-full">
    <div
      class="relative flex items-center justify-center bg-white/85 backdrop-blur-md shadow-sm border border-white/50 px-6 py-3 h-24"
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
        <NuxtLink
          to="/#home"
          @click="handleNavClick($event, '/#home')"
          class="hover:text-gray-900 transition-colors"
          >Home</NuxtLink
        >
        <NuxtLink
          to="/#categories"
          @click="handleNavClick($event, '/#categories')"
          class="hover:text-gray-900 transition-colors"
          >Categories</NuxtLink
        >
        <NuxtLink
          to="/#products"
          @click="handleNavClick($event, '/#products')"
          class="hover:text-gray-900 transition-colors"
          >Products</NuxtLink
        >
        <NuxtLink
          to="/#about"
          @click="handleNavClick($event, '/#about')"
          class="hover:text-gray-900 transition-colors"
          >About</NuxtLink
        >
        <NuxtLink
          to="/#contact"
          @click="handleNavClick($event, '/#contact')"
          class="hover:text-gray-900 transition-colors"
          >Contact</NuxtLink
        >
      </nav>
    </div>
  </div>
</template>
