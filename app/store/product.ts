import { defineStore } from 'pinia';
import type { Product, Category } from '~/types';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    setProducts(products: Product[]) {
      this.products = products;
    },
    setCategories(categories: Category[]) {
      this.categories = categories;
    },
    setLoading(status: boolean) {
      this.loading = status;
    },
    setError(message: string | null) {
      this.error = message;
    },
  },
});
