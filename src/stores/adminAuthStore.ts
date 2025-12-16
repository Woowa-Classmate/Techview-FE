import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/api/auth";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { removeStorage } from "@/utils/storage";

interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,

      login: async (email: string, password: string) => {
        try {
          const response = await authApi.login({ email, password });

          let token: string | undefined;

          if (typeof response === "string") {
            token = response;
          } else if (response && typeof response.data === "string") {
            token = response.data;
          } else if (response && (response as any).token && typeof (response as any).token === "string") {
            token = (response as any).token;
          } else if (response && (response as any).accessToken && typeof (response as any).accessToken === "string") {
            token = (response as any).accessToken;
          }

          if (!token || typeof token !== "string") {
            return { success: false, error: "토큰을 받아오지 못했습니다." };
          }

          localStorage.setItem("adminToken", token);
          set({ isAuthenticated: true, email });

          return { success: true };
        } catch (error: any) {
          console.error("Admin login error:", error);
          const errorMessage =
            error.response?.data?.message || error.message || "로그인에 실패했습니다.";
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        removeStorage("adminToken");
        set({ isAuthenticated: false, email: null });

        // 서버에 로그아웃 요청 (선택사항)
        try {
          authApi.logout().catch((err) => {
            console.error("Logout API error:", err);
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    }),
    {
      name: STORAGE_KEYS.ADMIN_AUTH,
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        email: state.email 
      }),
    }
  )
);

