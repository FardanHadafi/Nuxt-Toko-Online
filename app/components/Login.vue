<script setup lang="ts">
const { adminLogin } = useApi();
const authStore = useAuthStore();
const router = useRouter();

const formData = reactive({
  username: "",
  password: "",
});

const loading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await adminLogin(formData);
    const dataAuth = response.data || response;
    authStore.setAuth(dataAuth.user, dataAuth.token);
    router.push("/admin/dashboard");
  } catch (error: any) {
    console.error("Login error:", error);
    errorMessage.value =
      error.data?.message ||
      "Terjadi kesalahan saat login. Periksa username dan password Anda.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] font-sans">
    <div
      class="w-full max-w-md p-12 bg-white border border-gray-100 shadow-sm relative overflow-hidden"
    >
      <div class="absolute top-0 left-0 w-1 h-full bg-[#FF5A00]"></div>
      <div class="mb-10">
        <h1 class="text-4xl font-light text-gray-900 italic">Admin</h1>
        <p class="text-gray-400 mt-2 text-sm tracking-wide">
          Enter your credentials to manage the system
        </p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-8">
        <div
          v-if="errorMessage"
          class="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100"
        >
          {{ errorMessage }}
        </div>
        <div class="space-y-2">
          <label
            class="block text-xs font-bold text-gray-400 uppercase tracking-widest"
            >Username</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF5A00] transition-colors"
            >
              <Icon name="uil:user" />
            </div>
            <input
              v-model="formData.username"
              type="text"
              required
              class="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 placeholder:text-gray-300"
              placeholder="Username"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label
            class="block text-xs font-bold text-gray-400 uppercase tracking-widest"
            >Password</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF5A00] transition-colors"
            >
              <Icon name="uil:lock" />
            </div>
            <input
              v-model="formData.password"
              type="password"
              required
              class="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-gray-900 placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>
        </div>
        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center py-5 px-6 bg-[#FF5A00] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Icon v-if="loading" name="svg-spinners:180-ring" class="mr-3" />
            {{ loading ? "Authenticating..." : "Sign In" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
