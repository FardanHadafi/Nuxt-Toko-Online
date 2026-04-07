import { defineStore } from 'pinia';
import type { User } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = useCookie<string | null>('token', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return {
      user: null as User | null,
      token: token.value,
    };
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setAuth(user: User, token: string) {
      const tokenCookie = useCookie<string | null>('token', {
        maxAge: 60 * 60 * 24 * 7,
      });
      this.user = user;
      this.token = token;
      tokenCookie.value = token;
    },
    logout() {
      const tokenCookie = useCookie<string | null>('token');
      this.user = null;
      this.token = null;
      tokenCookie.value = null;
    },
  },
});
