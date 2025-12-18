import axios from 'axios'

// Swagger API 응답에 맞는 사용자 인터페이스
export interface ApiUser {
  userId: number
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

// 레거시: 이전 버전 호환용 (실제 백엔드가 다른 형식을 반환할 경우)
export interface ApiUserLegacy {
  id: number
  memberId: string
  memberName: string
  phone: string
  birthDate: string
  authority: 'USER' | 'ADMIN'
  status: 'ABLE' | 'DISABLE'
}

export interface ApiResponse<T = any> {
  statusCode: number
  resultMsg: string
  resultData?: T
}

// 레거시 호환성을 위한 기존 응답 타입
export interface LegacyApiResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * 관리자 API용 클라이언트 (adminToken 사용)
 */
const getAdminApiClient = () => {
  const adminToken = localStorage.getItem('adminToken')
  const accessToken = localStorage.getItem('accessToken')
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  
  console.log('=== 관리자 API 클라이언트 생성 ===')
  console.log('adminToken 존재:', !!adminToken, adminToken ? adminToken.substring(0, 30) + '...' : 'null')
  console.log('accessToken 존재:', !!accessToken, accessToken ? accessToken.substring(0, 30) + '...' : 'null')
  
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  })
  
  // 관리자 토큰 추가 (adminToken이 없으면 accessToken 사용)
  client.interceptors.request.use((config) => {
    const token = adminToken || accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('관리자 API 요청 - 토큰 사용:', {
        url: config.url,
        tokenType: adminToken ? 'adminToken' : 'accessToken',
        tokenPrefix: token.substring(0, 50) + '...',
      })
    } else {
      console.warn('토큰이 없습니다:', config.url)
    }
    return config
  })
  
  return client
}

/**
 * 사용자 목록 조회
 * Swagger 문서에 따르면 배열을 직접 반환하지만, 실제로는 ApiResponse로 래핑될 수 있음
 */
export const getUserList = async (): Promise<ApiUser[]> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.get('/admin/users')
    console.log('getUserList 전체 응답:', response)
    console.log('getUserList 응답 데이터:', response.data)
    
    // 응답이 배열인 경우 (Swagger 문서 기준)
    if (Array.isArray(response.data)) {
      return response.data as ApiUser[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      // resultData가 있는 경우
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiUser[]
      }
      // data가 있는 경우
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiUser[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('getUserList error:', error)
    throw error
  }
}

/**
 * 사용자 검색
 * 이메일 또는 이름으로 사용자를 검색합니다. 키워드가 없으면 모든 사용자를 조회합니다.
 * GET /api/admin/users/search?keyword=검색어
 */
