import { lazy } from "react";

// 페이지 컴포넌트 lazy loading
// Main
const MainPage = lazy(() => import("@/pages/main/MainPage"));
const AboutPage = lazy(() => import("@/pages/main/AboutPage"));

// Auth
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const FindIdPage = lazy(() => import("@/pages/auth/FindIdPage"));
const FindPasswordPage = lazy(() => import("@/pages/auth/FindPasswordPage"));

// Interview
const PositionSelectPage = lazy(() => import("@/pages/interview/PositionSelectPage"));
const PositionQuestionPage = lazy(() => import("@/pages/interview/PositionQuestionPage"));
const TechStackSelectPage = lazy(() => import("@/pages/interview/TechStackSelectPage"));
const TechStackQuestionPage = lazy(() => import("@/pages/interview/TechStackQuestionPage"));
const InterviewPage = lazy(() => import("@/pages/interview/InterviewPage"));
const InterviewFeedbackPage = lazy(() => import("@/pages/interview/InterviewFeedbackPage"));
const InterviewListPage = lazy(() => import("@/pages/interview/InterviewListPage"));

// Board
const BoardPage = lazy(() => import("@/pages/board/BoardPage"));

// Dev
const ComponentShowcase = lazy(() => import("@/pages/dev/ComponentShowcase"));

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  label?: string;
}

export const routerList: RouteConfig[] = [
  {
    path: "/",
    element: <MainPage />,
    label: "메인",
  },
  {
    path: "/login",
    element: <LoginPage />,
    label: "로그인",
  },
  {
    path: "/signup",
    element: <SignUpPage />,
    label: "회원가입",
  },
  {
    path: "/about",
    element: <AboutPage />,
    label: "About",
  },
  {
    path: "/find-id",
    element: <FindIdPage />,
    label: "아이디 찾기",
  },
  {
    path: "/find-password",
    element: <FindPasswordPage />,
    label: "비밀번호 찾기",
  },
  {
    path: "/components",
    element: <ComponentShowcase />,
    label: "컴포넌트 쇼케이스",
  },
  {
    path: "/position",
    element: <PositionSelectPage />,
    label: "포지션 선택",
  },
  {
    path: "/position/:positionId",
    element: <PositionQuestionPage />,
    label: "포지션 질문",
  },
  {
    path: "/tech-stack",
    element: <TechStackSelectPage />,
    label: "기술 스택 선택",
  },
  {
    path: "/tech-stack/questions",
    element: <TechStackQuestionPage />,
    label: "기술 스택 질문",
  },
  {
    path: "/interview/:type/:id",
    element: <InterviewPage />,
    label: "면접",
  },
  {
    path: "/interview/feedback",
    element: <InterviewFeedbackPage />,
    label: "면접 피드백",
  },
  {
    path: "/interview/list",
    element: <InterviewListPage />,
    label: "면접 목록",
  },
  {
    path: "/board",
    element: <BoardPage />,
    label: "게시판",
  },
];

