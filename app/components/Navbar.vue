<script setup lang="ts">
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="flex justify-between items-center h-16 bg-white border-b border-gray-100 px-6 sticky top-0 z-50">
    <!--Nama Toko / Logo Brand-->
    <NuxtLink to="/" class="text-3xl font-bold text-blue-600">Toko Online</NuxtLink>
    
    <!--Navigation Links-->
    <nav class="hidden md:flex items-center gap-8">
      <NuxtLink to="/" class="hover:text-blue-500 transition">Home</NuxtLink>
      <NuxtLink to="/product" class="hover:text-blue-500 transition">Products</NuxtLink>
      <NuxtLink to="/category" class="hover:text-blue-500 transition">Categories</NuxtLink>
      <NuxtLink to="/about" class="hover:text-blue-500 transition">About</NuxtLink>
    </nav>

    <!--Cart & Profile-->
    <div class="flex items-center gap-4">
      <NuxtLink to="/cart" class="p-2 hover:bg-gray-100 rounded-full transition relative">
        <Icon name="uil:shopping-cart" class="text-2xl" />
        <span v-if="cartStore.items.length > 0" class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
          {{ cartStore.items.length }}
        </span>
      </NuxtLink>
      
      <template v-if="authStore.isLoggedIn">
        <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
          <span class="text-sm font-medium hidden sm:inline">{{ authStore.user?.name || 'Admin' }}</span>
          <button @click="handleLogout" class="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition">
            <Icon name="uil:signout" class="text-2xl" />
          </button>
        </div>
      </template>
      <template v-else>
        <!-- Admin Login Button Removed: Accessible only via /login manual URL -->
      </template>
    </div>
  </div>
</template>
