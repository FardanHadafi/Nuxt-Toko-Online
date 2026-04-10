<script setup lang="ts">
import type { Category, UpdateCategoryRequest } from "~/types";

definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Manajemen Kategori",
});

useHead({
  title: "Kelola Kategori | Admin Panel",
});

const { getCategories, createCategory, updateCategory, deleteCategory } =
  useApi();

const categories = ref<Category[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const isEditing = ref(false);
const submitting = ref(false);

const form = reactive({ name: "" });
const currentId = ref<string>("");

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
  isEditing.value = false;
  isModalOpen.value = true;
};

const openEditModal = (category: Category) => {
  isEditing.value = true;
  currentId.value = category.id;
  form.name = category.name;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  if (!form.name.trim()) return;

  submitting.value = true;
  try {
    const payload: UpdateCategoryRequest = { name: form.name.trim() };
    if (isEditing.value) {
      await updateCategory(currentId.value, payload);
    } else {
      await createCategory(payload);
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
      "Apakah Anda yakin ingin menghapus kategori ini? Semua produk di dalamnya mungkin akan kehilangan referensi kategorinya.",
    )
  ) {
    try {
      await deleteCategory(id);
      await fetchData();
    } catch (error: any) {
      alert(
        "Gagal menghapus kategori: " + (error.data?.message || error.message),
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
        <h1 class="text-2xl font-bold text-gray-800">Kategori Produk</h1>
        <p class="text-gray-500">
          Kendalikan daftar kategori untuk mempermudah navigasi toko.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition shadow-sm"
      >
        <Icon name="uil:plus-circle" class="text-xl" />
        Tambah Kategori
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
        <p>Memuat kategori...</p>
      </div>

      <div
        v-else-if="categories.length === 0"
        class="p-16 text-center text-gray-500"
      >
        <Icon
          name="uil:apps"
          class="text-6xl text-gray-300 mb-4 inline-block"
        />
        <p class="text-lg font-medium text-gray-800">Tidak ada kategori</p>
        <p class="text-sm">Silakan buat kategori pertama Anda.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Nama Kategori
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Slug URL
              </th>
              <th
                class="px-6 py-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                ID
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
              v-for="category in categories"
              :key="category.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">
                  {{ category.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                /category/{{ category.slug }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono text-center"
              >
                {{ category.id.split("-")[0] }}...
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
              >
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEditModal(category)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition"
                    title="Edit"
                  >
                    <Icon name="uil:edit" class="text-lg" />
                  </button>
                  <button
                    @click="handleDelete(category.id)"
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

    <!-- Modal -->
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
          @click="closeModal"
          aria-hidden="true"
        ></div>
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100"
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
                  {{ isEditing ? "Edit Kategori" : "Kategori Baru" }}
                </h3>

                <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Nama Kategori</label
                    >
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      placeholder="Cth: Laptops"
                    />
                  </div>

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
                      :disabled="submitting || !form.name.trim()"
                      class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                    >
                      <Icon
                        v-if="submitting"
                        name="svg-spinners:180-ring"
                        class="mr-2"
                      />
                      {{ submitting ? "Menyimpan..." : "Simpan Kategori" }}
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
