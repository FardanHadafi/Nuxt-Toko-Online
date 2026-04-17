<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
const { smoother } = useSmoother();
const cartStore = useCartStore();

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleNavClick = (e, path) => {
  isMobileMenuOpen.value = false;
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
  <div class="fixed top-0 left-0 z-100 w-full transition-all duration-500">
    <div
      class="relative flex items-center justify-between bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100 px-6 sm:px-10 md:px-20 h-20 md:h-24"
    >
      <!-- Logo -->
      <div class="flex items-center">
        <NuxtLink to="/">
          <img
            src="/assets/products/Brand-Logo.avif"
            alt="Brand Logo"
            class="h-8 md:h-12 object-contain cursor-pointer transition-transform hover:scale-105"
          />
        </NuxtLink>
      </div>

      <!-- Desktop Nav -->
      <nav
        class="hidden lg:flex items-center gap-12 text-sm font-bold text-gray-400 uppercase tracking-widest"
      >
        <NuxtLink
          to="/#home"
          @click="handleNavClick($event, '/#home')"
          class="hover:text-black transition-colors"
          >Home</NuxtLink
        >
        <NuxtLink
          to="/#categories"
          @click="handleNavClick($event, '/#categories')"
          class="hover:text-black transition-colors"
          >Categories</NuxtLink
        >
        <NuxtLink
          to="/#products"
          @click="handleNavClick($event, '/#products')"
          class="hover:text-black transition-colors"
          >Products</NuxtLink
        >
        <NuxtLink
          to="/#about"
          @click="handleNavClick($event, '/#about')"
          class="hover:text-black transition-colors"
          >About</NuxtLink
        >
        <NuxtLink
          to="/#contact"
          @click="handleNavClick($event, '/#contact')"
          class="hover:text-black transition-colors"
          >Contact</NuxtLink
        >
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-2 sm:gap-6">
        <NuxtLink
          to="/cart"
          class="relative p-2 group transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <Icon name="uil:shopping-cart" class="text-xl text-gray-700" />
          </div>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-1 right-1 min-w-4 h-4 bg-black text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
          >
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>

        <!-- Hamburger Icon (Admin-style) -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <span
            class="w-6 h-0.5 bg-black transition-all duration-300"
            :class="{ 'rotate-45 translate-y-2': isMobileMenuOpen }"
          ></span>
          <span
            class="w-6 h-0.5 bg-black transition-all duration-300"
            :class="{ 'opacity-0': isMobileMenuOpen }"
          ></span>
          <span
            class="w-6 h-0.5 bg-black transition-all duration-300"
            :class="{ '-rotate-45 -translate-y-2': isMobileMenuOpen }"
          ></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-full"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 top-20 bg-white z-[-1] flex flex-col p-10 gap-8 lg:hidden shadow-2xl"
      >
        <NuxtLink
          v-for="link in [
            { name: 'Home', path: '/#home' },
            { name: 'Categories', path: '/#categories' },
            { name: 'Products', path: '/#products' },
            { name: 'About', path: '/#about' },
            { name: 'Contact', path: '/#contact' },
          ]"
          :key="link.path"
          :to="link.path"
          @click="handleNavClick($event, link.path)"
          class="text-4xl font-light text-gray-900 border-b border-gray-100 pb-4 tracking-tight hover:text-orange-500 transition-colors"
        >
          {{ link.name }}
        </NuxtLink>

        <div class="mt-auto py-10">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Secured Transaction</p>
          <div class="flex gap-4 opacity-50 grayscale">
            <Icon name="logos:midtrans" class="h-6" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
