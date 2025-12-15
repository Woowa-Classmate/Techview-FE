/**
 * 면접 관련 타입 정의
 */

export type PostCategory = "notice" | "free";

export interface Question {
  id: number;
  question: string;
  difficulty: string;
  tags: string[];
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: number;
  category: PostCategory;
  title: string;
  content: string;
  author: string;
  authorInfo?: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface InterviewRecord {
  id: string;
  sessionId: string;
  type: "position" | "tech-stack";
  positionId?: string;
  stacks?: string[];
  questionIds: number[];
  question: string;
  date: string;
  duration: number;
  thumbnail?: string;
  status: "success" | "failed";
  failureReason?: string;
}

export interface EmotionStats {
  positive: number;
  neutral: number;
  negative: number;
}

export interface FrameEmotion {
  time: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface AnswerIntention {
  name: string;
  percentage: number;
  category: string;
}

export interface Feedback {
  questionId: number;
  question: string;
  feedback: string;
  modelAnswer: string;
  answerText: string;
  keywords: string[];
  includedKeywords: number;
  totalKeywords: number;
  emotionStats: EmotionStats;
  frameEmotions: FrameEmotion[];
  answerIntentions: AnswerIntention[];
  expressionFeedback: string;
  intentionFeedback: string;
}

export type TabType = "detail" | "emotion" | "strength" | "intention" | "keywords";

