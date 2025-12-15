import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/api/auth";
import * as userApi from "@/api/user";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { removeStorage } from "@/utils/storage";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (userInfo: User) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

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
            throw new Error("토큰을 받아오지 못했습니다.");
          }

          localStorage.setItem("accessToken", token);

          try {
            const userInfo = await userApi.getMyInfo();
            set({
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
              },
              isAuthenticated: true,
            });
          } catch (error) {
            console.warn("사용자 정보 조회 실패, 임시 정보 사용:", error);
            set({
              user: {
                id: "1",
                email,
                name: email.split("@")[0] || "사용자",
              },
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          console.error("로그인 에러 상세:", error);
          const errorMessage =
            error.response?.data?.message || error.message || "로그인에 실패했습니다.";
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("로그아웃 실패:", error);
        } finally {
          removeStorage("accessToken");
          set({ user: null, isAuthenticated: false });
        }
      },

      signup: async (email: string, password: string, name: string) => {
        try {
          await authApi.signup({ email, password, name });

          const loginResponse = await authApi.login({ email, password });
          const token = loginResponse.data;
          if (!token || typeof token !== "string") {
            throw new Error("토큰을 받아오지 못했습니다.");
          }

          localStorage.setItem("accessToken", token);

          try {
            const userInfo = await userApi.getMyInfo();
            set({
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
              },
              isAuthenticated: true,
            });
          } catch (error) {
            console.warn("사용자 정보 조회 실패, 입력한 정보 사용:", error);
            set({
              user: {
                id: "1",
                email,
                name,
              },
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          console.error("회원가입 에러 상세:", error);
          const errorMessage =
            error.response?.data?.message || error.message || "회원가입에 실패했습니다.";
          throw new Error(errorMessage);
        }
      },

      updateUser: (userInfo: User) => {
        set({ user: userInfo });
      },

      refreshUser: async () => {
        try {
          const userInfo = await userApi.getMyInfo();
          set({
            user: {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
            },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("사용자 정보 갱신 실패:", error);
        }
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({ user: state.user, isAuthenticated: !!state.user }),
    }
  )
);

