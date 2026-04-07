import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      script: [
        {
          src: 'https://app.sandbox.midtrans.com/snap/snap.js',
          'data-client-key': 'SB-Mid-client-XXXXX', // Replace with real client key if needed
        },
      ],
    },
  },

  modules: ["@nuxt/icon", "@pinia/nuxt"],
  imports: {
    dirs: ["store"],
  },
  runtimeConfig: {
    public: {
      apiBase: "/api",
    },
  },
  routeRules: {
    "/api/_nuxt_icon/**": { cache: false }, // Bypass proxy for local icon API
    "/api/**": {
      proxy: "http://localhost/api/**",
    },
  },
  icon: {
    mode: "css",
    localApiEndpoint: "/_nuxt_icon",
  },
});