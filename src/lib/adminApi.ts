import { apiClient } from '@/api/client'

export interface ApiUser {
  id: number
  memberId: string
  memberName: string
  phone: string
  birthDate: string
  authority: 'USER' | 'ADMIN'
  status: 'ABLE' | 'DISABLE'
}

export interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * 사용자 목록 조회
 */
export const getUserList = async (): Promise<ApiUser[]> => {
  try {
    const response = await apiClient.get<ApiResponse>('/admin/users')
    return response.data.data || []
  } catch (error) {
    console.error('getUserList error:', error)
    throw error
  }
}

/**
 * 회원 권한 업데이트
 */
export const updateMemberAuthority = async (
  memberId: string,
  authority: 'USER' | 'ADMIN'
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.patch<ApiResponse>(`/admin/users/${memberId}/authority`, {
      authority,
    })
    return response.data
  } catch (error) {
    console.error('updateMemberAuthority error:', error)
    throw error
  }
}

/**
 * 이름으로 회원 조회
 */
export const getMemberByName = async (name: string): Promise<ApiUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse>(`/admin/users/search`, {
      params: { name },
    })
    return response.data.data || null
  } catch (error) {
    console.error('getMemberByName error:', error)
    return null
  }
}

/**
 * 커스텀 알림 전송
 */
export const sendCustomNotification = async (
  memberId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/custom`, {
      memberId,
      message,
    })
    return response.data
  } catch (error) {
    console.error('sendCustomNotification error:', error)
    throw error
  }
}

/**
 * 일기 알림 전송
 */
export const sendDiaryNotification = async (memberId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/diary`, {
      memberId,
    })
    return response.data
  } catch (error) {
    console.error('sendDiaryNotification error:', error)
    throw error
  }
}

/**
 * 리포트 알림 전송
 */
export const sendReportNotification = async (memberId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/report`, {
      memberId,
    })
    return response.data
  } catch (error) {
    console.error('sendReportNotification error:', error)
    throw error
  }
}

/**
 * 전체 커스텀 알림 전송
 */
export const sendAllCustomNotification = async (message: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/custom/all`, {
      message,
    })
    return response.data
  } catch (error) {
    console.error('sendAllCustomNotification error:', error)
    throw error
  }
}

/**
 * 전체 일기 알림 전송
 */
export const sendAllDiaryNotification = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/diary/all`)
    return response.data
  } catch (error) {
    console.error('sendAllDiaryNotification error:', error)
    throw error
  }
}

/**
 * 전체 리포트 알림 전송
 */
export const sendAllReportNotification = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>(`/admin/notifications/report/all`)
    return response.data
  } catch (error) {
    console.error('sendAllReportNotification error:', error)
    throw error
  }
}

