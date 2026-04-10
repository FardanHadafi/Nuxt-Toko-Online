export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  is_active: boolean;
  image_url: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  note?: string;
  whatsapp_url: string;
  snap_token: string;
  snap_redirect_url: string;
  payment_type?: string;
  items?: OrderItem[];
}

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AddProductRequest {
  name: string;
  price: number;
  category_id: string;
  description?: string;
  stock?: number;
  image_url?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  stock?: number;
  is_active?: boolean;
  image_url?: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface UpdateSettingRequest {
  store_name?: string;
  whatsapp_number?: string;
  address_info?: string;
}

export interface CheckoutItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: CheckoutItem[];
}
