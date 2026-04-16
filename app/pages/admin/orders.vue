<script setup lang="ts">
import type { Order } from "~/types";

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Order Cycle Ledger",
});

useHead({
  title: "Orders | Uncover Admin",
});

const { getAllOrders, getOrderById, getProducts, cancelOrder } = useApi();

const orders = ref<Order[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const detailLoading = ref(false);
const selectedOrder = ref<any>(null);
const productMap = ref<Record<string, any>>({});
const cancellingId = ref<string | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [ordersResult, productsResult] = await Promise.all([
      getAllOrders(),
      getProducts(),
    ]);
    orders.value = ordersResult || [];

    const pMap: Record<string, any> = {};
    if (Array.isArray(productsResult)) {
      productsResult.forEach((p) => {
        pMap[p.id] = p;
      });
    }
    productMap.value = pMap;

    productMap.value = pMap;
  } catch (error) {
    console.error("Failed to load orders:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "success":
    case "settlement":
      return "bg-black text-white";
    case "pending":
      return "bg-orange-50 text-[#FF5A00] border border-orange-100";
    case "expired":
    case "canceled":
    case "failed":
      return "bg-gray-100 text-gray-400";
    default:
      return "bg-gray-50 text-gray-400";
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "success":
    case "settlement":
      return "AUTHENTICATED";
    case "pending":
      return "AWAITING CLEARANCE";
    case "expired":
    case "canceled":
    case "failed":
      return "VOID / TERMINATED";
    default:
      return status.toUpperCase();
  }
};

const openDetailModal = async (orderId: string) => {
  isModalOpen.value = true;
  detailLoading.value = true;
  selectedOrder.value = null;

  try {
    const data = await getOrderById(orderId);
    selectedOrder.value = data;
  } catch (error) {
    console.error("Gagal memuat detail:", error);
    alert("Manifest retrieval failed.");
    isModalOpen.value = false;
  } finally {
    detailLoading.value = false;
  }
};

const closeDetailModal = () => {
  isModalOpen.value = false;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(d)
    .replace(",", " pukul");
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);
};

const handleCancel = async (id: string) => {
  if (!confirm("Are you sure you want to VOID this transaction and restore stock?"))
    return;

  cancellingId.value = id;
  try {
    await cancelOrder(id);
    await fetchData();
  } catch (error: any) {
    const message = error.data?.detail || error.data?.message || error.message;
    alert("Cancellation Failed: " + message);
  } finally {
    cancellingId.value = null;
  }
};
</script>

