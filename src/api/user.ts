import { apiClient } from "./client";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export interface UpdateUserInfoRequest {
  name: string;
}

export interface UpdateSkillsRequest {
  skills: number[];
}

export interface UpdateCategoriesRequest {
  categories: number[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 내 정보 조회
 * 로그인한 사용자의 프로필 정보를 조회합니다.
 */
export const getMyInfo = async (): Promise<UserInfo> => {
  const response = await apiClient.get<UserInfo>("/users/me");
  return response.data;
};

/**
 * 내 정보 수정
 * 사용자 이름을 수정합니다.
 */
export const updateMyInfo = async (data: UpdateUserInfoRequest): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>("/users/me", data);
  return response.data;
};

/**
 * 내 기술스택 조회
 * 사용자가 설정한 기술스택 목록을 조회합니다.
 */
export const getMySkills = async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>("/users/me/skills");
  return response.data;
};

/**
 * 내 기술스택 설정
 * 사용자의 기술스택을 설정합니다.
 */
export const updateMySkills = async (data: UpdateSkillsRequest): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>("/users/me/skills", data);
  return response.data;
};

/**
 * 내 관심 분야 조회
 * 사용자가 설정한 관심 분야 목록을 조회합니다.
 */
export const getMyCategories = async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>("/users/me/categories");
  return response.data;
};

/**
 * 내 관심 분야 설정
 * 사용자의 관심 분야(Category)를 설정합니다.
 */
export const updateMyCategories = async (data: UpdateCategoriesRequest): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>("/users/me/categories", data);
  return response.data;
};

