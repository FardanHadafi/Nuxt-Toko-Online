import type { 
  Product, 
  Category, 
  Order, 
  LoginResponse, 
  CheckoutRequest, 
  AddProductRequest, 
  UpdateProductRequest, 
  UpdateCategoryRequest, 
  UpdateSettingRequest 
} from '~/types';
import { useAuthStore } from '~/store/auth';

export const useApi = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;
  const csrfToken = useState<string | null>('csrf_token', () => null);

  const getCsrfToken = async () => {
    try {
      const response = await $fetch<{ csrf_token: string }>('/csrf-token', { 
        baseURL: baseUrl,
        credentials: 'include' 
      });
      csrfToken.value = response.csrf_token;
      return response.csrf_token;
    } catch (err) {
      console.error('Failed to fetch CSRF token', err);
      return null;
    }
  };

  const fetchWithSecurity = async <T>(url: string, options: any = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const headers: Record<string, string> = { ...options.headers };
    
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    // Add CSRF token for state-changing requests
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      if (!csrfToken.value) {
        await getCsrfToken();
      }
      if (csrfToken.value) {
        headers['X-CSRF-Token'] = csrfToken.value;
      }
    }

    return $fetch<T>(url, {
      baseURL: baseUrl,
      ...options,
      headers,
      credentials: 'include',
    });
  };

  return {
    getCsrfToken,
    // Public Endpoints
    getProducts: async () => {
      const response = await $fetch<any>('/products', { baseURL: baseUrl });
      return Array.isArray(response) ? response : response.data || [];
    },
    getProductById: async (id: string) => {
      const response = await $fetch<any>(`/products/${id}`, { baseURL: baseUrl });
      return response.data || response;
    },
    checkoutOrder: (data: CheckoutRequest) => fetchWithSecurity<any>('/checkout', { method: 'POST', body: data }),

    // Auth Endpoints
    adminLogin: (data: any) => fetchWithSecurity<any>('/admin/login', { method: 'POST', body: data }),
    adminLogout: () => fetchWithSecurity<void>('/admin/logout', { method: 'POST' }),

    // Admin Endpoints
    uploadImage: (formData: FormData) => fetchWithSecurity<{ url: string }>('/upload', { method: 'POST', body: formData }),
    createProduct: (data: AddProductRequest) => fetchWithSecurity<void>('/admin/products', { method: 'POST', body: data }),
    updateProduct: (id: string, data: UpdateProductRequest) => fetchWithSecurity<void>(`/admin/products/${id}`, { method: 'PATCH', body: data }),
    deleteProduct: (id: string) => fetchWithSecurity<void>(`/admin/products/${id}`, { method: 'DELETE' }),

    getCategories: async () => {
      const response = await fetchWithSecurity<any>('/categories');
      return Array.isArray(response) ? response : response.data || [];
    },
    createCategory: (data: UpdateCategoryRequest) => fetchWithSecurity<void>('/categories', { method: 'POST', body: data }),

    getAllOrders: async () => {
      const response = await fetchWithSecurity<any>('/orders');
      return Array.isArray(response) ? response : response.data || [];
    },

    getSettings: async () => {
      const response = await fetchWithSecurity<any>('/settings');
      return response.data || response;
    },
    updateSettings: (data: UpdateSettingRequest) => fetchWithSecurity<void>('/settings', { method: 'PATCH', body: data }),
  };
};
