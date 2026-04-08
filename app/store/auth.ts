import { defineStore } from 'pinia';
import type { User } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'strict' as const,
      secure: true,
    };

    const tokenCookie = useCookie<string | null>('token', cookieOptions);
    const userCookie = useCookie<User | null>('user', cookieOptions);
    
    return {
      user: userCookie.value || null,
      token: tokenCookie.value || null,
    };
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setAuth(user: User, token: string) {
      // Configuration for persistence
      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict' as const,
        secure: true,
      };

      const tokenCookie = useCookie<string | null>('token', cookieOptions);
      const userCookie = useCookie<User | null>('user', cookieOptions);
      
      this.user = user;
      this.token = token;
      
      tokenCookie.value = token;
      userCookie.value = user;
    },
    logout() {
      // Must use same options to clear correctly
      const cookieOptions = {
        path: '/',
        sameSite: 'strict' as const,
        secure: true,
      };

      const tokenCookie = useCookie<string | null>('token', cookieOptions);
      const userCookie = useCookie<User | null>('user', cookieOptions);
      
      this.user = null;
      this.token = null;
      
      tokenCookie.value = null;
      userCookie.value = null;
    },
  },
});
