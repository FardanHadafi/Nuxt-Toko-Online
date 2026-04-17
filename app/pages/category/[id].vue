<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { getProducts, getCategories } = useApi();
const route = useRoute();
const categorySlug = route.params.id as string;
const apiProducts = ref<any[]>([]);
const apiCategories = ref<any[]>([]);

onMounted(async () => {
  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    apiProducts.value = products;
    apiCategories.value = categories;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
});

const categoryTitle = computed(() => {
  return categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const categoryProducts = computed(() => {
  const targetCategory = apiCategories.value.find(
    (c) =>
      c.slug === categorySlug ||
      c.name.toLowerCase().replace(/\s+/g, "-") === categorySlug,
  );

  return apiProducts.value
    .filter((p) => {
      if (categorySlug === "best-sellers" || categorySlug === "best-seller") {
        return p.is_active;
      }
      return p.category_id === targetCategory?.id;
    })
    .map((p) => ({
      ...p,
      img: p.image_url,
      images: p.images || [],
      inStock: p.stock > 0,
      new: p.is_active,
      price: Number(p.price),
    }));
});

onMounted(() => {
  if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".category-title", {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    gsap.from(".category-card", {
      scrollTrigger: {
        trigger: ".category-grid",
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.4)",
    });
  }
});
</script>

<template>
  <div>
    <main
      class="min-h-screen bg-gray-100 pt-32 md:pt-48 pb-32 flex flex-col items-center"
    >
      <div class="text-center max-w-2xl px-4 category-title">
        <span
          class="inline-block bg-white px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-widest shadow-sm mb-6"
        >
          {{ categoryTitle }} Collection
        </span>
        <h1 class="font-light text-4xl md:text-6xl leading-tight tracking-tight">
          <span class="text-orange-500 capitalize">{{
            categorySlug === "outdoor" ? "Outdoors" : categoryTitle
          }}</span>
        </h1>
        <p class="mt-4 text-gray-500 text-lg leading-relaxed">
          Gear designed for movement, nature, and adventure.
        </p>
      </div>
      <div class="w-full max-w-280 px-4 mt-16 md:mt-24 category-grid">
        <div
          v-if="categoryProducts.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
        >
          <NuxtLink
            v-for="product in categoryProducts"
            :key="product.name"
            :to="`/products/${product.slug}`"
            class="bg-white p-6 sm:p-8 relative flex flex-col justify-between group cursor-pointer category-card shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div
              v-if="product.new"
              class="absolute top-6 left-6 bg-[#FF5A00] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 z-10 shadow-lg"
            >
              New Arrival
            </div>
            <div
              class="h-64 sm:h-72 flex justify-center items-center overflow-hidden mb-8"
            >
              <img
                :src="product.img"
                class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-4"
              />
            </div>
            <div class="mt-auto pt-6 border-t border-gray-50 flex justify-between items-end">
              <div>
                <h3 class="text-base font-bold text-gray-900 italic">
                  {{ product.name }}
                </h3>
                <p class="text-sm text-gray-400 mt-1" v-if="product.inStock">
                  In Stock
                </p>
              </div>
              <div class="shrink-0">
                <p class="text-sm font-bold text-gray-900">
                  Rp {{ new Intl.NumberFormat("id-ID").format(product.price) }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div
          v-else
          class="text-center text-gray-500 py-32 category-card bg-white shadow-sm w-full mx-auto max-w-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-12 h-12 mx-auto text-gray-300 mb-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <h3 class="text-2xl font-light mb-2">No products found</h3>
          <p class="text-sm">
            We are currently restocking this collection. Check back soon!
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
