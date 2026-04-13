<script setup lang="ts">
import type { Product } from "~/types";

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();
const cartQuantity = computed(() => {
  const item = cartStore.items.find((i) => i.product_id === props.product.id);
  return item?.quantity || 0;
});
const remainingStock = computed(() => props.product.stock - cartQuantity.value);
const isOutOfStock = computed(
  () => !props.product.is_active || props.product.stock <= 0,
);
const isCartFull = computed(() => remainingStock.value <= 0);

const addToCart = () => {
  if (isOutOfStock.value || isCartFull.value) return;
  cartStore.addItem(props.product.id, 1);
};
</script>

<template>
  <div class="group cursor-pointer flex flex-col gap-3">
    <div
      class="relative bg-zinc-100 rounded-2xl aspect-square overflow-hidden flex items-center justify-center p-6"
    >
      <img
        :src="product.image_url || 'https://placehold.co/300x300?text=No+Image'"
        :alt="product.name"
        class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <div
        v-if="isOutOfStock"
        class="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center"
      >
        <span
          class="bg-zinc-950 text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide"
        >
          Stok Habis
        </span>
      </div>
      <button
        v-if="!isOutOfStock && !isCartFull"
        @click.stop="addToCart"
        class="absolute bottom-4 right-4 bg-zinc-950 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
        title="Add to Cart"
      >
        <Icon name="uil:plus" class="text-xl" />
      </button>
    </div>
    <div class="flex flex-col gap-1 px-1">
      <h3
        class="font-semibold text-zinc-900 text-base leading-snug line-clamp-1"
      >
        {{ product.name }}
      </h3>
      <div class="flex items-center gap-3 mt-1.5">
        <span
          v-if="!isOutOfStock"
          class="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200"
        >
          In Stock
        </span>
        <span class="text-zinc-600 font-medium text-sm">
          {{
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price)
          }}
        </span>
      </div>
    </div>
  </div>
</template>
