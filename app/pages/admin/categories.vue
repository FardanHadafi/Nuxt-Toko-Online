<script setup lang="ts">
import type { Category, UpdateCategoryRequest } from "~/types";

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Schema Management",
});

useHead({
  title: "Categories | Uncover Admin",
});

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
} = useApi();

const categories = ref<Category[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const form = reactive({ name: "", image_url: "" });
const currentId = ref<string>("");
const uploadingImage = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openAddModal = () => {
  form.name = "";
  form.image_url = "";
  isEditing.value = false;
  isModalOpen.value = true;
};

const openEditModal = (category: Category) => {
  isEditing.value = true;
  currentId.value = category.id;
  form.name = category.name;
  form.image_url = category.image_url || "";
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  if (!form.name.trim()) return;

  submitting.value = true;
  try {
    const payload: UpdateCategoryRequest = {
      name: form.name.trim(),
      image_url: form.image_url,
    };
    if (isEditing.value) {
      await updateCategory(currentId.value, payload);
    } else {
      await createCategory(payload);
    }
    closeModal();
    await fetchData();
  } catch (error: any) {
    alert("Error: " + (error.data?.message || error.message));
  } finally {
    submitting.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await uploadImage(formData);

    form.image_url = response.url;
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload failed. Please check your connection.");
  } finally {
    uploadingImage.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (
    confirm(
      "Delete this category? Warning: Products may lose their classification.",
    )
  ) {
    try {
      await deleteCategory(id);
      await fetchData();
    } catch (error: any) {
      const message =
        error.data?.detail || error.data?.message || error.message;
      alert("Gagal menghapus kategori: " + message);
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
          Category <span class="font-bold not-italic">Manager</span>
        </h1>
        <p class="text-gray-400 mt-2 tracking-wide uppercase text-xs font-bold">
          Organize your product classifications for better discovery
        </p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#FF5A00] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-xl flex items-center gap-3"
      >
        <Icon name="uil:plus" class="text-lg" />
        New Category
      </button>
    </div>
    <div class="bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-24 text-center">
        <Icon
          name="svg-spinners:180-ring"
          class="text-4xl text-[#FF5A00] mb-4 inline-block"
        />
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Accessing Schema...
        </p>
      </div>
      <div
        v-else-if="categories.length === 0"
        class="p-24 text-center flex flex-col items-center"
      >
        <div
          class="w-20 h-20 bg-gray-50 flex items-center justify-center text-gray-200 mb-6"
        >
          <Icon name="uil:apps" class="text-5xl" />
        </div>
        <p class="text-xl font-light text-gray-900 italic">
          No categories <span class="font-bold not-italic">defined.</span>
        </p>
        <p class="text-xs text-gray-400 uppercase tracking-widest mt-2">
          Group your items to provide a seamless browsing experience.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Category Name
              </th>
              <th
                class="px-10 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Slug Reference
              </th>
              <th
                class="px-10 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                Products
              </th>
              <th
                class="px-10 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]"
              >
                System ID
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
              v-for="category in categories"
              :key="category.id"
              class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors category-row"
            >
              <td class="px-10 py-8 whitespace-nowrap">
                <div class="flex items-center gap-6">
                  <div
                    class="w-12 h-12 bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0"
                  >
                    <img
                      v-if="category.image_url"
                      :src="category.image_url"
                      class="w-full h-full object-cover"
                    />
                    <Icon
                      v-else
                      name="uil:apps"
                      class="text-gray-200 text-2xl"
                    />
                  </div>
                  <div class="text-base font-bold text-gray-900 tracking-tight">
                    {{ category.name }}
                  </div>
                </div>
              </td>
              <td class="px-10 py-8 whitespace-nowrap">
                <code
                  class="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1"
                  >/category/{{ category.slug }}</code
                >
              </td>
              <td
                class="px-10 py-8 whitespace-nowrap text-sm font-bold text-gray-900 text-center uppercase tracking-widest"
              >
                <span
                  :class="
                    category.product_count > 0
                      ? 'text-gray-900'
                      : 'text-gray-300'
                  "
                >
                  {{ category.product_count }}
                </span>
              </td>
              <td
                class="px-10 py-8 whitespace-nowrap text-[10px] text-gray-900 font-mono text-center tracking-widest"
              >
                {{ category.id.toUpperCase() }}
              </td>
              <td class="px-10 py-8 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-3">
                  <button
                    @click="openEditModal(category)"
                    class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    title="Edit"
                  >
                    <Icon name="uil:pen" class="text-lg" />
                  </button>
                  <button
                    @click="handleDelete(category.id)"
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
      class="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      ></div>

      <div
        class="relative bg-white shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
      >
        <div class="absolute top-0 left-0 w-1.5 h-full bg-[#FF5A00]"></div>

        <div class="p-12">
          <div class="mb-12">
            <h3 class="text-4xl font-light text-gray-900 italic">
              {{ isEditing ? "Edit" : "New" }}
              <span class="font-bold not-italic">Category.</span>
            </h3>
            <p
              class="text-gray-400 mt-2 text-xs font-bold uppercase tracking-widest"
            >
              {{
                isEditing
                  ? "Update classification name"
                  : "Define a new product segment"
              }}
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-10">
            <div class="space-y-2">
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                >Category Name</label
              >
              <input
                type="text"
                v-model="form.name"
                class="w-full bg-gray-50 border border-transparent py-4 px-6 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-sm font-bold tracking-tight"
                placeholder="e.g. Best Sellers"
                required
              />
            </div>

            <div class="space-y-2">
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]"
                >Category Visual</label
              >
              <div class="flex items-start gap-6">
                <div
                  class="w-32 h-32 bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group"
                >
                  <img
                    v-if="form.image_url"
                    :src="form.image_url"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="text-gray-300">
                    <Icon name="uil:image-plus" class="text-3xl" />
                  </div>
                  <div
                    v-if="uploadingImage"
                    class="absolute inset-0 bg-white/80 flex items-center justify-center"
                  >
                    <Icon
                      name="svg-spinners:180-ring"
                      class="text-orange-500"
                    />
                  </div>
                </div>
                <div class="flex-1 space-y-4">
                  <input
                    type="text"
                    v-model="form.image_url"
                    class="w-full bg-gray-50 border border-transparent py-3 px-4 focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-sm font-mono"
                    placeholder="https://image-url.com"
                  />
                  <label
                    class="inline-block bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#FF5A00] transition-colors shadow-sm"
                  >
                    {{ uploadingImage ? "Uploading..." : "Upload New Image" }}
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handleFileUpload"
                      :disabled="uploadingImage"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div
              class="pt-8 flex justify-end gap-6 items-center border-t border-gray-50"
            >
              <button
                type="button"
                @click="closeModal"
                class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting || !form.name.trim()"
                class="bg-black text-white px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-[#FF5A00] transition-all duration-300 shadow-xl disabled:opacity-50 flex items-center gap-3"
              >
                <Icon v-if="submitting" name="svg-spinners:180-ring" />
                {{ submitting ? "Saving..." : "Save Category" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
