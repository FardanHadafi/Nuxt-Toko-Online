<script setup lang="ts">
const cartStore = useCartStore();
const { getProducts, checkoutOrder } = useApi();

const { data: allProducts } = await useAsyncData("products-cart", () =>
  getProducts(),
);

const cartItems = computed(() => {
  if (!allProducts.value) return [];
  return cartStore.items
    .map((item) => {
      const product = allProducts.value?.find((p) => p.id === item.product_id);
      return {
        ...item,
        product,
      };
    })
    .filter((item) => item.product);
});

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);
});

const formData = reactive({
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  shipping_address: "",
});

const loading = ref(false);

const pendingOrderCookie = useCookie<any>("pending_order", {
  maxAge: 60 * 60 * 2, // 2 hours (match Midtrans token expiry)
  path: "/",
  sameSite: "lax" as const,
});
const paymentStatusCookie = useCookie<"paid" | "pending" | "cancelled" | null>(
  "payment_status",
  {
    maxAge: 60 * 60 * 2,
    path: "/",
    sameSite: "lax" as const,
  },
);

const checkoutSuccess = ref(!!pendingOrderCookie.value);
const orderData = ref<any>(pendingOrderCookie.value || null);
const paymentStatus = ref(paymentStatusCookie.value || null);

const savePendingOrder = (
  order: any,
  status: "paid" | "pending" | "cancelled",
) => {
  orderData.value = order;
  paymentStatus.value = status;
  pendingOrderCookie.value = order;
  paymentStatusCookie.value = status;
  checkoutSuccess.value = true;
};

const clearPendingOrder = () => {
  orderData.value = null;
  paymentStatus.value = null;
  pendingOrderCookie.value = null;
  paymentStatusCookie.value = null;
  checkoutSuccess.value = false;
};

const handleCheckout = async () => {
  if (cartItems.value.length === 0) return;

  loading.value = true;
  try {
    const sanitizedPhone = formData.customer_phone.replace(/\D/g, "");
    const payload = {
      ...formData,
      customer_phone: sanitizedPhone,
      items: cartStore.items,
    };

    const rawResponse = await checkoutOrder(payload);
    const response = rawResponse.data || rawResponse;

    // Trigger Midtrans Snap
    const snap = (window as any).snap;
    if (snap && response.snap_token) {
      snap.pay(response.snap_token, {
        onSuccess: (result: any) => {
          console.log("Payment success:", result);
          savePendingOrder(response, "paid");
          cartStore.clearCart();
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result);
          savePendingOrder(response, "pending");
          cartStore.clearCart();
        },
        onError: (result: any) => {
          console.error("Payment error:", result);
          alert("Pembayaran gagal, silakan coba lagi.");
        },
        onClose: () => {
          console.log("Snap popup closed by user");
          alert("Pembayaran dibatalkan. Anda dapat mencoba checkout kembali.");
        },
      });
    } else if (response.snap_redirect_url) {
      window.location.href = response.snap_redirect_url;
    } else {
      savePendingOrder(response, "pending");
      cartStore.clearCart();
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    const detail =
      error.data?.detail ||
      error.data?.message ||
      error.data?.error ||
      error.statusMessage ||
      "Gagal melakukan checkout. Periksa kembali data Anda.";
    alert(`Checkout Gagal: ${detail}`);
  } finally {
    loading.value = false;
  }
};

const resumePayment = () => {
  const snap = (window as any).snap;
  const token = orderData.value?.snap_token;
  if (snap && token) {
    snap.pay(token, {
      onSuccess: (result: any) => {
        console.log("Payment success:", result);
        savePendingOrder(orderData.value, "paid");
      },
      onPending: (result: any) => {
        console.log("Payment still pending:", result);
      },
      onError: (result: any) => {
        console.error("Payment error:", result);
        alert("Pembayaran gagal, silakan coba lagi.");
      },
      onClose: () => {
        console.log("Snap popup closed again");
      },
    });
  } else if (orderData.value?.snap_redirect_url) {
    window.open(orderData.value.snap_redirect_url, "_blank");
  }
};

