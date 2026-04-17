<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { getProducts } = useApi();
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const apiProduct = ref<any>(null);
const fetchProduct = async () => {
  try {
    const products = await getProducts();
    const found = products.find((p: any) => p.slug === productId.value);
    if (found) {
      const rawGallery =
        found.images && found.images.length > 0
          ? found.images
          : [found.image_url];
      // Deduplicate gallery URLs
      const uniqueGallery = [...new Set(rawGallery)];

      apiProduct.value = {
        ...found,
        img: found.image_url,
        gallery: uniqueGallery,
        inStock: found.stock > 0,
        price: Number(found.price),
        category: found.category_slug || found.category?.slug || "general",
        category_display:
          found.category_name || found.category?.name || "Product",
      };
      activeImage.value = apiProduct.value.img;
    }
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }
};

const productId = computed(() => route.params.id as string);

onMounted(fetchProduct);

watch(productId, () => {
  fetchProduct();
});

const product = computed(() => {
  return apiProduct.value;
});

const activeImage = ref("");

const isAdding = ref(false);

const addToCart = () => {
  if (!product.value) return;
  cartStore.addItem(product.value.id, 1);
  isAdding.value = true;
  setTimeout(() => {
    isAdding.value = false;
  }, 2000);
};

const buyNow = () => {
  if (!product.value) return;
  cartStore.addItem(product.value.id, 1);
  router.push("/cart");
};

onMounted(() => {
  if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".product-gallery", {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    gsap.from(".product-info > *", {
      x: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });
  }
});

const selectImage = (img: string) => {
  activeImage.value = img;
};
</script>

<template>
  <div v-if="product">
    <main
      class="min-h-screen bg-gray-100 pt-32 pb-48 flex flex-col items-center"
    >
      <div class="w-full max-w-280 px-4 mb-12">
        <nav class="flex text-sm font-medium text-gray-400 gap-2">
          <NuxtLink to="/#home" class="hover:text-orange-500 transition-colors"
            >Home</NuxtLink
          >
          <span>/</span>
          <NuxtLink
            :to="`/category/${product.category}`"
            class="hover:text-orange-500 transition-colors capitalize"
          >
            {{ product.category_display }}
          </NuxtLink>
          <span>/</span>
          <span class="text-gray-900">{{ product.name }}</span>
        </nav>
      </div>
      <div class="w-full max-w-280 px-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div class="md:col-span-7 product-gallery">
            <div
              class="bg-white p-12 flex justify-center items-center h-[600px] overflow-hidden shadow-sm"
            >
              <img
                :src="activeImage"
                :alt="product.name"
                class="w-full h-full object-contain transition-all duration-700 transform hover:scale-105"
              />
            </div>
            <div
              v-if="product.gallery && product.gallery.length > 1"
              class="flex gap-4 mt-4 overflow-x-auto pb-4"
            >
              <button
                v-for="(img, idx) in product.gallery"
                :key="idx"
                @click="selectImage(img)"
                class="w-24 h-24 bg-white p-2 border-2 transition-all duration-300"
                :class="
                  activeImage === img
                    ? 'border-orange-500 shadow-md'
                    : 'border-transparent hover:border-gray-200'
                "
              >
                <img :src="img" class="w-full h-full object-contain" />
              </button>
            </div>
          </div>
          <div class="md:col-span-5 flex flex-col product-info">
            <span
              class="text-xs uppercase tracking-widest text-orange-500 font-bold mb-4"
            >
              {{ product.category_display }}
            </span>
            <h1 class="text-5xl font-light text-gray-900 leading-tight mb-6">
              {{ product.name }}
            </h1>
            <div class="flex items-center gap-4 mb-8">
              <span class="text-3xl font-medium text-gray-900"
                >Rp
                {{ new Intl.NumberFormat("id-ID").format(product.price) }}</span
              >
              <span
                v-if="product.inStock"
                class="bg-green-100 text-green-700 text-xs px-2 py-1 font-semibold uppercase tracking-wider"
              >
                In Stock
              </span>
            </div>
            <div class="h-px bg-gray-200 w-full mb-8"></div>
            <p class="text-gray-500 leading-relaxed text-lg mb-10">
              {{ product.description }}
            </p>
            <div class="flex flex-col gap-4 mt-auto">
              <button
                @click="addToCart"
                :disabled="isAdding"
                class="w-full bg-[#FF5A00] text-white py-5 text-sm font-bold uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-lg disabled:bg-gray-400"
              >
                {{ isAdding ? "Added to Cart!" : "Add to Cart" }}
              </button>
              <button
                @click="buyNow"
                class="w-full border border-gray-300 py-5 text-sm font-bold uppercase tracking-widest hover:border-black transition-colors duration-300 bg-white"
              >
                Buy Now
              </button>
            </div>
            <div class="mt-12 flex items-center gap-6">
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-gray-400"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V3.375c0-.621-.508-1.125-1.129-1.125H16.125M16.125 3.375h1.5c.621 0 1.129.504 1.129 1.125v1.5m-1.129-1.5a1.5 1.5 0 00-3 0m3 0l-1.5 1.5M12 18.75a1.5 1.5 0 00-1.5-1.5m1.5 1.5v-1.5m-1.5 1.5H10.5M3.375 18.75h1.5m0-1.5A1.5 1.5 0 016 18.75m0 0a1.5 1.5 0 01-3 0"
                  />
                </svg>
                <span class="text-xs text-gray-500 font-medium"
                  >Free Shipping</span
                >
              </div>
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 text-gray-400"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z"
                  />
                </svg>
                <span class="text-xs text-gray-500 font-medium"
                  >Two Years Warranty</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <h2 class="text-3xl font-light mb-4">Product Not Found</h2>
      <NuxtLink
        to="/#products"
        class="text-orange-500 border-b border-orange-500 pb-1"
        >Back to Store</NuxtLink
      >
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
