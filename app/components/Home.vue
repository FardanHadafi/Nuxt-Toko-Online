<script setup lang="ts">
const { getProducts } = useApi();
const { data: products, pending, error } = await useAsyncData('products', () => getProducts());
</script>

<template>
  <div class="py-12 bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <header class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Uncover <span class="text-blue-600">The Most</span> Innovative Products
        </h1>
        <p class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Temukan gadget dan peralatan terbaik untuk kebutuhan Anda dengan kemudahan belanja via WhatsApp.
        </p>
      </header>

      <!-- Products Grid -->
      <section>
        <div v-if="pending" class="flex justify-center items-center py-20">
          <Icon name="svg-spinners:180-ring" class="text-4xl text-blue-500" />
        </div>

        <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Icon name="uil:exclamation-triangle" class="text-5xl text-red-500 mb-4" />
          <h2 class="text-xl font-bold text-gray-800">Gagal memuat produk</h2>
          <p class="text-gray-500 mt-2">Silakan coba lagi nanti atau hubungi admin.</p>
        </div>

        <div v-else-if="products?.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Icon name="uil:box" class="text-5xl text-gray-300 mb-4" />
          <h2 class="text-xl font-bold text-gray-800">Belum ada produk tersedia</h2>
          <p class="text-gray-500 mt-2">Nantikan produk terbaru dari kami segera!</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.id" 
            :product="product" 
          />
        </div>
      </section>
    </div>
  </div>
</template>
