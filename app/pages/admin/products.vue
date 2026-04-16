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
  title: "Inventory Master",
});

useHead({
  title: "Inventory | Uncover Admin",
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
  images: ["", "", "", "", ""] as string[],
};

const form = reactive({ ...initialFormState });
const currentId = ref<string>("");
const uploadingImage = ref(false);

const handleFileUpload = async (event: Event, index: number | "main") => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  const formData = new FormData();
  formData.append("file", file);

  uploadingImage.value = true;
  try {
    const res = await uploadImage(formData);
    const url = res.url || (res as any).data?.url || "";
    if (index === "main") {
      form.image_url = url;
    } else {
      form.images[index] = url;
    }
  } catch (error) {
    alert("Gagal mengupload gambar.");
    console.error(error);
  } finally {
    uploadingImage.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    products.value = prods;
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

const getCategoryName = (id: string) => {
  return categories.value.find((c) => c.id === id)?.name || "-";
};

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
    images: [...(product.images || []), "", "", "", "", ""].slice(0, 5),
  });
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

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
        images: form.images.filter((url) => url !== ""),
      };
      await updateProduct(currentId.value, payload);
    } else {
      const payload: AddProductRequest = {
        name: form.name,
        price: Number(form.price),
        category_id: form.category_id,
        description: form.description,
        stock: Number(form.stock),
        image_url: form.image_url,
        images: form.images.filter((url) => url !== ""),
      };
      await createProduct(payload);
    }
    closeModal();
    await fetchData();
  } catch (error: any) {
    alert("Error: " + (error.data?.message || error.message));
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (confirm("Permanently delete this product from inventory?")) {
    try {
      await deleteProduct(id);
      await fetchData();
    } catch (error: any) {
      alert("Error: " + (error.data?.message || error.message));
    }
  }
};
</script>

