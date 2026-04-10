<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(true);

const { adminLogout } = useApi();

const handleLogout = async () => {
  try {
    await adminLogout();
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    authStore.logout();
    router.push('/admin/login');
  }
};

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'uil:dashboard' },
  { name: 'Kelola Produk', path: '/admin/products', icon: 'uil:package' },
  { name: 'Daftar Pesanan', path: '/admin/orders', icon: 'uil:shopping-cart' },
  { name: 'Kategori', path: '/admin/categories', icon: 'uil:apps' },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside 
      class="bg-gray-900 text-white w-64 fixed inset-y-0 left-0 transition-transform duration-300 z-50 transform"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-full flex flex-col">
        <!-- Logo Area -->
        <div class="p-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="uil:store" class="text-white text-xl md:text-2xl" />
            </div>
            <span class="text-xl font-bold tracking-tight">Admin<span class="text-blue-400">Panel</span></span>
          </div>
        </div>

        <!-- Links -->
        <nav class="flex-1 px-4 space-y-2 mt-4">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition group hover:bg-gray-800"
            active-class="bg-blue-600 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
          >
            <Icon :name="item.icon" class="text-xl opacity-70 group-hover:opacity-100" />
            <span class="font-medium">{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <!-- Sidebar footer -->
        <div class="p-4 border-t border-gray-800">
          <div class="flex items-center gap-3 px-4 py-2">
            <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Icon name="uil:user-circle" class="text-2xl" />
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold truncate">{{ authStore.user?.name || 'Administrator' }}</p>
              <p class="text-xs text-gray-500 truncate">{{ authStore.user?.username || 'admin' }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="w-full mt-4 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition group"
          >
            <Icon name="uil:sign-out-alt" class="text-xl opacity-70 group-hover:opacity-100" />
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main 
      class="flex-1 transition-all duration-300 min-h-screen flex flex-col"
      :class="isSidebarOpen ? 'ml-64' : 'ml-0'"
    >
      <!-- Topbar -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
          >
            <Icon :name="isSidebarOpen ? 'uil:angle-left' : 'uil:bars'" class="text-2xl" />
          </button>
          <h2 class="text-lg font-bold text-gray-800">
            {{ $route.meta.title || 'Dashboard' }}
          </h2>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink to="/" target="_blank" class="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <Icon name="uil:external-link-alt" />
            Lihat Toko
          </NuxtLink>
          <div class="w-px h-6 bg-gray-200 mx-2"></div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700 hidden md:block">Halo, Admin</span>
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {{ authStore.user?.name?.charAt(0) || 'A' }}
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="p-6 flex-1">
        <slot />
      </div>

      <!-- Admin Footer -->
      <footer class="p-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        &copy; {{ new Date().getFullYear() }} Toko Online Admin Panel.
      </footer>
    </main>
  </div>
</template>
