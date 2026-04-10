<script setup lang="ts">
const { adminLogin } = useApi();
const authStore = useAuthStore();
const router = useRouter();

const formData = reactive({
  username: '',
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await adminLogin(formData);
    const dataAuth = response.data || response;
    authStore.setAuth(dataAuth.user, dataAuth.token);
    router.push('/admin/dashboard');
  } catch (error: any) {
    console.error('Login error:', error);
    errorMessage.value = error.data?.message || 'Terjadi kesalahan saat login. Periksa username dan password Anda.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Login Admin</h1>
        <p class="text-gray-500 mt-2">Masuk untuk mengelola toko Anda</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon name="uil:user" />
            </div>
            <input 
              v-model="formData.username" 
              type="text" 
              required
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="admin"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon name="uil:lock" />
            </div>
            <input 
              v-model="formData.password" 
              type="password" 
              required
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loading" name="svg-spinners:180-ring" class="mr-2" />
            {{ loading ? 'Sedang Masuk...' : 'Masuk' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
