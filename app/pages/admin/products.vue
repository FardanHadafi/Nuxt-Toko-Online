<script setup lang="ts">
import type {
  Product,
  Category,
  AddProductRequest,
  UpdateProductRequest,
} from "~/types";

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Manajemen Produk",
});

useHead({
  title: "Kelola Produk | Admin Panel",
});

const {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = useApi();
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const submitting = ref(false);

const initialFormState = {
  name: "",
  price: 0,
  category_id: "",
  description: "",
  stock: 0,
  is_active: true,
  image_url: "",
};

const form = reactive({ ...initialFormState });
const currentId = ref<string>("");
const uploadingImage = ref(false);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  const formData = new FormData();
  formData.append("file", file);

  uploadingImage.value = true;
  try {
    const res = await uploadImage(formData);
    form.image_url = res.url || (res as any).data?.url || "";
  } catch (error) {
    alert("Gagal mengupload gambar ke server.");
    console.error(error);
  } finally {
    uploadingImage.value = false;
  }
};

// Fetch Data
const fetchData = async () => {
  loading.value = true;
  try {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    products.value = prods;
    categories.value = cats;
  } catch (error) {
    console.error("Failed to load data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Category helper
const getCategoryName = (id: string) => {
  return categories.value.find((c) => c.id === id)?.name || "-";
};

// Modals
const openAddModal = () => {
  Object.assign(form, initialFormState);
  if (categories.value.length > 0) {
    form.category_id = categories.value[0].id;
  }
  isEditing.value = false;
  isModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  isEditing.value = true;
  currentId.value = product.id;
  Object.assign(form, {
    name: product.name,
    price: product.price,
    category_id: product.category_id,
    description: product.description || "",
    stock: product.stock || 0,
    is_active: product.is_active,
    image_url: product.image_url || "",
  });
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Form Handlers
const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      const payload: UpdateProductRequest = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        is_active: form.is_active,
        image_url: form.image_url,
      };
      await updateProduct(currentId.value, payload);
      alert("Produk berhasil diperbarui!");
    } else {
      const payload: AddProductRequest = {
        name: form.name,
        price: Number(form.price),
        category_id: form.category_id,
        description: form.description,
        stock: Number(form.stock),
        image_url: form.image_url,
      };
      await createProduct(payload);
      alert("Produk baru berhasil ditambahkan!");
    }
    closeModal();
    await fetchData();
  } catch (error: any) {
    console.error("Submit error:", error);
    alert("Terjadi kesalahan: " + (error.data?.message || error.message));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (
    confirm(
      "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.",
    )
  ) {
    try {
      await deleteProduct(id);
      await fetchData();
    } catch (error: any) {
      alert(
        "Gagal menghapus produk: " + (error.data?.message || error.message),
      );
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <p class="text-gray-500">
          Kelola inventaris dan katalog barang toko Anda.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition shadow-sm"
      >
        <Icon name="uil:plus-circle" class="text-xl" />
        Tambah Produk
      </button>
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
        <p>Memuat data produk...</p>
      </div>

      <div
        v-else-if="products.length === 0"
        class="p-16 text-center text-gray-500"
      >
        <Icon name="uil:box" class="text-6xl text-gray-300 mb-4 inline-block" />
        <p class="text-lg font-medium text-gray-800">Tidak ada produk</p>
        <p class="text-sm">
          Silakan tambah produk baru untuk melihatnya di sini.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Info Produk
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Kategori
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Harga
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Stok
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-gray-50 transition"
            >
              <!-- Info Produk -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="shrink-0 h-10 w-10">
                    <img
                      class="h-10 w-10 rounded-lg object-cover bg-gray-100"
                      :src="
                        product.image_url ||
                        'https://placehold.co/100?text=Barang'
                      "
                      alt=""
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-bold text-gray-900">
                      {{ product.name }}
                    </div>
                  </div>
                </div>
              </td>
              <!-- Kategori -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                >
                  {{
                    product.category?.name ||
                    getCategoryName(product.category_id)
                  }}
                </span>
              </td>
              <!-- Harga -->
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium"
              >
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(product.price)
                }}
              </td>
              <!-- Stok -->
              <td
                class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold"
                :class="product.stock <= 5 ? 'text-red-500' : 'text-gray-700'"
              >
                {{ product.stock || 0 }}
              </td>
              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  v-if="product.is_active"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded text-green-800 bg-green-100"
                  >Aktif</span
                >
                <span
                  v-else
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded text-gray-800 bg-gray-200"
                  >Non-aktif</span
                >
              </td>
              <!-- Aksi -->
              <td
                class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
              >
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEditModal(product)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition"
                    title="Edit"
                  >
                    <Icon name="uil:edit" class="text-lg" />
                  </button>
                  <button
                    @click="handleDelete(product.id)"
                    class="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition"
                    title="Hapus"
                  >
                    <Icon name="uil:trash-alt" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
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
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          @click="closeModal"
          aria-hidden="true"
        ></div>

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                :class="
                  isEditing
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                "
              >
                <Icon
                  :name="isEditing ? 'uil:edit' : 'uil:plus'"
                  class="text-2xl"
                />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  class="text-xl leading-6 font-bold text-gray-900"
                  id="modal-title"
                >
                  {{ isEditing ? "Edit Produk" : "Tambah Produk Baru" }}
                </h3>

                <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
                  <!-- Image Upload -->
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Foto Produk</label
                    >
                    <div class="flex items-center gap-4">
                      <!-- Image Preview -->
                      <div
                        class="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center"
                      >
                        <img
                          v-if="form.image_url"
                          :src="form.image_url"
                          class="w-full h-full object-cover"
                        />
                        <Icon
                          v-else
                          name="uil:image-upload"
                          class="text-gray-400 text-2xl"
                        />
                      </div>

                      <div class="relative grow">
                        <input
                          type="file"
                          accept="image/*"
                          @change="handleFileUpload"
                          :disabled="uploadingImage"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div
                          class="flex items-center justify-center w-full px-4 py-3 bg-gray-50 border border-gray-300 border-dashed rounded-lg hover:bg-gray-100 hover:border-blue-400 transition"
                          :class="{ 'opacity-50': uploadingImage }"
                        >
                          <div class="flex flex-col items-center">
                            <span class="text-sm font-medium text-gray-700">
                              <Icon
                                v-if="uploadingImage"
                                name="svg-spinners:180-ring"
                                class="mr-1"
                              />
                              {{
                                uploadingImage
                                  ? "Mengupload ke Cloudinary..."
                                  : form.image_url
                                    ? "Ganti Foto"
                                    : "Pilih File Gambar"
                              }}
                            </span>
                            <span
                              class="text-xs text-gray-400 mt-1"
                              v-if="!uploadingImage"
                              >PNG, JPG, WEBP maks 2MB</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Nama Produk</label
                    >
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      placeholder="Cth: Mouse Gaming"
                    />
                  </div>

                  <!-- Category -->
                  <div v-show="!isEditing">
                    <label class="block text-sm font-medium text-gray-700"
                      >Kategori</label
                    >
                    <select
                      v-model="form.category_id"
                      :required="!isEditing"
                      class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                    >
                      <option disabled value="">Pilih kategori...</option>
                      <option
                        v-for="cat in categories"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ cat.name }}
                      </option>
                    </select>
                    <p
                      v-if="categories.length === 0"
                      class="text-xs text-red-500 mt-1"
                    >
                      Harap buat kategori terlebih dahulu sebelum menambah
                      produk.
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <!-- Price -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Harga (Rp)</label
                      >
                      <input
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        required
                        class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      />
                    </div>

                    <!-- Stock -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Stok Awal</label
                      >
                      <input
                        v-model.number="form.stock"
                        type="number"
                        min="0"
                        required
                        class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      />
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Deskripsi Ringkas</label
                    >
                    <textarea
                      v-model="form.description"
                      rows="3"
                      class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition resize-none"
                    ></textarea>
                  </div>

                  <!-- Active Status Toggle (Only on Edit) -->
                  <div
                    v-if="isEditing"
                    class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                  >
                    <span
                      class="text-sm font-medium text-gray-700 flex flex-col"
                    >
                      Tampilkan di Toko
                      <span class="text-xs text-gray-400 font-normal"
                        >Apakah produk ini bisa dibeli pelanggan?</span
                      >
                    </span>
                    <label
                      class="relative inline-flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        v-model="form.is_active"
                        class="sr-only peer"
                      />
                      <div
                        class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      ></div>
                    </label>
                  </div>

                  <!-- Actions -->
                  <div
                    class="pt-4 border-t border-gray-100 flex justify-end gap-3"
                  >
                    <button
                      type="button"
                      @click="closeModal"
                      class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      :disabled="
                        submitting || (!isEditing && categories.length === 0)
                      "
                      class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                    >
                      <Icon
                        v-if="submitting"
                        name="svg-spinners:180-ring"
                        class="mr-2"
                      />
                      {{ submitting ? "Menyimpan..." : "Simpan Produk" }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
