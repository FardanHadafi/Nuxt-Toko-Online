<script setup lang="ts">
const cartStore = useCartStore();
const { getProducts, checkoutOrder } = useApi();
const { data: allProducts } = await useAsyncData("products-cart", () =>
  getProducts(),
);

const cartItems = computed(() => {
  return cartStore.items
    .map((item) => {
      const productData = allProducts.value?.find(
        (p) => p.id === item.product_id,
      );
      return {
        ...item,
        product: productData,
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
  <div class="min-h-screen bg-white pt-32 pb-48">
    <div class="container mx-auto px-6 max-w-6xl">
      <div class="mb-16">
        <h1 class="text-6xl font-bold text-zinc-950 tracking-tighter mb-4">
          Shopping <span class="text-zinc-400">Bag</span>
        </h1>
        <p class="text-zinc-500 text-lg max-w-xl">
          Review your selected items and provide delivery information to
          complete your order.
        </p>
      </div>
      <div
        v-if="checkoutSuccess && paymentStatus === 'paid'"
        class="bg-zinc-50 p-12 text-center border border-zinc-100 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div
          class="w-24 h-24 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <Icon name="uil:check" class="text-5xl" />
        </div>
        <h2 class="text-4xl font-bold text-zinc-950 tracking-tight mb-4">
          Payment Received
        </h2>
        <p class="text-zinc-500 text-lg mb-10 max-w-lg mx-auto">
          Thank you, {{ orderData?.customer_name }}. Your order
          <b>#{{ orderData?.order_number }}</b> is being processed. Confirm via
          WhatsApp for immediate priority.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goToWhatsApp"
            class="flex items-center justify-center gap-3 px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Icon name="uil:whatsapp" class="text-2xl" />
            WhatsApp Confirmation
          </button>
          <button
            @click="clearPendingOrder()"
            class="flex items-center justify-center gap-3 px-10 py-5 bg-white text-zinc-950 border border-zinc-200 font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
      <div
        v-if="checkoutSuccess && paymentStatus !== 'paid'"
        class="bg-zinc-950 text-white p-8 border border-zinc-800 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-500"
      >
        <div class="flex items-center gap-6">
          <div
            class="w-16 h-16 bg-zinc-800 flex items-center justify-center shrink-0"
          >
            <Icon name="uil:clock" class="text-3xl text-orange-500" />
          </div>
          <div>
            <h3 class="font-bold text-xl tracking-tight">Pending Payment</h3>
            <p class="text-zinc-400 text-sm mt-1">
              Order #{{ orderData?.order_number }} is waiting for payment.
            </p>
          </div>
        </div>
        <div class="flex gap-4 w-full md:w-auto">
          <button
            v-if="orderData?.snap_token"
            @click="resumePayment"
            class="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all"
          >
            Pay Now
          </button>
          <button
            @click="clearPendingOrder()"
            class="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
      <div
        v-if="cartItems.length > 0"
        class="grid grid-cols-1 lg:grid-cols-12 gap-16"
      >
        <div class="lg:col-span-7 space-y-8">
          <div
            v-for="item in cartItems"
            :key="item.product_id"
            class="flex flex-col sm:flex-row items-center gap-8 group pb-8 border-b border-zinc-100"
          >
            <div
              class="w-40 h-40 bg-zinc-50 p-6 flex items-center justify-center shrink-0 overflow-hidden relative"
            >
              <img
                :src="
                  item.product?.image_url ||
                  'https://placehold.co/400x400?text=Product'
                "
                class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div class="flex-1 w-full text-center sm:text-left">
              <div
                class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2"
              >
                <h3 class="font-bold text-2xl text-zinc-950 tracking-tight">
                  {{ item.product?.name }}
                </h3>
                <button
                  @click="cartStore.removeItem(item.product_id)"
                  class="text-zinc-300 hover:text-red-500 transition-colors hidden sm:block"
                >
                  <Icon name="uil:trash-alt" class="text-xl" />
                </button>
              </div>
              <p class="text-zinc-500 text-lg mb-6">
                Rp
                {{
                  new Intl.NumberFormat("id-ID").format(
                    item.product?.price || 0,
                  )
                }}
              </p>
              <div
                class="flex items-center justify-center sm:justify-start gap-6"
              >
                <div
                  class="flex items-center bg-zinc-50 border border-zinc-100 overflow-hidden"
                >
                  <button
                    @click="cartStore.addItem(item.product_id, -1)"
                    class="w-12 h-12 flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-20"
                    :disabled="item.quantity <= 1"
                  >
                    <Icon name="uil:minus" />
                  </button>
                  <span
                    class="font-bold w-12 text-center text-zinc-900 border-x border-zinc-100"
                    >{{ item.quantity }}</span
                  >
                  <button
                    @click="cartStore.addItem(item.product_id, 1)"
                    class="w-12 h-12 flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-20"
                    :disabled="item.quantity >= (item.product?.stock ?? 0)"
                  >
                    <Icon name="uil:plus" />
                  </button>
                </div>
                <button
                  @click="cartStore.removeItem(item.product_id)"
                  class="text-zinc-400 hover:text-red-500 transition-colors sm:hidden"
                >
                  <Icon name="uil:trash-alt" class="text-xl" />
                </button>
              </div>
            </div>
          </div>
          <div class="pt-8 flex flex-col gap-6">
            <div
              class="flex justify-between items-center text-zinc-400 uppercase tracking-widest text-xs font-bold"
            >
              <span>Subtotal</span>
              <span
                >Rp
                {{ new Intl.NumberFormat("id-ID").format(totalPrice) }}</span
              >
            </div>
            <div
              class="flex justify-between items-center text-zinc-400 uppercase tracking-widest text-xs font-bold"
            >
              <span>Shipping</span>
              <span class="text-green-600">Free</span>
            </div>
            <div class="h-px bg-zinc-950 w-full"></div>
            <div class="flex justify-between items-end">
              <span class="text-zinc-500 font-medium">Total Amount</span>
              <span class="text-5xl font-bold text-zinc-950 tracking-tighter">
                Rp {{ new Intl.NumberFormat("id-ID").format(totalPrice) }}
              </span>
            </div>
          </div>
        </div>
        <div class="lg:col-span-5 h-fit sticky top-32">
          <div class="bg-zinc-50 p-10 border border-zinc-100">
            <h2 class="text-3xl font-bold text-zinc-950 tracking-tight mb-8">
              Shipping Info
            </h2>
            <form @submit.prevent="handleCheckout" class="space-y-6">
              <div class="space-y-2">
                <label
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >Full Name</label
                >
                <input
                  v-model="formData.customer_name"
                  type="text"
                  required
                  class="w-full bg-white px-6 py-4 border border-zinc-200 text-zinc-900 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="Budi Santoso"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >Email Address</label
                >
                <input
                  v-model="formData.customer_email"
                  type="email"
                  required
                  class="w-full bg-white px-6 py-4 border border-zinc-200 text-zinc-900 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="budi@example.com"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >WhatsApp Number</label
                >
                <input
                  v-model="formData.customer_phone"
                  type="tel"
                  required
                  class="w-full bg-white px-6 py-4 border border-zinc-200 text-zinc-900 focus:border-zinc-950 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="08123456789"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >Full Address</label
                >
                <textarea
                  v-model="formData.shipping_address"
                  required
                  class="w-full bg-white px-6 py-4 border border-zinc-200 text-zinc-900 focus:border-zinc-950 outline-none transition-all h-32 placeholder:text-zinc-300 resize-none"
                  placeholder="Jl. Merdeka No. 123, Jakarta"
                ></textarea>
              </div>
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-6 bg-zinc-950 text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <Icon v-if="loading" name="svg-spinners:180-ring" />
                {{ loading ? "Processing..." : "Confirm & Pay" }}
              </button>
              <div
                class="flex items-center justify-center gap-3 pt-4 opacity-30 grayscale"
              >
                <span class="text-[8px] font-bold uppercase tracking-[0.2em]"
                  >Secure Checkout by Midtrans</span
                >
              </div>
            </form>
          </div>
        </div>
      </div>
      <div
        v-else-if="!checkoutSuccess"
        class="text-center py-40 border-y border-zinc-100 animate-in fade-in zoom-in duration-700"
      >
        <div
          class="mb-10 inline-flex w-24 h-24 bg-zinc-50 items-center justify-center"
        >
          <Icon name="uil:shopping-bag" class="text-6xl text-zinc-200" />
        </div>
        <h2 class="text-4xl font-bold text-zinc-950 tracking-tight mb-4">
          Bag is empty
        </h2>
        <p class="text-zinc-400 text-lg mb-12 max-w-sm mx-auto">
          You haven't added any products to your cart yet. Discover our latest
          innovative pieces.
        </p>
        <NuxtLink
          to="/"
          class="inline-block px-12 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-lg"
        >
          Discover Products
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(.snap-pay-modal) {
  z-index: 9999 !important;
}

.animate-in {
  animation-fill-mode: forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
