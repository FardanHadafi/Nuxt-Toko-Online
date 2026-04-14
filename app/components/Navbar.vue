<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
const { smoother } = useSmoother();
const cartStore = useCartStore();

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
      <div class="absolute left-10 md:left-20">
        <NuxtLink to="/">
          <img
            src="/assets/products/Brand-Logo.avif"
            alt="Brand Logo"
            class="h-10 md:h-12 object-contain cursor-pointer"
          />
        </NuxtLink>
      </div>
      <nav
        class="hidden lg:flex items-center gap-8 text-lg font-medium text-gray-500"
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
      <div class="absolute right-10 md:right-20 flex items-center gap-4">
        <NuxtLink
          to="/cart"
          class="relative p-2 group transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <Icon name="uil:shopping-cart" class="text-2xl text-gray-700" />
          </div>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-black text-white text-[10px] font-bold px-1.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
          >
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
