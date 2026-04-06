import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger);

  return {
    provide: {
      gsap,
    },
  };
});
