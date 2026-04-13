<script setup>
import { onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

let smoother;

onMounted(() => {
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.5,
    effects: true,
  });
});

onUnmounted(() => {
  if (smoother) smoother.kill();
});
</script>

<template>
  <Navbar />
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>
