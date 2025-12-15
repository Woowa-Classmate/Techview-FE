import axios from "axios";

// 개발 환경에서는 Vite 프록시를 사용하므로 상대 경로 사용
// 프로덕션에서는 환경 변수로 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, // HttpOnly Cookie를 위한 설정
});

// Request interceptor - Access Token 추가
apiClient.interceptors.request.use(
  (config) => {
    // 인증이 필요 없는 엔드포인트는 토큰을 추가하지 않음
    const publicEndpoints = ["/auth/login", "/auth/signup"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      let token = localStorage.getItem("accessToken");
      
      // 만약 JSON.stringify로 저장되었다면 파싱 시도
      if (token && token.startsWith('"') && token.endsWith('"')) {
        try {
          token = JSON.parse(token);
        } catch (e) {
          // 파싱 실패 시 원본 사용
        }
      }
      
      console.log("API 요청 인터셉터:", {
        url: config.url,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPrefix: token ? token.substring(0, 20) + "..." : "없음",
        tokenType: typeof token,
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization 헤더 추가됨:", `Bearer ${token.substring(0, 20)}...`);
      } else {
        console.warn("토큰이 없어서 Authorization 헤더를 추가하지 않음:", config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 또는 403 에러이고 아직 재시도하지 않은 경우
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 Access Token 갱신 시도
        // TODO: Refresh Token API 호출
        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        // localStorage.setItem("accessToken", response.data.data);
        // originalRequest.headers.Authorization = `Bearer ${response.data.data}`;
        // return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃
        localStorage.removeItem("accessToken");
        // AuthContext의 user도 초기화해야 할 수 있음
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

