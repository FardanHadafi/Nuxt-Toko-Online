import tailwindcss from "@tailwindcss/vite";

const proxyTarget = process.env.NUXT_PROXY_TARGET!;

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
          src: "https://app.sandbox.midtrans.com/snap/snap.js",
          "data-client-key": process.env.MIDTRANS_CLIENT_KEY || "",
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
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    },
  },
  routeRules: {
    "/api/_nuxt_icon/**": { cache: false },
    "/api/**": {
      proxy: `${proxyTarget}/api/**`,
    },
  },
  icon: {
    mode: "css",
    localApiEndpoint: "/_nuxt_icon",
  },
});
