import { apiClient } from "./client";

/**
 * 질문 상세 정보 인터페이스
 */
export interface QuestionDetail {
  id: number;
  question: string;
  answer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categories: string[];
  skills: string[];
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  difficultyOrder?: "asc" | "desc";
}

/**
 * 질문 검색 파라미터
 */
export interface QuestionSearchParams extends PaginationParams {
  categoryId?: number;
  skillId?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  keyword?: string;
}

/**
 * 질문 추천 파라미터
 */
export interface QuestionRecommendationParams extends PaginationParams {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryId?: number;
  skillId?: number;
}

/**
 * 질문 상세 조회
 * GET /api/questions/{id}
 */
export const getQuestionById = async (id: number): Promise<QuestionDetail> => {
  const response = await apiClient.get<QuestionDetail>(`/questions/${id}`);
  return response.data;
};

/**
 * 질문 검색
 * GET /api/questions
 */
export const searchQuestions = async (
  params?: QuestionSearchParams
): Promise<QuestionDetail[]> => {
  const response = await apiClient.get<QuestionDetail[]>("/questions", {
    params,
  });
  return response.data;
};

/**
 * 질문 추천
 * GET /api/questions/recommendations
 */
export const getQuestionRecommendations = async (
  params: QuestionRecommendationParams
): Promise<QuestionDetail[]> => {
  const response = await apiClient.get<QuestionDetail[]>(
    "/questions/recommendations",
    {
      params: {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  );
  // 응답이 배열인지 확인
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // 페이지네이션된 응답인 경우 (예: { content: [...], totalElements: ... })
  if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray(response.data.content)) {
    return response.data.content;
  }
  console.warn('예상치 못한 응답 형식:', response.data);
  return [];
};

/**
 * 포지션별 질문 조회
 * GET /api/position/{positionName}?page=0&size=10&difficultyOrder=asc
 */
export const getQuestionsByPosition = async (
  positionName: string,
  params?: PaginationParams
): Promise<QuestionDetail[]> => {
  const requestParams: Record<string, any> = {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
  };
  
  // difficultyOrder가 있으면 추가 (기본값은 asc)
  if (params?.difficultyOrder) {
    requestParams.difficultyOrder = params.difficultyOrder;
  }
  
  const response = await apiClient.get<QuestionDetail[]>(
    `/position/${positionName}`,
    {
      params: requestParams,
    }
  );
  // 응답이 배열인지 확인
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // 페이지네이션된 응답인 경우 (예: { content: [...], totalElements: ... })
  if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray(response.data.content)) {
    return response.data.content;
  }
  console.warn('예상치 못한 응답 형식:', response.data);
  return [];
};