<template>
  <div class="space-y-12">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 admin-header"
    >
      <div>
        <h1 class="text-5xl font-light text-gray-900 tracking-tight italic">
          Product <span class="font-bold not-italic">Inventory</span>
        </h1>
        <p class="text-gray-400 mt-2 tracking-wide uppercase text-xs font-bold">
          Manage your collection of innovative tech and design
        </p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#FF5A00] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-xl flex items-center gap-3"
      >
        <Icon name="uil:plus" class="text-lg" />
        Add New Product
      </button>
    </div>
    <div class="bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-24 text-center">
        <Icon
          name="svg-spinners:180-ring"
          class="text-4xl text-[#FF5A00] mb-4 inline-block"
        />
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Database...
        </p>
      </div>
      <div
        v-else-if="products.length === 0"
        class="p-24 text-center flex flex-col items-center"
      >
        <div
          class="w-20 h-20 bg-gray-50 flex items-center justify-center text-gray-200 mb-6"
        >
          <Icon name="uil:box" class="text-5xl" />
        </div>
        <p class="text-xl font-light text-gray-900 italic">
          No products <span class="font-bold not-italic">found.</span>
        </p>
        <p class="text-xs text-gray-400 uppercase tracking-widest mt-2">
          Start by adding your first masterpiece to the catalog.
        </p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Product Details
              </th>
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Category
              </th>
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Price
              </th>
              <th
                class="px-10 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Inv.
              </th>
              <th
                class="px-10 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Status
              </th>
              <th
                class="px-10 py-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in products"
              :key="product.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors product-row"
            >
              <td class="px-10 py-8 whitespace-nowrap">
                <div class="flex items-center gap-6">
                  <div
                    class="shrink-0 h-16 w-16 bg-gray-50 flex items-center justify-center border border-gray-100 p-2 overflow-hidden"
                  >
                    <img
                      class="h-full w-full object-contain"
                      :src="
                        product.image_url ||
                        'https://placehold.co/100?text=Barang'
                      "
                      alt=""
                    />
                  </div>
                  <div>
                    <div
                      class="text-base font-bold text-gray-900 tracking-tight"
                    >
                      {{ product.name }}
                    </div>
                    <div
                      class="text-[10px] text-gray-900 uppercase font-bold tracking-widest mt-1"
                    >
                      SKU: #{{ product.id.slice(0, 8).toUpperCase() }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-10 py-8 whitespace-nowrap">
                <span
                  class="text-xs font-bold text-[#FF5A00] bg-orange-50 px-3 py-1 uppercase tracking-widest"
                >
                  {{
                    product.category?.name ||
                    getCategoryName(product.category_id)
                  }}
                </span>
              </td>
              <td
                class="px-10 py-8 whitespace-nowrap text-sm text-gray-900 font-bold"
              >
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(product.price)
                }}
              </td>
              <td
                class="px-10 py-8 whitespace-nowrap text-center text-sm font-bold"
                :class="product.stock <= 5 ? 'text-red-500' : 'text-gray-900'"
              >
                {{ product.stock || 0 }}
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-center">
                <div class="flex justify-center">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="product.is_active ? 'bg-green-500' : 'bg-gray-300'"
                    :title="product.is_active ? 'Active' : 'Inactive'"
                  ></div>
                </div>
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-3">
                  <button
                    @click="openEditModal(product)"
                    class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    title="Edit"
                  >
                    <Icon name="uil:pen" class="text-lg" />
                  </button>
                  <button
                    @click="handleDelete(product.id)"
                    class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    title="Delete"
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
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      ></div>
      <div
        class="relative bg-white shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        <div class="absolute top-0 left-0 w-1.5 h-full bg-[#FF5A00]"></div>
        <div class="p-12 overflow-y-auto">
          <div class="mb-12">
            <h3 class="text-4xl font-light text-gray-900 italic">
              {{ isEditing ? "Edit" : "Add" }}
              <span class="font-bold not-italic">Item.</span>
            </h3>
            <p
              class="text-gray-400 mt-2 text-xs font-bold uppercase tracking-widest"
            >
              {{
                isEditing
                  ? "Update existing product metadata"
                  : "Introduce a new innovative product"
              }}
            </p>
          </div>
          <form @submit.prevent="handleSubmit" class="space-y-10">
            <div class="space-y-4">
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                >Product Master Visual & Gallery</label
              >
              <div class="space-y-6">
                <!-- Master Image -->
                <div class="flex items-center gap-8 bg-gray-50/50 p-4 border border-gray-100">
                  <div
                    class="w-32 h-32 bg-white flex items-center justify-center border border-gray-100 p-2 overflow-hidden shrink-0 shadow-sm"
                  >
                    <img
                      v-if="form.image_url"
                      :src="form.image_url"
                      class="w-full h-full object-contain"
                    />
                    <Icon
                      v-else
                      name="uil:image-v"
                      class="text-gray-200 text-4xl"
                    />
                  </div>
                  <div class="relative grow h-32">
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handleFileUpload(e, 'main')"
                      :disabled="uploadingImage"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      class="h-full border border-gray-200 border-dashed flex flex-col items-center justify-center group hover:border-[#FF5A00] bg-white transition-all duration-300"
                    >
                      <Icon
                        v-if="uploadingImage"
                        name="svg-spinners:180-ring"
                        class="text-[#FF5A00] mb-2"
                      />
                      <Icon
                        v-else
                        name="uil:camera"
                        class="text-gray-300 group-hover:text-[#FF5A00] transition-colors mb-2 text-2xl"
                      />
                      <span
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-gray-900"
                      >
                        Main Visual
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Gallery Grid -->
                <div class="grid grid-cols-5 gap-4">
                  <div v-for="(url, index) in form.images" :key="index" class="relative group aspect-square bg-gray-50 border border-gray-100 overflow-hidden">
                    <img v-if="url" :src="url" class="absolute inset-0 w-full h-full object-contain p-2" />
                    <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2">
                       <Icon name="uil:plus-circle" class="text-gray-200 text-xl" />
                       <span class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Angle {{ index + 1 }}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handleFileUpload(e, index)"
                      :disabled="uploadingImage"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div v-if="url" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Icon name="uil:sync" class="text-white text-xl" />
                    </div>
                  </div>
                </div>
                <p class="text-[9px] text-gray-400 italic">Upload up to 5 additional angles for the product gallery. Master image is required.</p>
              </div>
            </div>
            <div class="space-y-2">
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                >Product Name</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 font-bold"
                placeholder="Product Identifier"
              />
            </div>
            <div class="grid grid-cols-2 gap-10">
              <div class="space-y-2" v-show="!isEditing">
                <label
                  class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                  >Product Category</label
                >
                <select
                  v-model="form.category_id"
                  :required="!isEditing"
                  class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer"
                >
                  <option disabled value="">Select Classification...</option>
                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                  >Unit Price (IDR)</label
                >
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  required
                  class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 font-bold"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                  >Initial Inventory</label
                >
                <input
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  required
                  class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 font-bold"
                />
              </div>
              <div v-if="isEditing" class="space-y-2">
                <label
                  class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                  >Publication State</label
                >
                <div
                  @click="form.is_active = !form.is_active"
                  class="flex items-center gap-4 cursor-pointer pt-4"
                >
                  <div
                    class="w-12 h-6 bg-gray-100 p-1 transition-colors duration-300"
                    :class="{ 'bg-orange-100': form.is_active }"
                  >
                    <div
                      class="w-4 h-4 bg-gray-300 transition-all duration-300"
                      :class="{ 'translate-x-6 bg-[#FF5A00]': form.is_active }"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-bold uppercase tracking-widest"
                    :class="form.is_active ? 'text-gray-900' : 'text-gray-400'"
                  >
                    {{ form.is_active ? "Public" : "Hidden" }}
                  </span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                >Brief Narrative</label
              >
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 leading-relaxed resize-none"
                placeholder="Product description and features..."
              ></textarea>
            </div>
            <div class="pt-8 flex justify-end gap-6 items-center">
              <button
                type="button"
                @click="closeModal"
                class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                :disabled="
                  submitting || (!isEditing && categories.length === 0)
                "
                class="bg-black text-white px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-[#FF5A00] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center gap-3"
              >
                <Icon v-if="submitting" name="svg-spinners:180-ring" />
                {{
                  submitting
                    ? "Processing..."
                    : isEditing
                      ? "Commit Updates"
                      : "Publish Product"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
