/**
 * localStorage 키 상수
 */
export const STORAGE_KEYS = {
  USER: "user",
  ADMIN_AUTH: "adminAuth",
  INTERVIEW_SESSION: (sessionId: string) => `interview_session_${sessionId}`,
} as const;

