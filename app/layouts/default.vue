<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

const route = useRoute();
const { smoother, setSmoother } = useSmoother();

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

onMounted(() => {
  if (import.meta.client) {
    const instance = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.0,
      effects: true,
    });
    setSmoother(instance);
  }
});

watch(
  () => route.fullPath,
  (newVal, oldVal) => {
    if (import.meta.client && smoother.value) {
      const newPath = newVal.split("#")[0];
      const oldPath = oldVal.split("#")[0];

      if (newPath !== oldPath) {
        setTimeout(() => {
          ScrollTrigger.refresh();
          smoother.value.scrollTop(0);

          if (route.hash) {
            smoother.value.scrollTo(route.hash, true);
          }
        }, 200);
      } else {
        if (route.hash) {
          smoother.value.scrollTo(route.hash, true);
        }
      }
    }
  },
);

onUnmounted(() => {
  if (smoother.value) {
    smoother.value.kill();
    setSmoother(null);
  }
});
</script>

<template>
  <div>
    <Navbar />
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <slot />
        <Footer />
      </div>
    </div>
  </div>
</template>
