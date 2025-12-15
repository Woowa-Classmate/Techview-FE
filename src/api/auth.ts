import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: string; // Access Token
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 로그인
 * Access Token을 반환하고, Refresh Token은 HttpOnly Cookie로 저장됩니다.
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    console.log("로그인 API 응답:", response.data);
    console.log("응답 구조:", {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
      dataType: typeof response.data.data,
    });
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

/**
 * 로그아웃
 * Refresh Token을 삭제하여 로그아웃 처리합니다.
 */
export const logout = async (): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>("/auth/logout");
  return response.data;
};

/**
 * 회원가입
 * 이메일과 비밀번호를 이용해 회원가입을 진행합니다.
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>("/auth/signup", data);
  return response.data;
};

/**
 * 임시 비밀번호 발급
 * 로그인된 사용자에게 임시 비밀번호를 발급합니다.
 */
export const generateTemporaryPassword = async (): Promise<ApiResponse> => {
  const response = await apiClient.patch<ApiResponse>("/auth/genPw");
  return response.data;
};

/**
 * 비밀번호 변경
 * 현재 비밀번호를 검증한 후 새 비밀번호로 변경합니다.
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse> => {
  const response = await apiClient.patch<ApiResponse>("/auth/resetPw", data);
  return response.data;
};

