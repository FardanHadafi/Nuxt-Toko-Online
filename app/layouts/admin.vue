<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(true);

const { adminLogout } = useApi();

const handleLogout = async () => {
  try {
    await adminLogout();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    authStore.logout();
    router.push("/admin/login");
  }
};

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "uil:dashboard" },
  { name: "Kelola Produk", path: "/admin/products", icon: "uil:package" },
  { name: "Daftar Pesanan", path: "/admin/orders", icon: "uil:shopping-cart" },
  { name: "Kategori", path: "/admin/categories", icon: "uil:apps" },
];
</script>

<template>
  <div class="min-h-screen bg-[#F9F9F9] flex font-sans">
    <aside
      class="bg-white border-r border-gray-100 w-72 fixed inset-y-0 left-0 transition-transform duration-300 z-50 transform"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-full flex flex-col">
        <nav class="flex-1 px-4 space-y-1 pt-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-4 px-6 py-4 transition-all duration-300 group border-l-2 border-transparent"
            active-class="bg-orange-50/50 !border-[#FF5A00] !text-[#FF5A00]"
          >
            <Icon
              :name="item.icon"
              class="text-xl opacity-50 group-hover:opacity-100 transition-opacity"
            />
            <span class="font-medium tracking-wide">{{ item.name }}</span>
          </NuxtLink>
        </nav>
        <div class="p-6 border-t border-gray-50">
          <div class="flex items-center gap-4 px-4 py-3 bg-gray-50/50 mb-6">
            <div
              class="w-10 h-10 rounded-none bg-[#FF5A00]/10 flex items-center justify-center text-[#FF5A00] border border-[#FF5A00]/20"
            >
              <Icon name="uil:user" class="text-2xl" />
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold truncate text-gray-900">
                {{ authStore.user?.name || "Administrator" }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {{ authStore.user?.username || "admin" }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
          >
            <Icon
              name="uil:sign-out-alt"
              class="text-xl opacity-50 group-hover:opacity-100"
            />
            <span class="font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </div>
    </aside>
    <main
      class="flex-1 transition-all duration-300 min-h-screen flex flex-col"
      :class="isSidebarOpen ? 'ml-72' : 'ml-0'"
    >
      <header
        class="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-40"
      >
        <div class="flex items-center gap-6">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-900"
          >
            <Icon
              :name="isSidebarOpen ? 'uil:align-left-alt' : 'uil:bars'"
              class="text-2xl"
            />
          </button>
          <h2 class="text-xl font-light text-gray-900 tracking-tight">
            {{ $route.meta.title || "Dashboard" }}
          </h2>
        </div>

        <div class="flex items-center gap-8">
          <NuxtLink
            to="/"
            target="_blank"
            class="text-sm font-medium text-[#FF5A00] hover:text-black flex items-center gap-2 transition-colors"
          >
            <Icon name="uil:external-link-alt" />
            View Storefront
          </NuxtLink>
          <div class="w-px h-6 bg-gray-100 italic"></div>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gray-900 flex items-center justify-center text-white font-bold text-sm"
            >
              {{ authStore.user?.name?.charAt(0) || "A" }}
            </div>
          </div>
        </div>
      </header>
      <div class="p-10 flex-1">
        <slot />
      </div>
      <footer
        class="p-8 text-center text-gray-900 text-xs tracking-widest uppercase border-t border-gray-50 bg-white"
      >
        &copy; {{ new Date().getFullYear() }} Uncover Admin System.
      </footer>
    </main>
  </div>
</template>
