import { apiClient } from "./client";
import { getUserList } from "@/lib/adminApi";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  authority?: 'USER' | 'ADMIN';
  role?: 'USER' | 'ADMIN';
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
 * JWT 토큰에서 권한 정보 추출
 */
const getRoleFromToken = (): 'USER' | 'ADMIN' | undefined => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return undefined;
    
    // JWT 토큰은 base64로 인코딩된 3부분으로 구성: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return undefined;
    
    // payload 부분 디코딩
    const payload = JSON.parse(atob(parts[1]));
    console.log("JWT 토큰 payload:", payload);
    
    // role 또는 authority 필드 확인
    return payload.role || payload.authority || payload.userRole;
  } catch (error) {
    console.error("JWT 토큰 디코딩 실패:", error);
    return undefined;
  }
};

/**
 * 내 정보 조회
 * 로그인한 사용자의 프로필 정보를 조회합니다.
 */
export const getMyInfo = async (): Promise<UserInfo> => {
  const response = await apiClient.get<any>("/users/me");
  console.log("getMyInfo API 전체 응답:", response);
  console.log("getMyInfo API 응답 data:", response.data);
  console.log("getMyInfo API 응답 data.data:", response.data?.data);
  
  // API 응답 구조 확인 (직접 응답 또는 data.data 안에 있을 수 있음)
  const responseData = response.data?.data || response.data;
  console.log("최종 사용할 응답 데이터:", responseData);
  
  // JWT 토큰에서 권한 정보 추출 시도 (백업용)
  const roleFromToken = getRoleFromToken();
  console.log("JWT 토큰에서 추출한 권한:", roleFromToken);
  
  // role 필드가 없으면 /api/admin/users에서 모든 사용자 조회하여 권한 정보 가져오기
  // 주의: 이 API는 관리자 권한이 필요하므로 일반 사용자는 403 에러가 발생할 수 있음
  let roleFromAdminApi: 'USER' | 'ADMIN' | undefined = undefined;
  if (!responseData.role && !responseData.authority && !roleFromToken) {
    try {
      console.log("권한 정보가 없어서 /api/admin/users에서 조회 시도");
      const allUsers = await getUserList();
      console.log("모든 사용자 목록:", allUsers);
      
      // 현재 사용자의 이메일로 매칭하여 권한 정보 찾기
      const currentUserEmail = responseData.email;
      const currentUser = allUsers.find((user: any) => 
        user.memberId === currentUserEmail || 
        user.email === currentUserEmail ||
        user.memberName === responseData.name
      );
      
      if (currentUser) {
        roleFromAdminApi = currentUser.authority;
        console.log("관리자 API에서 찾은 사용자 권한:", roleFromAdminApi);
      } else {
        console.warn("관리자 API에서 현재 사용자를 찾을 수 없음");
      }
    } catch (error: any) {
      // 403 에러는 관리자 권한이 없어서 발생하는 정상적인 경우이므로 조용히 무시
      if (error.response?.status === 403) {
        console.log("관리자 API 접근 권한 없음 (일반 사용자) - 정상 동작");
      } else {
        console.warn("관리자 API 호출 실패:", error.response?.status, error.message);
      }
      // 관리자 권한이 없으면 실패할 수 있으므로 무시
    }
  }
  
  // API 응답 구조에 맞게 매핑
  const userInfo: UserInfo = {
    id: responseData.id?.toString() || responseData.user_id?.toString() || "",
    email: responseData.email || "",
    name: responseData.name || "",
    authority: responseData.authority || responseData.role || roleFromToken || roleFromAdminApi,
    role: responseData.role || responseData.authority || roleFromToken || roleFromAdminApi,
  };
  
  console.log("최종 매핑된 사용자 정보:", userInfo);
  return userInfo;
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