const goToWhatsApp = () => {
  if (orderData.value?.whatsapp_url) {
    window.open(orderData.value.whatsapp_url, "_blank");
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-5xl">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Keranjang Belanja</h1>
    <div
      v-if="checkoutSuccess && paymentStatus === 'paid'"
      class="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100 mb-8"
    >
      <div
        class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Icon name="uil:check" class="text-5xl" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Pembayaran Berhasil!</h2>
      <p class="text-gray-500 mt-2 mb-8">
        Terima kasih {{ orderData?.customer_name }}. Pesanan
        <b>#{{ orderData?.order_number }}</b> telah dibayar. Silakan konfirmasi
        melalui WhatsApp agar pesanan segera diproses.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goToWhatsApp"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
        >
          <Icon name="uil:whatsapp" class="text-2xl" />
          Konfirmasi via WhatsApp
        </button>
        <button
          @click="clearPendingOrder()"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          Tutup
        </button>
      </div>
    </div>
    <div
      v-if="checkoutSuccess && paymentStatus !== 'paid'"
      class="bg-yellow-50 rounded-2xl shadow-md p-6 border border-yellow-200 mb-8"
    >
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div
          class="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0"
        >
          <Icon name="uil:clock" class="text-3xl" />
        </div>
        <div class="flex-1 text-center sm:text-left">
          <h3 class="font-bold text-gray-800 text-lg">
            Pesanan Menunggu Pembayaran
          </h3>
          <p class="text-gray-500 text-sm">
            Pesanan <b>#{{ orderData?.order_number }}</b> belum dibayar.
            Selesaikan pembayaran atau batalkan.
          </p>
        </div>
        <div class="flex gap-3 shrink-0">
          <button
            v-if="orderData?.snap_token"
            @click="resumePayment"
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition text-sm"
          >
            <Icon name="uil:credit-card" class="text-lg" />
            Lanjutkan Bayar
          </button>
          <button
            @click="clearPendingOrder()"
            class="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition text-sm"
          >
            Batalkan
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="cartItems.length > 0"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.product_id"
          class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <img
            :src="
              item.product?.image_url ||
              'https://placehold.co/100x100?text=Product'
            "
            class="w-20 h-20 object-cover rounded-lg"
          />
          <div class="flex-1">
            <h3 class="font-bold text-gray-800">{{ item.product?.name }}</h3>
            <p class="text-blue-600 font-medium">
              {{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(item.product?.price || 0)
              }}
            </p>
            <p
              class="text-xs"
              :class="
                (item.product?.stock ?? 0) - item.quantity <= 3
                  ? 'text-red-500'
                  : 'text-gray-400'
              "
            >
              Sisa stok: {{ (item.product?.stock ?? 0) - item.quantity }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="cartStore.addItem(item.product_id, -1)"
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="item.quantity <= 1"
            >
              <Icon name="uil:minus" />
            </button>
            <span class="font-bold w-6 text-center">{{ item.quantity }}</span>
            <button
              @click="cartStore.addItem(item.product_id, 1)"
              class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="item.quantity >= (item.product?.stock ?? 0)"
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

        <div
          class="p-6 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center"
        >
          <span class="text-blue-800 font-medium">Total Pembayaran</span>
          <span class="text-2xl font-bold text-blue-600">
            {{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalPrice)
            }}
          </span>
        </div>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-24"
      >
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          Informasi Pengiriman
        </h2>
        <form @submit.prevent="handleCheckout" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Nama Lengkap</label
            >
            <input
              v-model="formData.customer_name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Budi Santoso"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Email</label
            >
            <input
              v-model="formData.customer_email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="budi@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >No. WhatsApp</label
            >
            <input
              v-model="formData.customer_phone"
              type="tel"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="08123456789"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Alamat Lengkap</label
            >
            <textarea
              v-model="formData.shipping_address"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
              placeholder="Jl. Merdeka No. 123, Jakarta"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="svg-spinners:180-ring" />
            {{ loading ? "Memproses..." : "Checkout Sekarang" }}
          </button>
          <p
            class="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold"
          >
            Secure Payment by Midtrans
          </p>
        </form>
      </div>
    </div>
    <div
      v-else-if="!checkoutSuccess"
      class="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <Icon name="uil:shopping-cart" class="text-7xl text-gray-200 mb-4" />
      <h2 class="text-2xl font-bold text-gray-800">Keranjang Anda Kosong</h2>
      <p class="text-gray-500 mt-2 mb-8">
        Pilih produk favorit Anda terlebih dahulu.
      </p>
      <NuxtLink
        to="/"
        class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Lihat Produk
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
:global(.snap-pay-modal) {
  z-index: 9999 !important;
}
</style>
