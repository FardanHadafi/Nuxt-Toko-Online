<script setup lang="ts">
const cartStore = useCartStore();
const { getProducts, checkoutOrder } = useApi();

const { data: allProducts } = await useAsyncData('products-cart', () => getProducts());

const cartItems = computed(() => {
  if (!allProducts.value) return [];
  return cartStore.items.map(item => {
    const product = allProducts.value?.find(p => p.id === item.product_id);
    return {
      ...item,
      product
    };
  }).filter(item => item.product);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);
});

const formData = reactive({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
});

const loading = ref(false);
const checkoutSuccess = ref(false);
const orderData = ref<any>(null);

const handleCheckout = async () => {
  if (cartItems.value.length === 0) return;
  
  loading.value = true;
  try {
    const payload = {
      ...formData,
      items: cartStore.items
    };
    
    const response = await checkoutOrder(payload);
    orderData.value = response;
    
    // Trigger Midtrans Snap
    const snap = (window as any).snap;
    if (snap) {
      snap.pay(response.snap_token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          checkoutSuccess.value = true;
          cartStore.clearCart();
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
          checkoutSuccess.value = true;
          cartStore.clearCart();
        },
        onError: (result: any) => {
          console.error('Payment error:', result);
          alert('Pembayaran gagal, silakan coba lagi.');
        },
        onClose: () => {
          console.log('Snap popup closed');
          // Still show WhatsApp option even if closed, as the order is created
          checkoutSuccess.value = true;
          cartStore.clearCart();
        }
      });
    } else {
      // Fallback if snap not loaded
      window.location.href = response.snap_redirect_url;
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    alert(error.data?.message || 'Gagal melakukan checkout. Periksa kembali data Anda.');
  } finally {
    loading.value = false;
  }
};

const goToWhatsApp = () => {
  if (orderData.value?.whatsapp_url) {
    window.open(orderData.value.whatsapp_url, '_blank');
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-5xl">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Keranjang Belanja</h1>

    <div v-if="checkoutSuccess" class="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
      <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="uil:check" class="text-5xl" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Pesanan Berhasil Dibuat!</h2>
      <p class="text-gray-500 mt-2 mb-8">
        Terima kasih {{ orderData?.customer_name }}. Pesanan Anda <b>#{{ orderData?.order_number }}</b> telah kami terima.
        Silakan selesaikan pembayaran dan konfirmasi melalui WhatsApp.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          @click="goToWhatsApp"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
        >
          <Icon name="uil:whatsapp" class="text-2xl" />
          Konfirmasi via WhatsApp
        </button>
        <NuxtLink 
          to="/"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          Belanja Lagi
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items List -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartItems" :key="item.product_id" class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <img :src="item.product?.image_url || 'https://via.placeholder.com/100'" class="w-20 h-20 object-cover rounded-lg" />
          <div class="flex-1">
            <h3 class="font-bold text-gray-800">{{ item.product?.name }}</h3>
            <p class="text-blue-600 font-medium">
              {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.product?.price || 0) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="cartStore.addItem(item.product_id, -1)" 
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition"
              :disabled="item.quantity <= 1"
            >
              <Icon name="uil:minus" />
            </button>
            <span class="font-bold w-6 text-center">{{ item.quantity }}</span>
            <button 
              @click="cartStore.addItem(item.product_id, 1)" 
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition"
            >
              <Icon name="uil:plus" />
            </button>
            <button 
              @click="cartStore.removeItem(item.product_id)" 
              class="ml-2 text-red-500 hover:text-red-600 p-2"
            >
              <Icon name="uil:trash-alt" class="text-xl" />
            </button>
          </div>
        </div>

        <div class="p-6 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
          <span class="text-blue-800 font-medium">Total Pembayaran</span>
          <span class="text-2xl font-bold text-blue-600">
            {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPrice) }}
          </span>
        </div>
      </div>

      <!-- Checkout Form -->
      <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-24">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Informasi Pengiriman</h2>
        <form @submit.prevent="handleCheckout" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input v-model="formData.customer_name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Budi Santoso" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="formData.customer_email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="budi@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
            <input v-model="formData.customer_phone" type="tel" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08123456789" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea v-model="formData.shipping_address" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Jl. Merdeka No. 123, Jakarta"></textarea>
          </div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="svg-spinners:180-ring" />
            {{ loading ? 'Memproses...' : 'Checkout Sekarang' }}
          </button>
          <p class="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold">
            Secure Payment by Midtrans
          </p>
        </form>
      </div>
    </div>

    <div v-else class="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Icon name="uil:shopping-cart" class="text-7xl text-gray-200 mb-4" />
      <h2 class="text-2xl font-bold text-gray-800">Keranjang Anda Kosong</h2>
      <p class="text-gray-500 mt-2 mb-8">Pilih produk favorit Anda terlebih dahulu.</p>
      <NuxtLink to="/" class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
        Lihat Produk
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Optional: prevent body scroll when snap popup is open */
:global(.snap-pay-modal) {
  z-index: 9999 !important;
}
</style>
