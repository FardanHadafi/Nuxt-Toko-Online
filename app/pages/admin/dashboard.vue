<script setup lang="ts">
const { getProducts, getAllOrders } = useApi();
const stats = ref([
  {
    name: "Total Products",
    value: "...",
    icon: "uil:package",
    suffix: "Items",
  },
  {
    name: "Orders Received",
    value: "...",
    icon: "uil:shopping-basket",
    suffix: "Orders",
  },
  {
    name: "Total Revenue",
    value: "...",
    icon: "uil:money-bill",
    suffix: "IDR",
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
        order.status === "capture"
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
  title: "Dashboard Overview",
});

useHead({
  title: "Dashboard | Uncover Admin",
});
</script>

<template>
  <div class="space-y-12 max-w-7xl">
    <div class="dashboard-section">
      <h1 class="text-5xl font-light text-gray-900 tracking-tight italic">
        System<span class="font-bold not-italic"> Overview</span>
      </h1>
      <p class="text-gray-400 mt-2 tracking-wide uppercase text-xs font-bold">
        Performance snapshot for your innovative products
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white p-10 border border-gray-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-[#FF5A00] hover:shadow-md group stat-card"
      >
        <div class="flex justify-between items-start mb-8">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
            {{ stat.name }}
          </p>
          <div
            class="w-10 h-10 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF5A00]/10 group-hover:text-[#FF5A00] transition-colors"
          >
            <Icon :name="stat.icon" class="text-xl" />
          </div>
        </div>
        <div>
          <p class="text-4xl font-light text-gray-900 tracking-tighter">
            {{ stat.value }}
          </p>
          <p
            class="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest"
          >
            {{ stat.suffix }}
          </p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 dashboard-section">
      <div class="lg:col-span-4 space-y-6">
        <div class="bg-white p-10 border border-gray-200 shadow-sm">
          <h3
            class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8"
          >
            Quick Actions
          </h3>
          <div class="grid grid-cols-1 gap-1">
            <NuxtLink
              to="/admin/products"
              class="flex items-center justify-between p-6 bg-gray-50 hover:bg-black group transition-all duration-300"
            >
              <div class="flex items-center gap-4">
                <Icon name="uil:plus-circle" class="text-xl text-[#FF5A00]" />
                <span
                  class="text-sm font-bold text-gray-900 group-hover:text-white transition-colors"
                  >Add New Product</span
                >
              </div>
              <Icon
                name="uil:arrow-right"
                class="text-gray-300 group-hover:text-[#FF5A00] transition-colors"
              />
            </NuxtLink>
            <NuxtLink
              to="/admin/orders"
              class="flex items-center justify-between p-6 bg-gray-50 hover:bg-black group transition-all duration-300"
            >
              <div class="flex items-center gap-4">
                <Icon name="uil:invoice" class="text-xl text-[#FF5A00]" />
                <span
                  class="text-sm font-bold text-gray-900 group-hover:text-white transition-colors"
                  >Manage Orders</span
                >
              </div>
              <Icon
                name="uil:arrow-right"
                class="text-gray-300 group-hover:text-[#FF5A00] transition-colors"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="lg:col-span-8">
        <div
          class="bg-white p-12 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-center h-full"
        >
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-gray-50 -mr-32 -mt-32 rotate-45"
          ></div>
          <div class="relative z-10 max-w-lg">
            <h2
              class="text-4xl font-light text-gray-900 tracking-tight leading-tight mb-6"
            >
              Inventory Mastery
            </h2>
            <p class="text-gray-400 mb-8 leading-relaxed text-sm tracking-wide">
              Your dashboard is synced with real-time analytics. Oversee stock
              levels, review order histories, and keep your innovative
              storefront optimized for the modern user.
            </p>
            <div class="flex gap-4">
              <NuxtLink
                to="/admin/products"
                class="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#FF5A00] transition-colors shadow-xl"
              >
                Products Catalog
                <Icon name="uil:external-link-alt" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
