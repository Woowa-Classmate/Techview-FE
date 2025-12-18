import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/api/auth";
import * as userApi from "@/api/user";
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
          // 1. 일반 사용자와 관리자 통합 로그인 API 사용
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

          // 2. 임시로 토큰 저장 (사용자 정보 조회를 위해)
          localStorage.setItem("adminToken", token);
          localStorage.setItem("accessToken", token);

          // 3. 사용자 정보 조회하여 관리자 권한 확인
          try {
            const userInfo = await userApi.getMyInfo();
            console.log("로그인한 사용자 정보:", userInfo);
            
            const userRole = userInfo.role || userInfo.authority;
            
            if (userRole !== "ADMIN") {
              // 관리자 권한이 없으면 토큰 제거하고 실패 반환
              localStorage.removeItem("adminToken");
              localStorage.removeItem("accessToken");
              return { 
                success: false, 
                error: "관리자 권한이 없습니다. 관리자 계정으로 로그인해주세요." 
              };
            }
            
            // 관리자 권한이 확인되면 로그인 성공
            set({ isAuthenticated: true, email });
            return { success: true };
            
          } catch (userInfoError: any) {
            console.error("사용자 정보 조회 실패:", userInfoError);
            // 사용자 정보 조회 실패 시 토큰 제거
            localStorage.removeItem("adminToken");
            localStorage.removeItem("accessToken");
            return { 
              success: false, 
              error: "사용자 정보를 확인할 수 없습니다." 
            };
          }
        } catch (error: any) {
          console.error("Admin login error:", error);
          const errorMessage =
            error.response?.data?.message || error.message || "로그인에 실패했습니다.";
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        removeStorage("adminToken");
        removeStorage("accessToken");
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

