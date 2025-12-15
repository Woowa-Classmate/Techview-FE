import { apiClient } from "./client";

export interface CreatePostRequest {
  title: string;
  content: string;
  name?: string;
  password?: string;
}

export interface Post {
  postId: number;
  title: string;
  name: string;
  likeCount: number;
  createAt: string;
  updateAt?: string;
  content?: string; // 상세 조회 시에만 포함될 수 있음
  views?: number;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  password: string;
}

export interface DeletePostRequest {
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 게시글 작성
 * 새로운 게시글을 작성합니다.
 */
export const createPost = async (data: CreatePostRequest): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>("/posts", data);
  return response.data;
};

/**
 * 게시글 목록 조회
 * 모든 게시글 목록을 조회합니다.
 */
export const getPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>("/posts");
  return response.data;
};

/**
 * 게시글 상세 조회
 * 게시글 ID로 단일 게시글의 상세 정보를 조회합니다.
 */
export const getPost = async (id: number): Promise<Post> => {
  const response = await apiClient.get<Post>(`/posts/${id}`);
  return response.data;
};

/**
 * 게시글 수정
 * 비밀번호를 확인하여 게시글을 수정합니다.
 */
export const updatePost = async (id: number, data: UpdatePostRequest): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>(`/posts/${id}`, data);
  return response.data;
};

/**
 * 게시글 삭제
 * 비밀번호를 확인하여 게시글을 삭제합니다.
 */
export const deletePost = async (id: number, data: DeletePostRequest): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(`/posts/${id}`, { data });
  return response.data;
};

/**
 * 게시글 좋아요
 * 게시글에 좋아요를 추가하거나 취소합니다. (인증 필요)
 */
export const likePost = async (id: number): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(`/posts/${id}/like`);
  return response.data;
};

/**
 * 북마크 추가/삭제
 * 게시글을 북마크에 추가하거나 삭제합니다. (인증 필요)
 */
export const toggleBookmark = async (postId: number): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(`/posts/bookmarks/${postId}`);
  return response.data;
};

