import type {
  CheckoutRequest,
  AddProductRequest,
  UpdateProductRequest,
  UpdateCategoryRequest,
  UpdateSettingRequest,
} from "~/types";
import { useAuthStore } from "~/store/auth";

export const useApi = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  const fetchWithSecurity = async <T>(url: string, options: any = {}) => {
    const headers: Record<string, string> = { ...options.headers };

    if (authStore.token) {
      headers["Authorization"] = `Bearer ${authStore.token}`;
    }

    try {
      return await $fetch<T>(url, {
        baseURL: baseUrl,
        ...options,
        headers,
        credentials: "include",
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Sesi tidak valid/kadaluarsa, me-logout otomatis.");
        authStore.logout();
        if (process.client) {
          const path = window.location.pathname;
          if (path.startsWith("/admin") && path !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      }
      throw error;
    }
  };

  return {
    getProducts: async () => {
      const response = await $fetch<any>("/products", { baseURL: baseUrl });
      return Array.isArray(response) ? response : response.data || [];
    },
    getProductById: async (id: string) => {
      const response = await $fetch<any>(`/products/${id}`, {
        baseURL: baseUrl,
      });
      return response.data || response;
    },
    checkoutOrder: (data: CheckoutRequest) =>
      fetchWithSecurity<any>("/checkout", { method: "POST", body: data }),

    adminLogin: (data: any) =>
      fetchWithSecurity<any>("/admin/login", { method: "POST", body: data }),
    adminLogout: () =>
      fetchWithSecurity<void>("/admin/logout", { method: "POST" }),

    uploadImage: async (formData: FormData) => {
      const response = await fetchWithSecurity<any>("/upload", {
        method: "POST",
        body: formData,
      });
      return response.data || response;
    },
    createProduct: (data: AddProductRequest) =>
      fetchWithSecurity<void>("/products", { method: "POST", body: data }),
    updateProduct: (id: string, data: UpdateProductRequest) =>
      fetchWithSecurity<void>(`/products/${id}`, {
        method: "PATCH",
        body: data,
      }),
    deleteProduct: (id: string) =>
      fetchWithSecurity<void>(`/products/${id}`, { method: "DELETE" }),

    getCategories: async () => {
      const response = await $fetch<any>("/categories", { baseURL: baseUrl });
      return Array.isArray(response) ? response : response.data || [];
    },
    createCategory: (data: UpdateCategoryRequest) =>
      fetchWithSecurity<void>("/categories", { method: "POST", body: data }),
    updateCategory: (id: string, data: UpdateCategoryRequest) =>
      fetchWithSecurity<void>(`/categories/${id}`, {
        method: "PATCH",
        body: data,
      }),
    deleteCategory: (id: string) =>
      fetchWithSecurity<void>(`/categories/${id}`, { method: "DELETE" }),

    getAllOrders: async () => {
      const response = await fetchWithSecurity<any>("/orders");
      return Array.isArray(response) ? response : response.data || [];
    },
    getOrderById: async (id: string) => {
      const response = await fetchWithSecurity<any>(`/orders/${id}`);
      return response.data || response;
    },
    cancelOrder: (id: string) =>
      fetchWithSecurity<void>(`/orders/${id}/cancel`, { method: "PATCH" }),

    getSettings: async () => {
      const response = await fetchWithSecurity<any>("/settings");
      return response.data || response;
    },
    updateSettings: (data: UpdateSettingRequest) =>
      fetchWithSecurity<void>("/settings", { method: "PATCH", body: data }),
  };
};
