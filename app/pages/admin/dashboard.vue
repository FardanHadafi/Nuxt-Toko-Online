<script setup lang="ts">
const { getProducts, getAllOrders } = useApi();
const stats = ref([
  {
    name: "Total Produk",
    value: "...",
    icon: "uil:package",
    color: "bg-blue-500",
  },
  {
    name: "Total Pesanan",
    value: "...",
    icon: "uil:shopping-basket",
    color: "bg-orange-500",
  },
  {
    name: "Total Pendapatan",
    value: "...",
    icon: "uil:money-bill",
    color: "bg-emerald-500",
  },
]);

const productsCount = ref(0);

onMounted(async () => {
  try {
    const [productsData, ordersData] = await Promise.all([
      getProducts(),
      getAllOrders(),
    ]);

    productsCount.value = productsData.length || 0;
    stats.value[0].value = productsCount.value.toString();
    const totalOrders = ordersData.length || 0;
    stats.value[1].value = totalOrders.toString();

    let totalRevenue = 0;
    ordersData.forEach((order: any) => {
      if (
        order.status === "success" ||
        order.status === "paid" ||
        order.status === "settlement" ||
        order.status === "pending"
      ) {
        totalRevenue += Number(order.total_amount || 0);
      }
    });

    stats.value[2].value = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(totalRevenue);
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
});

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Dashboard Ringkasan",
});

useHead({
  title: "Admin Dashboard | Toko Online",
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Selamat Datang, Admin</h1>
      <p class="text-gray-500">
        Berikut adalah ringkasan performa toko Anda hari ini.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md"
      >
        <div
          :class="[
            'w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg',
            stat.color,
            `shadow-${stat.color.split('-')[1] || 'blue'}-500/20`,
          ]"
        >
          <Icon :name="stat.icon" />
        </div>
        <div>
          <p class="text-sm text-gray-400 font-medium">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Recent Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Quick Actions -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
          <div class="grid grid-cols-1 gap-3">
            <NuxtLink
              to="/admin/products"
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div
                class="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition"
              >
                <Icon name="uil:plus" />
              </div>
              <span class="font-medium text-gray-700">Tambah Produk Baru</span>
            </NuxtLink>
            <NuxtLink
              to="/admin/orders"
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition group"
            >
              <div
                class="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition"
              >
                <Icon name="uil:receipt" />
              </div>
              <span class="font-medium text-gray-700">Lihat Semua Pesanan</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Welcome Banner -->
      <div class="lg:col-span-2">
        <div
          class="bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20"
        >
          <div class="relative z-10 max-w-md">
            <h2 class="text-3xl font-bold mb-4">
              Mulai Kelola Inventaris Anda!
            </h2>
            <p class="text-blue-100 mb-6 leading-relaxed">
              Anda dapat menambah, mengubah, atau menghapus produk dengan mudah
              melalui menu manajemen produk. Jangan lupa untuk selalu memantau
              stok barang!
            </p>
            <NuxtLink
              to="/admin/products"
              class="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
            >
              Ke Manajemen Produk
              <Icon name="uil:arrow-right" />
            </NuxtLink>
          </div>

          <!-- Abstract Background Decor -->
          <div
            class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          ></div>
          <div
            class="absolute right-10 top-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"
          ></div>
          <Icon
            name="uil:rocket"
            class="absolute right-12 bottom-12 text-8xl text-white/10 transform -rotate-12"
          />
        </div>
      </div>
    </div>
  </div>
</template>
