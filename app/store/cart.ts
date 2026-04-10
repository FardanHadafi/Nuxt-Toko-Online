import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { CheckoutItem } from "~/types";

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",
  sameSite: "lax" as const,
};

export const useCartStore = defineStore("cart", () => {
  const cartCookie = useCookie<CheckoutItem[]>("cart_items", COOKIE_OPTIONS);
  const items = ref<CheckoutItem[]>(cartCookie.value || []);

  watch(
    items,
    (newItems) => {
      cartCookie.value = newItems;
    },
    { deep: true },
  );

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  function addItem(productId: string, quantity: number = 1) {
    const existing = items.value.find((i) => i.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({ product_id: productId, quantity });
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((i) => i.product_id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.product_id !== productId);
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
});
