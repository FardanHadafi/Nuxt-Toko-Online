import { defineStore } from 'pinia';
import type { CheckoutItem } from '~/types';

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
  sameSite: 'lax' as const,
};

export const useCartStore = defineStore('cart', {
  state: () => {
    const cartCookie = useCookie<CheckoutItem[]>('cart_items', COOKIE_OPTIONS);
    return {
      items: cartCookie.value || ([] as CheckoutItem[]),
    };
  },
  getters: {
    totalItems: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  actions: {
    _persist() {
      const cartCookie = useCookie<CheckoutItem[]>('cart_items', COOKIE_OPTIONS);
      cartCookie.value = this.items;
    },
    addItem(productId: string, quantity: number = 1) {
      const existing = this.items.find(i => i.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({ product_id: productId, quantity });
      }
      this._persist();
    },
    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(i => i.product_id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this._persist();
      }
    },
    removeItem(productId: string) {
      this.items = this.items.filter(i => i.product_id !== productId);
      this._persist();
    },
    clearCart() {
      this.items = [];
      this._persist();
    },
  },
});
