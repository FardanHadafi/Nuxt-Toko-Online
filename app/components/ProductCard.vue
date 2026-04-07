<script setup lang="ts">
import type { Product } from '~/types';

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();

const addToCart = () => {
  cartStore.addItem(props.product.id, 1);
  // Show a simple toast or feedback here in future
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition duration-300">
    <div class="aspect-square bg-gray-50 relative overflow-hidden">
      <img 
        :src="product.image_url || 'https://placehold.co/300x300?text=No+Image'" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
      />
      <div v-if="!product.is_active" class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span class="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold uppercase">Stok Habis</span>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="font-bold text-gray-800 text-lg line-clamp-1">{{ product.name }}</h3>
      <p class="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{{ product.description }}</p>
      
      <div class="flex items-center justify-between mt-4">
        <div class="text-blue-600 font-bold text-xl">
          {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price) }}
        </div>
        
        <button 
          @click="addToCart" 
          :disabled="!product.is_active"
          class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed group"
          title="Tambah ke Keranjang"
        >
          <Icon name="uil:shopping-cart-alt" class="text-xl group-hover:scale-110 transition" />
        </button>
      </div>
    </div>
  </div>
</template>
