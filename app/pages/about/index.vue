<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger);
}

definePageMeta({
  layout: "default",
  pageTransition: {
    onAfterEnter: () => {
      if (import.meta.client) {
        ScrollTrigger.refresh();
      }
    },
  },
});

useHead({
  title: "About Us | Uncover",
  meta: [
    {
      name: "description",
      content:
        "Learn more about Uncover, our values, and our mission to bring professional tech to everyone.",
    },
  ],
});

const productCategories = [
  {
    title: "Popular Products",
    description: "Loved By Everyone",
    icon: "uil:star",
  },
  {
    title: "Useful Products",
    description: "Practical Everyday Essentials",
    icon: "uil:setting",
  },
  {
    title: "Electronic Products",
    description: "Latest Tech Gadgets",
    icon: "uil:battery-empty",
  },
  {
    title: "Innovative Products",
    description: "Creative New Solutions",
    icon: "uil:circuit",
  },
  {
    title: "Well-Designed Products",
    description: "Beautiful And Functional",
    icon: "uil:pen",
  },
  {
    title: "High-Quality Products",
    description: "Built To Last",
    icon: "uil:shield-check",
  },
];

const faqs = ref([
  {
    question: "What types of projects do you work on?",
    answer:
      "We offer a curated selection of modern products with a strong focus on design, quality, and usability. Every item is chosen carefully to fit our overall aesthetic and standards.",
    isOpen: true,
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we offer international shipping to most countries. Shipping options and delivery times may vary depending on your location.",
    isOpen: false,
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery usually takes between 3-10 business days, depending on the destination and shipping method selected at checkout.",
    isOpen: false,
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes, you can return unused products within 14 days of delivery. Please make sure the item is in its original condition and packaging.",
    isOpen: false,
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach us anytime via email or through our contact page. We usually respond within 24 hours.",
    isOpen: false,
  },
]);

const toggleFaq = (index: number) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen;
};

let ctx: gsap.Context;

onMounted(() => {
  if (import.meta.client) {
    ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".hero-animate", {
        opacity: 0,
        y: 15,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });

      tl.from(
        ".product-card",
        {
          opacity: 0,
          scale: 0.98,
          duration: 0.1,
          stagger: 0.2,
          ease: "power2.out",
          clearProps: "all",
        },
        "-=0.3",
      );

      gsap.from(".cta-section", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        duration: 0.8,
        ease: "power1.out",
      });

      gsap.from(".faq-item", {
        scrollTrigger: {
          trigger: ".faq-section-header",
          start: "top 85%",
        },
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.2,
        ease: "power2.out",
      });
    });

    setTimeout(() => ScrollTrigger.refresh(), 200);
  }
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div class="min-h-screen bg-[#F8F8F8] text-gray-900 pb-20">
    <header
      class="container mx-auto px-6 pt-32 pb-16 text-center max-w-4xl section-header"
    >
      <div
        class="hero-animate inline-block px-3 py-1 mb-6 bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded shadow-sm"
      >
        Our Products
      </div>
      <h1
        class="hero-animate text-5xl md:text-6xl font-normal tracking-tight text-gray-950 mb-6"
      >
        About Our <span class="text-[#FF5A00]">Products</span>
      </h1>
      <p
        class="hero-animate text-sm text-gray-500 max-w-lg mx-auto leading-relaxed"
      >
        Explore the types of products available in our store.
      </p>
    </header>
    <section class="max-w-[1100px] mx-auto px-6 mb-32 product-grid">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(cat, idx) in productCategories"
          :key="idx"
          class="product-card flex items-center p-6 bg-white border border-gray-100 rounded shadow-sm transition-all duration-300 group"
        >
          <div
            class="shrink-0 w-12 h-12 flex items-center justify-center bg-[#FF5A00] rounded-sm mr-6 group-hover:scale-110 transition-transform duration-500"
          >
            <Icon :name="cat.icon" class="text-2xl text-white" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-lg font-medium text-gray-900 mb-0.5">
              {{ cat.title }}
            </h3>
            <p
              class="text-[13px] text-gray-400 font-normal uppercase tracking-wide"
            >
              {{ cat.description }}
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="max-w-[1100px] mx-auto px-6 mb-32 cta-section">
      <div
        class="relative w-full h-[400px] rounded-sm overflow-hidden flex items-center justify-center text-center"
      >
        <div class="absolute inset-0 bg-gray-900 z-0">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
            alt="Products background"
            class="w-full h-full object-cover opacity-20 grayscale"
          />
        </div>
        <div class="relative z-10 cta-content px-6">
          <h2
            class="text-4xl md:text-6xl font-normal text-white mb-10 tracking-tight"
          >
            Find Your <span class="text-[#FF5A00]">Product</span>
          </h2>
          <NuxtLink
            to="/categories"
            class="inline-block bg-white text-black text-[12px] font-bold uppercase tracking-[0.2em] px-10 py-4 hover:bg-[#FF5A00] hover:text-white transition-all duration-300"
          >
            Explore Categories
          </NuxtLink>
        </div>
      </div>
    </section>
    <header
      class="container mx-auto px-6 pt-16 pb-12 text-center max-w-4xl faq-section-header"
    >
      <div
        class="faq-item inline-block px-3 py-1 mb-6 bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded shadow-sm"
      >
        FAQs
      </div>
      <h2
        class="faq-item text-5xl md:text-6xl font-normal tracking-tight text-gray-950 mb-6"
      >
        Frequently Asked <span class="text-[#FF5A00]">Questions</span>
      </h2>
      <p
        class="faq-item text-sm text-gray-500 max-w-lg mx-auto leading-relaxed"
      >
        Common questions about our products, shipping, and support.
      </p>
    </header>
    <section class="max-w-[1000px] mx-auto px-6 mb-32 faq-section">
      <div class="flex flex-col gap-4">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="faq-item overflow-hidden"
        >
          <button
            @click="toggleFaq(idx)"
            class="w-full flex items-center justify-between p-7 bg-white border border-gray-100 rounded shadow-sm text-left group transition-all hover:border-gray-200"
          >
            <span
              class="text-lg font-medium text-gray-900 pr-8 transition-colors group-hover:text-black"
              >{{ faq.question }}</span
            >
            <div
              class="shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': faq.isOpen }"
            >
              <svg
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#FF5A00"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>

          <Transition
            @enter="
              (el) =>
                gsap.fromTo(
                  el,
                  { height: 0, opacity: 0 },
                  {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                  },
                )
            "
            @leave="
              (el) =>
                gsap.to(el, {
                  height: 0,
                  opacity: 0,
                  duration: 0.3,
                  ease: 'power2.in',
                })
            "
          >
            <div
              v-if="faq.isOpen"
              class="overflow-hidden bg-white border-x border-b border-gray-100 rounded-b-sm -mt-1 shadow-sm"
            >
              <div class="p-8 pt-0">
                <p class="text-gray-500 text-sm leading-relaxed max-w-2xl">
                  {{ faq.answer }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f8f8f8;
}
::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}
</style>
