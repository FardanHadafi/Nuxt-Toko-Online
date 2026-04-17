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
    <div class="container mx-auto px-6 max-w-7xl">
      <div
        class="text-center max-w-2xl px-4 hero-content mx-auto mb-16 md:mb-24"
      >
        <span
          class="inline-block bg-white px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] shadow-sm mb-6"
        >
          Shopping Bag
        </span>
        <h1
          class="font-light text-4xl md:text-6xl leading-tight tracking-tight italic"
        >
          Your Selected
          <span class="text-orange-500 font-bold not-italic">Pieces.</span>
        </h1>
        <p class="mt-4 text-gray-400 text-sm md:text-lg leading-relaxed">
          Refine your selection before proceeding to secure checkout.
        </p>
      </div>

      <!-- Success State -->
      <div
        v-if="checkoutSuccess && paymentStatus === 'paid'"
        class="bg-zinc-50 p-8 md:p-12 text-center border border-zinc-100 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div
          class="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <Icon name="uil:check" class="text-3xl md:text-5xl" />
        </div>
        <h2
          class="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4"
        >
          Payment Received
        </h2>
        <p class="text-zinc-500 text-base md:text-lg mb-10 max-w-lg mx-auto">
          Thank you, {{ orderData?.customer_name }}. Your order
          <b>#{{ orderData?.order_number }}</b> is being processed. Confirm via
          WhatsApp for immediate priority.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goToWhatsApp"
            class="flex items-center justify-center gap-3 px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Icon name="uil:whatsapp" class="text-xl" />
            WhatsApp Confirmation
          </button>
          <button
            @click="clearPendingOrder()"
            class="flex items-center justify-center gap-3 px-10 py-5 bg-white text-zinc-950 border border-zinc-200 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
      <div
        v-if="checkoutSuccess && paymentStatus !== 'paid'"
        class="bg-zinc-950 text-white p-6 md:p-8 border border-zinc-800 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-500"
      >
        <div class="flex items-center gap-6">
          <div
            class="w-12 h-12 md:w-16 md:h-16 bg-zinc-800 flex items-center justify-center shrink-0"
          >
            <Icon
              name="uil:clock"
              class="text-2xl md:text-3xl text-orange-500"
            />
          </div>
          <div>
            <h3 class="font-bold text-lg md:text-xl tracking-tight">
              Pending Payment
            </h3>
            <p class="text-zinc-400 text-xs md:text-sm mt-1">
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
      <div v-if="cartItems.length > 0 && !checkoutSuccess" class="w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div class="lg:col-span-12 xl:col-span-7 space-y-6">
            <div
              v-for="item in cartItems"
              :key="item.product_id"
              class="bg-white p-4 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 shadow-sm border border-gray-50 group hover:shadow-xl transition-all duration-500"
            >
              <div
                class="w-32 h-32 sm:w-40 sm:h-40 bg-gray-50 shrink-0 flex items-center justify-center p-4 border border-gray-100 overflow-hidden"
              >
                <img
                  :src="item.product?.image_url"
                  class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div class="grow text-center sm:text-left">
                <span
                  class="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-1 block"
                  >Authentic Piece</span
                >
                <h3
                  class="text-xl font-bold text-gray-900 tracking-tight italic"
                >
                  {{ item.product?.name }}
                </h3>
                <p
                  class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1"
                >
                  Unit: Rp
                  {{
                    new Intl.NumberFormat("id-ID").format(
                      item.product?.price || 0,
                    )
                  }}
                </p>

                <div
                  class="mt-6 flex items-center justify-center sm:justify-start gap-6 border-t border-gray-50 pt-6"
                >
                  <div
                    class="flex items-center bg-gray-50 border border-gray-100 p-1"
                  >
                    <button
                      @click="cartStore.addItem(item.product_id, -1)"
                      class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                      :disabled="item.quantity <= 1"
                    >
                      -
                    </button>
                    <span
                      class="w-10 text-center font-bold text-sm text-gray-900"
                      >{{ item.quantity }}</span
                    >
                    <button
                      @click="cartStore.addItem(item.product_id, 1)"
                      class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    @click="cartStore.removeItem(item.product_id)"
                    class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
              <div
                class="sm:ml-auto text-center sm:text-right border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0 w-full sm:w-auto"
              >
                <p class="text-xl font-bold text-gray-900">
                  Rp
                  {{
                    new Intl.NumberFormat("id-ID").format(
                      (item.product?.price || 0) * item.quantity,
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
          <div class="lg:col-span-12 xl:col-span-5 h-fit lg:sticky lg:top-32">
            <div
              class="bg-black text-white p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div class="relative z-10">
                <h2 class="text-3xl font-light italic mb-8">
                  Shipping <span class="font-bold not-italic">Summary.</span>
                </h2>
                <form @submit.prevent="handleCheckout" class="space-y-8">
                  <div class="space-y-6 border-b border-zinc-800 pb-8">
                    <div class="space-y-2">
                      <label
                        class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                        >Full Recipient Name</label
                      >
                      <input
                        v-model="formData.customer_name"
                        type="text"
                        required
                        class="w-full bg-zinc-900/50 border border-zinc-800 py-4 px-6 focus:border-orange-500 focus:outline-none transition-all text-white font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                    <div class="space-y-2">
                      <label
                        class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                        >Email Address</label
                      >
                      <input
                        v-model="formData.customer_email"
                        type="email"
                        required
                        class="w-full bg-zinc-900/50 border border-zinc-800 py-4 px-6 focus:border-orange-500 focus:outline-none transition-all text-white font-medium"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div class="space-y-2">
                      <label
                        class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                        >WhatsApp Number</label
                      >
                      <input
                        v-model="formData.customer_phone"
                        type="tel"
                        required
                        class="w-full bg-zinc-900/50 border border-zinc-800 py-4 px-6 focus:border-orange-500 focus:outline-none transition-all text-white font-medium"
                        placeholder="0812345678"
                      />
                    </div>
                    <div class="space-y-2">
                      <label
                        class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                        >Delivery Address</label
                      >
                      <textarea
                        v-model="formData.shipping_address"
                        required
                        rows="3"
                        class="w-full bg-zinc-900/50 border border-zinc-800 py-4 px-6 focus:border-orange-500 focus:outline-none transition-all text-white font-medium resize-none"
                        placeholder="Detailed address..."
                      ></textarea>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div
                      class="flex justify-between text-xs text-zinc-500 uppercase tracking-widest font-bold"
                    >
                      <span>Subtotal Selection</span>
                      <span
                        >Rp
                        {{
                          new Intl.NumberFormat("id-ID").format(totalPrice)
                        }}</span
                      >
                    </div>
                    <div
                      class="flex justify-between text-xs text-zinc-500 uppercase tracking-widest font-bold"
                    >
                      <span>Standard Logistics</span>
                      <span class="text-orange-500">Free</span>
                    </div>
                    <div
                      class="pt-4 border-t border-zinc-800 flex justify-between items-end"
                    >
                      <span
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                        >Total Investment</span
                      >
                      <span class="text-4xl font-bold tracking-tighter">
                        Rp
                        {{ new Intl.NumberFormat("id-ID").format(totalPrice) }}
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-orange-500 hover:text-white transition-all duration-500 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <Icon v-if="loading" name="svg-spinners:180-ring" />
                    {{ loading ? "Synchronizing..." : "Complete Secure Order" }}
                  </button>

                  <p
                    class="text-[8px] text-center text-zinc-600 uppercase tracking-widest"
                  >
                    Secure Checkout via Midtrans Gateway
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="!checkoutSuccess"
        class="text-center py-20 md:py-40 border-y border-gray-100 animate-in fade-in zoom-in duration-700"
      >
        <div
          class="mb-10 inline-flex w-24 h-24 bg-gray-50 items-center justify-center rounded-full"
        >
          <Icon name="uil:shopping-bag" class="text-5xl text-gray-200" />
        </div>
        <h2
          class="text-3xl md:text-4xl font-light italic text-gray-900 tracking-tight mb-4"
        >
          Empty <span class="font-bold not-italic">Collection.</span>
        </h2>
        <p class="text-gray-400 text-base md:text-lg mb-12 max-w-sm mx-auto">
          Your curation is currently empty. Start exploring our innovative
          selection.
        </p>
        <NuxtLink
          to="/"
          class="inline-block px-12 py-5 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all duration-500 shadow-xl"
        >
          Discover Pieces
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