export const searchUsers = async (keyword?: string): Promise<ApiUser[]> => {
  try {
    const adminClient = getAdminApiClient()
    const params = keyword ? { keyword } : {}
    const response = await adminClient.get(`/admin/users/search`, { params })
    console.log('searchUsers 전체 응답:', response)
    console.log('searchUsers 응답 데이터:', response.data)
    
    // 응답이 배열인 경우 (Swagger 문서 기준)
    if (Array.isArray(response.data)) {
      return response.data as ApiUser[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiUser[]
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiUser[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('searchUsers error:', error)
    throw error
  }
}

/**
 * 이름으로 회원 조회 (레거시 - searchUsers 사용 권장)
 * @deprecated searchUsers 함수를 사용하세요
 */
export const getMemberByName = async (name: string): Promise<ApiUser | null> => {
  try {
    const results = await searchUsers(name)
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error('getMemberByName error:', error)
    return null
  }
}

/**
 * 사용자 정보 수정
 * PUT /api/admin/users/{userId}
 */
export interface UpdateUserRequest {
  email?: string
  name?: string
  password?: string
  role?: 'USER' | 'ADMIN'
}

export const updateUser = async (
  userId: number,
  data: UpdateUserRequest
): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.put(`/admin/users/${userId}`, data)
    console.log('updateUser 응답:', response.data)
  } catch (error) {
    console.error('updateUser error:', error)
    throw error
  }
}

/**
 * 사용자 삭제
 * DELETE /api/admin/users/{userId}
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.delete(`/admin/users/${userId}`)
    console.log('deleteUser 응답:', response.data)
  } catch (error) {
    console.error('deleteUser error:', error)
    throw error
  }
}

// 게시글 관련 인터페이스
export interface ApiPost {
  postId: number
  title: string
  content: string
  name: string
  likeCount: number
  viewCount: number
  createAt: string
  updateAt: string
}

/**
 * 모든 게시글 조회
 * GET /api/admin/posts
 */
export const getPostList = async (): Promise<ApiPost[]> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.get(`/admin/posts`)
    console.log('getPostList 전체 응답:', response)
    console.log('getPostList 응답 데이터:', response.data)
    
    // 응답이 배열인 경우 (Swagger 문서 기준)
    if (Array.isArray(response.data)) {
      return response.data as ApiPost[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiPost[]
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiPost[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('getPostList error:', error)
    throw error
  }
}

/**
 * 게시글 검색
 * 제목으로 게시글을 검색합니다. 키워드가 없으면 모든 게시글을 조회합니다.
 * GET /api/admin/posts/search?keyword=검색어
 */
export const searchPosts = async (keyword?: string): Promise<ApiPost[]> => {
  try {
    const adminClient = getAdminApiClient()
    const params = keyword ? { keyword } : {}
    const response = await adminClient.get(`/admin/posts/search`, { params })
    console.log('searchPosts 전체 응답:', response)
    console.log('searchPosts 응답 데이터:', response.data)
    
    // 응답이 배열인 경우 (Swagger 문서 기준)
    if (Array.isArray(response.data)) {
      return response.data as ApiPost[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiPost[]
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiPost[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('searchPosts error:', error)
    throw error
  }
}

/**
 * 게시글 수정
 * PUT /api/admin/posts/{id}
 */
export interface UpdatePostRequest {
  title: string
  content: string
}

export const updatePost = async (
  postId: number,
  data: UpdatePostRequest
): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.put(`/admin/posts/${postId}`, data)
    console.log('updatePost 응답:', response.data)
  } catch (error) {
    console.error('updatePost error:', error)
    throw error
  }
}

/**
 * 게시글 삭제
 * DELETE /api/admin/posts/{id}
 */
export const deletePost = async (postId: number): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.delete(`/admin/posts/${postId}`)
    console.log('deletePost 응답:', response.data)
  } catch (error) {
    console.error('deletePost error:', error)
    throw error
  }
}

// 미션 관련 인터페이스
export interface ApiMission {
  id: number
  question: string
  answer: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  categories: number[] | string[] // 상세 조회에서는 문자열 배열로 반환될 수 있음
  skills: number[] | string[] // 상세 조회에서는 문자열 배열로 반환될 수 있음
}

// 미션 상세 조회 응답 (categories와 skills가 문자열 배열)
export interface ApiMissionDetail {
  id: number
  question: string
  answer: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  categories: string[]
  skills: string[]
}

/**
 * 모든 미션 조회
 * GET /api/admin/missions
 */
export const getMissionList = async (): Promise<ApiMission[]> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.get(`/admin/missions`)
    console.log('getMissionList 전체 응답:', response)
    console.log('getMissionList 응답 데이터:', response.data)
    
    // 응답이 배열인 경우
    if (Array.isArray(response.data)) {
      return response.data as ApiMission[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiMission[]
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiMission[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('getMissionList error:', error)
    throw error
  }
}

/**
 * 미션 추가
 * POST /api/admin/missions
 */
export interface CreateMissionRequest {
  question: string
  answer: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  categories: number[]
  skills: number[]
}

export const createMission = async (data: CreateMissionRequest): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.post(`/admin/missions`, data)
    console.log('createMission 응답:', response.data)
  } catch (error) {
    console.error('createMission error:', error)
    throw error
  }
}

/**
 * 미션 수정
 * PUT /api/admin/missions/{id}
 */
export interface UpdateMissionRequest {
  question?: string
  answer?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  categories?: number[]
  skills?: number[]
}

export const updateMission = async (
  missionId: number,
  data: UpdateMissionRequest
): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.put(`/admin/missions/${missionId}`, data)
    console.log('updateMission 응답:', response.data)
  } catch (error) {
    console.error('updateMission error:', error)
    throw error
  }
}

/**
 * 미션 삭제
 * DELETE /api/admin/missions/{id}
 */
export const deleteMission = async (missionId: number): Promise<void> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.delete(`/admin/missions/${missionId}`)
    console.log('deleteMission 응답:', response.data)
  } catch (error) {
    console.error('deleteMission error:', error)
    throw error
  }
}

/**
 * 미션 검색
 * GET /api/admin/missions/search
 */
export interface SearchMissionParams {
  categoryId?: number
  skillId?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  keyword?: string
}

export const searchMissions = async (params?: SearchMissionParams): Promise<ApiMission[]> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.get(`/admin/missions/search`, { params })
    console.log('searchMissions 전체 응답:', response)
    console.log('searchMissions 응답 데이터:', response.data)
    
    // 응답이 배열인 경우
    if (Array.isArray(response.data)) {
      return response.data as ApiMission[]
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data && Array.isArray(response.data.resultData)) {
        return response.data.resultData as ApiMission[]
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data as ApiMission[]
      }
    }
    
    console.warn('예상치 못한 응답 형식:', response.data)
    return []
  } catch (error) {
    console.error('searchMissions error:', error)
    throw error
  }
}

/**
 * 미션 상세 조회
 * GET /api/admin/missions/{id}
 */
export const getMissionById = async (missionId: number): Promise<ApiMissionDetail> => {
  try {
    const adminClient = getAdminApiClient()
    const response = await adminClient.get(`/admin/missions/${missionId}`)
    console.log('getMissionById 전체 응답:', response)
    console.log('getMissionById 응답 데이터:', response.data)
    
    // 응답이 직접 객체인 경우
    if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      return response.data as ApiMissionDetail
    }
    
    // 응답이 ApiResponse로 래핑된 경우
    if (response.data && typeof response.data === 'object') {
      if ('resultData' in response.data) {
        return response.data.resultData as ApiMissionDetail
      }
      if ('data' in response.data) {
        return response.data.data as ApiMissionDetail
      }
    }
    
    throw new Error('예상치 못한 응답 형식')
  } catch (error) {
    console.error('getMissionById error:', error)
    throw error
  }
}

