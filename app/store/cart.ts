import { defineStore } from 'pinia';
import type { CheckoutItem } from '~/types';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CheckoutItem[],
  }),
  actions: {
    addItem(productId: string, quantity: number = 1) {
      const existing = this.items.find(i => i.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({ product_id: productId, quantity });
      }
    },
    removeItem(productId: string) {
      this.items = this.items.filter(i => i.product_id !== productId);
    },
    clearCart() {
      this.items = [];
    },
  },
});
