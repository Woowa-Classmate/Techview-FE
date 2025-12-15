/**
 * 라우트 경로 상수
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ABOUT: "/about",
  FIND_ID: "/find-id",
  FIND_PASSWORD: "/find-password",
  BOARD: "/board",
  POSITION: "/position",
  POSITION_QUESTION: (id: string) => `/position/${id}`,
  TECH_STACK: "/tech-stack",
  TECH_STACK_QUESTIONS: "/tech-stack/questions",
  INTERVIEW: (type: string, id: string) => `/interview/${type}/${id}`,
  INTERVIEW_FEEDBACK: "/interview/feedback",
  INTERVIEW_LIST: "/interview/list",
  COMPONENTS: "/components",
} as const;

