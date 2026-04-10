<script setup lang="ts">
import type { Order } from "~/types";

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Riwayat Pesanan",
});

useHead({
  title: "Riwayat Pesanan | Admin Panel",
});

const { getAllOrders, getOrderById, getProducts } = useApi();

const orders = ref<Order[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const detailLoading = ref(false);
const selectedOrder = ref<any>(null);
const productMap = ref<Record<string, any>>({});

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
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "expired":
    case "canceled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "success":
    case "settlement":
      return "LUNAS";
    case "pending":
      return "MENUNGGU PEMBAYARAN";
    case "expired":
    case "canceled":
      return "KADALUARSA / Batal";
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
    console.error("Gagal memuat detail pesanan:", error);
    alert("Detail pesanan gagal dimuat.");
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
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col flex-wrap gap-4 justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Pesanan</h1>
        <p class="text-gray-500">
          Pantau seluruh siklus masuk pesanan dan mutasi pembayaran Anda.
        </p>
      </div>
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
      >
        <Icon name="uil:info-circle" class="text-lg" />
        Status pesanan diupdate secara otomatis oleh Midtrans Webhook.
      </div>
    </div>

    <!-- Data Table -->
    <div
      class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
    >
      <div v-if="loading" class="p-12 text-center text-gray-500">
        <Icon
          name="svg-spinners:180-ring"
          class="text-4xl text-blue-500 mb-4 inline-block"
        />
        <p>Menyelaraskan riwayat pesanan...</p>
      </div>

      <div
        v-else-if="orders.length === 0"
        class="p-16 text-center text-gray-500"
      >
        <Icon
          name="uil:receipt"
          class="text-6xl text-gray-300 mb-4 inline-block"
        />
        <p class="text-lg font-medium text-gray-800">Belum ada pesanan masuk</p>
        <p class="text-sm">
          Riwayat transaksi pelanggan Anda akan muncul di sini.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Waktu Order
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Order ID
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Tagihan Total
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Status Transaksi
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100 uppercase text-sm">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50 transition"
            >
              <!-- Tanggal / Waktu -->
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">
                <span class="block font-medium text-gray-900">{{
                  formatDate(order.created_at).split("pukul")[0]
                }}</span>
                <span class="text-xs">{{
                  formatDate(order.created_at).split("pukul")[1]
                }}</span>
              </td>
              <!-- Order ID (UUID Snippet) -->
              <td
                class="px-6 py-4 whitespace-nowrap font-mono text-gray-500 font-bold text-xs uppercase cursor-help"
                :title="order.id"
              >
                #{{ order.id.split("-")[0] }}-{{ order.id.split("-")[1] }}
              </td>
              <!-- Harga Total -->
              <td class="px-6 py-4 whitespace-nowrap text-gray-800 font-bold">
                {{ formatPrice(order.total_amount) }}
              </td>
              <!-- Status Badge -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  :class="getStatusColor(order.status)"
                  class="px-3 py-1.5 inline-flex text-xs font-extrabold rounded-md border tracking-wider uppercase"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <!-- Aksi Modal -->
              <td class="px-6 py-4 whitespace-nowrap text-center font-medium">
                <button
                  @click="openDetailModal(order.id)"
                  class="text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-sm transition font-bold"
                  title="Detail Pesanan"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-100 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          @click="closeDetailModal"
          aria-hidden="true"
        ></div>
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full border border-gray-100"
        >
          <div v-if="detailLoading" class="p-16 text-center text-gray-500">
            <Icon
              name="svg-spinners:180-ring"
              class="text-4xl text-blue-500 mb-4 inline-block"
            />
            <p>Mengunduh Rincian Pesanan...</p>
          </div>

          <div v-else-if="selectedOrder" class="relative">
            <!-- Modal Header -->
            <div
              class="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center"
            >
              <div>
                <h3 class="text-lg font-bold text-gray-900">
                  Rincian Transaksi
                </h3>
                <p class="text-sm font-mono text-gray-500">
                  ID: {{ selectedOrder.id }}
                </p>
              </div>
              <button
                @click="closeDetailModal"
                class="text-gray-400 hover:text-red-500 bg-white border border-gray-200 p-2 rounded-lg transition"
              >
                <Icon name="uil:times" class="text-lg block" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="bg-white px-6 py-5">
              <!-- Info Singkat -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div
                  class="bg-blue-50 p-3 rounded-lg border border-blue-100/50"
                >
                  <p class="text-xs text-blue-500 font-semibold uppercase mb-1">
                    Status
                  </p>
                  <span
                    :class="getStatusColor(selectedOrder.status)"
                    class="block text-center text-xs py-1 rounded w-full font-bold"
                  >
                    {{ getStatusLabel(selectedOrder.status) }}
                  </span>
                </div>
                <div
                  class="bg-blue-50 p-3 rounded-lg border border-blue-100/50 md:col-span-2"
                >
                  <p class="text-xs text-blue-500 font-semibold uppercase mb-1">
                    Tanggal
                  </p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ formatDate(selectedOrder.created_at) }}
                  </p>
                </div>
                <div
                  class="bg-blue-50 p-3 rounded-lg border border-blue-100/50"
                >
                  <p class="text-xs text-blue-500 font-semibold uppercase mb-1">
                    Total Biaya
                  </p>
                  <p class="text-sm font-bold text-blue-700">
                    {{ formatPrice(selectedOrder.total_amount) }}
                  </p>
                </div>
              </div>

              <h4
                class="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4 mt-6"
              >
                Item yang Dipesan
              </h4>

              <!-- Keranjang Belanja -->
              <div class="space-y-4 max-h-75 overflow-y-auto pr-2">
                <!-- Jika Array item kosong -->
                <div
                  v-if="
                    !selectedOrder.items || selectedOrder.items.length === 0
                  "
                  class="text-center text-gray-400 text-sm py-4"
                >
                  Detail rincian barang tidak ditemukan.
                </div>

                <div
                  v-else
                  v-for="(item, index) in selectedOrder.items"
                  :key="index"
                  class="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50"
                >
                  <div
                    class="shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      v-if="productMap[item.product_id]?.image_url"
                      :src="productMap[item.product_id].image_url"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                      <Icon name="uil:image-v" class="text-2xl" />
                    </div>
                  </div>
                  <div class="grow flex flex-col justify-center">
                    <p class="font-bold text-gray-900 text-sm">
                      {{
                        productMap[item.product_id]?.name ||
                        "Produk ID: " + item.product_id.split("-")[0]
                      }}
                    </p>
                    <div class="flex justify-between items-end mt-1">
                      <p class="text-sm text-gray-500">
                        {{ item.quantity }} x {{ formatPrice(item.price) }}
                      </p>
                      <p class="font-bold text-gray-800">
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
  </div>
</template>
