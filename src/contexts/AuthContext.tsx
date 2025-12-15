import { createContext, useContext, useState, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import * as authApi from "@/api/auth";
import * as userApi from "@/api/user";
import { setStorage, removeStorage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (userInfo: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      console.log("AuthContext에서 받은 응답:", response);
      console.log("응답 전체 구조:", JSON.stringify(response, null, 2));
      console.log("응답 키 목록:", response ? Object.keys(response) : []);
      console.log("response.success:", response?.success);
      console.log("response.message:", response?.message);
      console.log("response.data:", response?.data);
      console.log("response.data 타입:", typeof response?.data);
      
      // Access Token 저장
      // response는 LoginResponse 타입: { success, message, data: string }
      // response.data가 토큰 문자열이어야 함
      let token: string | undefined;
      
      // 다양한 응답 구조 대응
      if (typeof response === "string") {
        // 응답이 직접 토큰 문자열인 경우
        token = response;
      } else if (response && typeof response.data === "string") {
        // { success, message, data: "token" } 구조
        token = response.data;
      } else if (response && (response as any).token && typeof (response as any).token === "string") {
        // { success, message, token: "token" } 구조
        token = (response as any).token;
      } else if (response && (response as any).accessToken && typeof (response as any).accessToken === "string") {
        // { success, message, accessToken: "token" } 구조
        token = (response as any).accessToken;
      }
      
      console.log("추출한 토큰:", token, "타입:", typeof token);
      
      if (!token || typeof token !== "string") {
        console.error("토큰 추출 실패:", { 
          token, 
          response,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : [],
          responseValues: response ? Object.values(response) : [],
        });
        throw new Error("토큰을 받아오지 못했습니다.");
      }
      
      // 토큰은 문자열이므로 JSON.stringify 없이 직접 저장
      localStorage.setItem("accessToken", token);
      
      // 로그인 후 사용자 정보 조회
      try {
        const userInfo = await userApi.getMyInfo();
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
        });
      } catch (error) {
        // 사용자 정보 조회 실패 시 임시 정보 사용
        console.warn("사용자 정보 조회 실패, 임시 정보 사용:", error);
        setUser({
          id: "1",
          email,
          name: email.split("@")[0] || "사용자",
        });
      }
    } catch (error: any) {
      console.error("로그인 에러 상세:", error);
      console.error("에러 응답:", error.response?.data);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "로그인에 실패했습니다.";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // 로컬 상태 초기화
      removeStorage("accessToken");
      setUser(null);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      await authApi.signup({ email, password, name });
      
      // 회원가입 성공 후 자동 로그인
      const loginResponse = await authApi.login({ email, password });
      const token = loginResponse.data;
      if (!token || typeof token !== "string") {
        throw new Error("토큰을 받아오지 못했습니다.");
      }
      
      // 토큰은 문자열이므로 JSON.stringify 없이 직접 저장
      localStorage.setItem("accessToken", token);
      
      // 회원가입 후 사용자 정보 조회
      try {
        const userInfo = await userApi.getMyInfo();
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
        });
      } catch (error) {
        // 사용자 정보 조회 실패 시 입력한 정보 사용
        console.warn("사용자 정보 조회 실패, 입력한 정보 사용:", error);
        setUser({
          id: "1",
          email,
          name,
        });
      }
    } catch (error: any) {
      console.error("회원가입 에러 상세:", error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "회원가입에 실패했습니다.";
      throw new Error(errorMessage);
    }
  };

  const updateUser = (userInfo: User) => {
    setUser(userInfo);
  };

  const refreshUser = async () => {
    try {
      const userInfo = await userApi.getMyInfo();
      setUser({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      });
    } catch (error) {
      console.error("사용자 정보 갱신 실패:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

