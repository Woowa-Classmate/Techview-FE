import { lazy } from "react";

// 페이지 컴포넌트 lazy loading
const MainPage = lazy(() => import("../pages/MainPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignUpPage = lazy(() => import("../pages/SignUpPage"));
const ComponentShowcase = lazy(() => import("../pages/ComponentShowcase"));
const PositionSelectPage = lazy(() => import("../pages/PositionSelectPage"));
const PositionQuestionPage = lazy(() => import("../pages/PositionQuestionPage"));
const TechStackSelectPage = lazy(() => import("../pages/TechStackSelectPage"));
const TechStackQuestionPage = lazy(() => import("../pages/TechStackQuestionPage"));
const InterviewPage = lazy(() => import("../pages/InterviewPage"));
const InterviewFeedbackPage = lazy(() => import("../pages/InterviewFeedbackPage"));

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
];

