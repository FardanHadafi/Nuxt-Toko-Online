<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { getProducts, getCategories } = useApi();
const apiProducts = ref<any[]>([]);
const apiCategories = ref<any[]>([]);
const allProducts = computed(() => {
  return apiProducts.value.map((p) => ({
    ...p,
    img: p.image_url,
    images: p.images || [],
    inStock: p.stock > 0,
    new: p.is_active,
    price: Number(p.price),
  }));
});

const dynamicCategoryGrid = computed(() => {
  return apiCategories.value.map((cat) => {
    const count = apiProducts.value.filter(
      (p) => p.category_id === cat.id,
    ).length;
    return {
      category: cat.name,
      slug: cat.slug,
      item: `${count} items`,
      img: cat.image_url || "/images/cat-placeholder.png",
    };
  });
});

const activeFilter = ref("All Items");
const filteredProducts = computed(() => {
  if (activeFilter.value === "New Products") {
    return allProducts.value.filter((p) => p.new);
  } else if (activeFilter.value === "Classic") {
    return allProducts.value.filter((p) => !p.new);
  }
  return allProducts.value;
});

onMounted(async () => {
  try {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    apiProducts.value = prods;
    apiCategories.value = cats;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
  if (import.meta.client) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-content", {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    });

    gsap.from(".product-grid-item", {
      scrollTrigger: {
        trigger: "#categories",
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });

    gsap.from(".popular-header", {
      scrollTrigger: {
        trigger: "#products",
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });

    gsap.from(".popular-card", {
      scrollTrigger: {
        trigger: ".popular-cards-container",
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.4)",
    });

    gsap.from(".about-text", {
      scrollTrigger: {
        trigger: "#about",
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
    });
  }
});
</script>

<template>
  <div>
    <main
      id="home"
      class="min-h-screen bg-gray-100 pt-32 md:pt-48 flex flex-col items-center pb-24"
    >
      <div class="text-center max-w-xl px-4 hero-content">
        <h1 class="font-light text-4xl md:text-6xl leading-tight tracking-tight">
          Uncover
          <span class="text-orange-500">The Most</span> Innovative Products.
        </h1>
        <p class="mt-4 text-gray-400 text-base md:text-lg leading-relaxed">
          Exploring the tech and design shaping the world of tomorrow
        </p>
      </div>
      <div id="categories" class="w-full max-w-360 px-4 mt-20 md:mt-24">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NuxtLink
            v-for="product in dynamicCategoryGrid"
            :key="product.slug"
            :to="`/category/${product.slug}`"
            class="group cursor-pointer bg-white product-grid-item block shadow-sm"
          >
            <div class="overflow-hidden bg-gray-100 relative pt-[75%]">
              <img
                :src="product.img"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div
              class="p-6 transition-colors duration-500 group-hover:bg-orange-500"
            >
              <h2
                class="text-lg font-medium text-gray-900 transition-colors duration-500 group-hover:text-white"
              >
                {{ product.category }}
              </h2>
              <p
                class="text-sm text-gray-500 mt-1 transition-colors duration-500 group-hover:text-orange-100"
              >
                {{ product.item }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div
        id="products"
        class="text-center max-w-2xl px-4 mt-32 md:mt-48 flex flex-col items-center popular-header"
      >
        <span
          class="inline-block bg-white px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-widest shadow-sm mb-6"
        >
          Popular Selection
        </span>
        <h1 class="font-light text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
          Check Out Our
          <span class="text-orange-500">Most Loved</span> Pieces.
        </h1>
        <p class="mt-4 text-gray-400 text-base md:text-lg leading-relaxed">
          Curated tech and lifestyle essentials for the modern pioneer.
        </p>
        <div class="flex items-center justify-center flex-wrap gap-2 mt-12 md:mt-24">
          <button
            @click="activeFilter = 'All Items'"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all bg-white shadow-sm',
              activeFilter === 'All Items'
                ? 'text-orange-500 border border-orange-500'
                : 'text-gray-400 border border-transparent hover:text-orange-500',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            All Items
          </button>
          <button
            @click="activeFilter = 'New Products'"
            :class="[
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white',
              activeFilter === 'New Products'
                ? 'text-orange-500 border border-orange-500'
                : 'text-gray-700 border border-transparent hover:text-orange-500',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
            New Products
          </button>
          <button
            @click="activeFilter = 'Classic'"
            :class="[
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white',
              activeFilter === 'Classic'
                ? 'text-orange-500 border border-orange-500'
                : 'text-gray-700 border border-transparent hover:text-orange-500',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
            Classic
          </button>
        </div>
      </div>
      <div class="w-full max-w-280 px-4 mt-10 popular-cards-container">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2">
          <NuxtLink
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            class="bg-white p-6 sm:p-8 relative flex flex-col justify-between group cursor-pointer popular-card shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div class="absolute top-6 left-6 flex flex-col gap-2 z-10">
              <div
                v-if="product.new"
                class="bg-[#FF5A00] text-white text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 shadow-lg"
              >
                New
              </div>
            </div>
            <button
              @click.stop.prevent="useCartStore().addItem(product.id, 1)"
              class="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 sm:group-hover:translate-y-0 z-20 hover:bg-orange-600 shadow-xl"
              title="Add to Cart"
            >
              <Icon name="uil:plus" class="text-xl" />
            </button>
            <div
              class="h-64 sm:h-72 flex justify-center items-center overflow-hidden mb-10"
            >
              <img
                :src="product.img"
                class="object-contain transition-transform duration-700 group-hover:scale-110 h-full w-full p-4"
              />
            </div>

            <!-- Info -->
            <div class="mt-auto pt-6 border-t border-gray-50 flex justify-between items-end">
              <div>
                <h3 class="text-base font-bold text-gray-900 line-clamp-1 italic">
                  {{ product.name }}
                </h3>
                <p
                  class="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold"
                  v-if="product.inStock"
                >
                  Authentic Selection
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
      </div>
      <div
        id="about"
        class="text-center max-w-2xl px-4 mt-32 md:mt-48 flex flex-col items-center about-text"
      >
        <span
          class="inline-block bg-white px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-widest shadow-sm mb-6"
        >
          Our Core
        </span>
        <h1 class="font-light text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
          Learn More <span class="text-orange-500">About Our Vision</span>
        </h1>
        <p class="mt-4 text-gray-400 text-base md:text-lg leading-relaxed">
          Crafting the future of retail through curated excellence.
        </p>
      </div>

      <div class="w-full max-w-350 px-4 mt-12 mb-32">
        <div class="grid grid-cols-4 gap-2">
          <div
            class="col-span-4 md:col-span-2 bg-white px-10 py-6 flex flex-col justify-center group cursor-default"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-orange-500 mb-4 transition-transform group-hover:-translate-y-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.813-3.814a1.5 1.5 0 00-2.121-2.122l-3.814 3.813a15.995 15.995 0 00-4.648 4.764m3.42 3.42a15.995 15.995 0 01-4.648-4.764m3.42 3.42a15.995 15.995 0 00-4.648-4.764"
              />
            </svg>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              Well-Designed Products
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              We focus on products where form, function, and thoughtful design
              come together.
            </p>
          </div>
          <div
            class="col-span-4 md:col-span-2 bg-white px-10 py-6 flex flex-col justify-center group cursor-default about-text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-orange-500 mb-4 transition-transform group-hover:-translate-y-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              Modern Tech Selection
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              A curated range of tech products built for everyday use and
              creative workflows.
            </p>
          </div>
          <div
            class="col-span-2 md:col-span-1 bg-white p-6 cursor-default group about-text"
          >
            <h2
              class="text-3xl font-semibold text-orange-500 mb-2 group-hover:scale-105 transition-transform origin-left"
            >
              12+
            </h2>
            <p class="text-sm text-gray-500">Official Partners</p>
          </div>
          <div
            class="col-span-2 md:col-span-1 bg-white p-6 cursor-default group about-text"
          >
            <h2
              class="text-3xl font-semibold text-orange-500 mb-2 group-hover:scale-105 transition-transform origin-left"
            >
              9,000+
            </h2>
            <p class="text-sm text-gray-500">Community Members</p>
          </div>
          <div
            class="col-span-2 md:col-span-1 bg-white p-6 cursor-default group about-text"
          >
            <h2
              class="text-3xl font-semibold text-orange-500 mb-2 group-hover:scale-105 transition-transform origin-left"
            >
              1,000+
            </h2>
            <p class="text-sm text-gray-500">Orders This Month</p>
          </div>
          <div
            class="col-span-2 md:col-span-1 bg-white p-6 cursor-default group about-text"
          >
            <h2
              class="text-3xl font-semibold text-orange-500 mb-2 group-hover:scale-105 transition-transform origin-left"
            >
              299+
            </h2>
            <p class="text-sm text-gray-500">Reviews</p>
          </div>
        </div>
        <div class="flex justify-center mt-12">
          <NuxtLink
            to="/about"
            class="bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:text-orange-500 shadow-sm transition-colors border border-transparent hover:border-orange-500 cursor-pointer"
          >
            More About Us
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
