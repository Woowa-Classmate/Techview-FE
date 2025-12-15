import { apiClient } from "./client";

export interface Comment {
  commentId: number;
  content: string;
  userName: string;
  createAt: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: number;
  password?: string;
}

export interface UpdateCommentRequest {
  content: string;
  password: string;
}

export interface DeleteCommentRequest {
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 댓글 목록 조회
 * 특정 게시글의 모든 댓글을 조회합니다.
 */
export const getComments = async (postId: number): Promise<Comment[]> => {
  const response = await apiClient.get<Comment[]>(`/comments/post/${postId}`);
  return response.data;
};

/**
 * 댓글 작성
 * 게시글에 댓글을 작성합니다. (인증 필요)
 */
export const createComment = async (data: CreateCommentRequest): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>("/comments", data);
  return response.data;
};

/**
 * 댓글 수정
 * 비밀번호를 확인하여 댓글을 수정합니다.
 */
export const updateComment = async (id: number, data: UpdateCommentRequest): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>(`/comments/${id}`, data);
  return response.data;
};

/**
 * 댓글 삭제
 * 비밀번호를 확인하여 댓글을 삭제합니다.
 */
export const deleteComment = async (id: number, data: DeleteCommentRequest): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(`/comments/${id}`, { data });
  return response.data;
};

