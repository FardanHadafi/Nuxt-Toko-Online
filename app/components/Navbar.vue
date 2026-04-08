<script setup lang="ts">
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Check if there's a pending (unpaid) order
const pendingOrderCookie = useCookie<any>('pending_order');
const paymentStatusCookie = useCookie<string | null>('payment_status');
const hasPendingPayment = computed(() => !!pendingOrderCookie.value && paymentStatusCookie.value !== 'paid');

const handleLogout = () => {
  authStore.logout();
  router.push("/admin/login");
};
</script>

<template>
  <div
    class="flex justify-between items-center h-16 bg-white border-b border-gray-100 px-6 sticky top-0 z-50"
  >
    <!--Nama Toko / Logo Brand-->
    <NuxtLink to="/" class="text-3xl font-bold text-blue-600"
      >Toko Online</NuxtLink
    >

    <!--Navigation Links-->
    <nav class="hidden md:flex items-center gap-8">
      <NuxtLink to="/" class="hover:text-blue-500 transition">Home</NuxtLink>
      <NuxtLink to="/product" class="hover:text-blue-500 transition"
        >Products</NuxtLink
      >
      <NuxtLink to="/category" class="hover:text-blue-500 transition"
        >Categories</NuxtLink
      >
      <NuxtLink to="/about" class="hover:text-blue-500 transition"
        >About</NuxtLink
      >
    </nav>

    <!--Cart & Profile-->
    <div class="flex items-center gap-4">
      <NuxtLink
        to="/cart"
        class="p-2 hover:bg-gray-100 rounded-full transition relative"
      >
        <Icon name="uil:shopping-cart" class="text-2xl" />
        <!-- Cart item count -->
        <span
          v-if="cartStore.totalItems > 0"
          class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white"
        >
          {{ cartStore.totalItems }}
        </span>
        <!-- Pending payment indicator -->
        <span
          v-if="hasPendingPayment"
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"
          title="Ada pembayaran tertunda"
        />
      </NuxtLink>
    </div>
  </div>
</template>