<template>
  <div class="space-y-12">
    <div
      class="flex flex-col lg:flex-row gap-8 justify-between items-start admin-header"
    >
      <div>
        <h1 class="text-5xl font-light text-gray-900 tracking-tight italic">
          Order <span class="font-bold not-italic">Ledger</span>
        </h1>
        <p class="text-gray-400 mt-2 tracking-wide uppercase text-xs font-bold">
          Review transaction cycles and payment authentications
        </p>
      </div>
      <div
        class="inline-flex items-center gap-4 px-6 py-4 bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border border-gray-100 shadow-sm"
      >
        <Icon name="uil:sync" class="text-lg text-[#FF5A00]" />
        Real-time Midtrans Sync Active
      </div>
    </div>
    <div class="bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-24 text-center">
        <Icon
          name="svg-spinners:180-ring"
          class="text-4xl text-[#FF5A00] mb-4 inline-block"
        />
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Compiling History...
        </p>
      </div>
      <div
        v-else-if="orders.length === 0"
        class="p-24 text-center flex flex-col items-center"
      >
        <div
          class="w-20 h-20 bg-gray-50 flex items-center justify-center text-gray-200 mb-6"
        >
          <Icon name="uil:receipt" class="text-5xl" />
        </div>
        <p class="text-xl font-light text-gray-900 italic">
          No transactions <span class="font-bold not-italic">logged.</span>
        </p>
        <p class="text-xs text-gray-400 uppercase tracking-widest mt-2">
          Your customer purchase history will appear here.
        </p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Timestamp
              </th>
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Reference ID
              </th>
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Valuation
              </th>
              <th
                class="px-10 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Outcome
              </th>
              <th
                class="px-10 py-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Analysis
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors order-row"
            >
              <td class="px-10 py-8 whitespace-nowrap">
                <span
                  class="block text-sm font-bold text-gray-900 tracking-tight"
                  >{{ formatDate(order.created_at).split("pukul")[0] }}</span
                >
                <span
                  class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"
                  >{{ formatDate(order.created_at).split("pukul")[1] }}</span
                >
              </td>
              <td class="px-10 py-8 whitespace-nowrap">
                <code
                  class="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 uppercase tracking-tighter"
                  >ORD-{{ order.id.split("-")[0] }}</code
                >
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-gray-900 font-bold">
                {{ formatPrice(order.total_amount) }}
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-center">
                <span
                  :class="getStatusColor(order.status)"
                  class="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-3">
                  <button
                    v-if="order.status.toLowerCase() === 'pending'"
                    @click="handleCancel(order.id)"
                    :disabled="cancellingId === order.id"
                    class="bg-white text-red-500 border border-red-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Icon v-if="cancellingId === order.id" name="svg-spinners:180-ring" class="mr-1" />
                    Void
                  </button>
                  <button
                    @click="openDetailModal(order.id)"
                    class="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF5A00] transition-colors shadow-sm"
                  >
                    Inspect
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="closeDetailModal"
      ></div>

      <div
        class="relative bg-white shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100"
      >
        <div class="absolute top-0 left-0 w-1.5 h-full bg-[#FF5A00]"></div>
        <div v-if="detailLoading" class="p-24 text-center">
          <Icon
            name="svg-spinners:180-ring"
            class="text-4xl text-[#FF5A00] mb-4 inline-block"
          />
          <p
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            Retrieving Manifest...
          </p>
        </div>
        <div v-else-if="selectedOrder" class="p-12">
          <div class="flex justify-between items-start mb-12">
            <div>
              <h3 class="text-4xl font-light text-gray-900 italic">
                Order <span class="font-bold not-italic">Manifest.</span>
              </h3>
              <p
                class="text-xs font-mono text-gray-400 mt-2 uppercase tracking-tighter"
              >
                Ref: {{ selectedOrder.id }}
              </p>
            </div>
            <button
              @click="closeDetailModal"
              class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <Icon name="uil:times" class="text-2xl" />
            </button>
          </div>
          <div class="space-y-10">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-1">
              <div class="bg-gray-50 p-6">
                <p
                  class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3"
                >
                  STATE
                </p>
                <span
                  :class="getStatusColor(selectedOrder.status)"
                  class="block text-center text-[9px] py-1 font-bold uppercase tracking-widest"
                >
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div class="bg-gray-50 p-6 md:col-span-2">
                <p
                  class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3"
                >
                  TIMESTAMP
                </p>
                <p
                  class="text-xs font-bold text-gray-900 uppercase tracking-tight"
                >
                  {{ formatDate(selectedOrder.created_at) }}
                </p>
              </div>
              <div class="bg-gray-50 p-6">
                <p
                  class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3"
                >
                  NET TOTAL
                </p>
                <p class="text-sm font-bold text-[#FF5A00]">
                  {{ formatPrice(selectedOrder.total_amount) }}
                </p>
              </div>
            </div>
            <h4
              class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] pb-3 border-b border-gray-100"
            >
              Itemized Allocation
            </h4>
            <div class="space-y-4 max-h-80 overflow-y-auto pr-4 scroll-minimal">
              <div
                v-if="!selectedOrder.items || selectedOrder.items.length === 0"
                class="p-10 text-center bg-gray-50 border border-dashed border-gray-200"
              >
                <p
                  class="text-xs font-bold text-gray-300 uppercase tracking-widest italic"
                >
                  Inventory data unavailable for this log.
                </p>
              </div>
              <div
                v-else
                v-for="(item, index) in selectedOrder.items"
                :key="index"
                class="flex gap-6 p-6 border border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <div
                  class="shrink-0 w-20 h-20 bg-gray-50 flex items-center justify-center p-2 border border-gray-100 overflow-hidden"
                >
                  <img
                    v-if="productMap[item.product_id]?.image_url"
                    :src="productMap[item.product_id].image_url"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="text-gray-200">
                    <Icon name="uil:image-v" class="text-2xl" />
                  </div>
                </div>
                <div class="grow flex flex-col justify-center">
                  <p
                    class="font-bold text-gray-900 tracking-tight text-base mb-1"
                  >
                    {{
                      productMap[item.product_id]?.name || "Unidentified Asset"
                    }}
                  </p>
                  <div class="flex justify-between items-end">
                    <p
                      class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    >
                      UNIT QTY: {{ item.quantity }}
                      <span class="mx-2">/</span> UNIT PRICE:
                      {{ formatPrice(item.price) }}
                    </p>
                    <p class="text-sm font-bold text-gray-900 italic">
                      {{ formatPrice(item.quantity * item.price) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-minimal::-webkit-scrollbar {
  width: 4px;
}
.scroll-minimal::-webkit-scrollbar-track {
  background: #f9f9f9;
}
.scroll-minimal::-webkit-scrollbar-thumb {
  background: #eee;
}
.scroll-minimal::-webkit-scrollbar-thumb:hover {
  background: #ff5a00;
}
</style>
