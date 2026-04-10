import { defineStore } from "pinia";
import { computed } from "vue";
import type { User } from "~/types";

export const useAuthStore = defineStore("auth", () => {
  const cookieOptions = { maxAge: 60 * 60 * 24 * 7, path: "/" };
  const tokenCookie = useCookie<string | null>("token", cookieOptions);
  const userCookie = useCookie<User | null>("user", cookieOptions);
  const isLoggedIn = computed(() => !!tokenCookie.value);

  function setAuth(user: User, token: string) {
    userCookie.value = user;
    tokenCookie.value = token;
  }

  function logout() {
    userCookie.value = null;
    tokenCookie.value = null;
  }

  return {
    user: userCookie,
    token: tokenCookie,
    isLoggedIn,
    setAuth,
    logout,
  };
});
