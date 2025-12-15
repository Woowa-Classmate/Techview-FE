import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import emotionGood from "@/assets/images/emotion_good.png";
import emotionSoso from "@/assets/images/emotion_soso.png";
import emotionBad from "@/assets/images/emotion_bad.png";

interface Question {
  id: number;
  question: string;
  difficulty: string;
  tags: string[];
}

interface Feedback {
  questionId: number;
  question: string;
  feedback: string;
  modelAnswer: string;
  answerText: string;
  keywords: string[];
  includedKeywords: number;
  totalKeywords: number;
  emotionStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  frameEmotions: Array<{
    time: number; // 초 단위
    positive: number;
    neutral: number;
    negative: number;
  }>;
  answerIntentions: Array<{
    name: string;
    percentage: number;
    category: string;
  }>;
  expressionFeedback: string;
  intentionFeedback: string;
}

type TabType = "detail" | "emotion" | "strength" | "intention" | "keywords";

interface InterviewFeedbackPageProps {
  hideHeaderFooter?: boolean;
}

const InterviewFeedbackPage = ({ hideHeaderFooter = false }: InterviewFeedbackPageProps = {}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get("type");
  const id = searchParams.get("id");

  const stacks = useMemo(() => {
    return searchParams.get("stacks")?.split(",") || [];
  }, [searchParams]);

  const questionIds = useMemo(() => {
    const ids = searchParams.get("questions")?.split(",").map(Number) || [];
    return ids;
  }, [searchParams]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const questionsRef = useRef<Question[]>([]);
  const [sttTexts, setSttTexts] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("detail");

  // 질문 데이터 로드
  useEffect(() => {
    if (questionIds.length === 0) {
      setIsLoading(false);
      setQuestionsLoaded(false);
      return;
    }

    if (questionsLoaded) {
      return;
    }

    const positionQuestionsMap: Record<
      string,
      Array<{ id: number; question: string; difficulty: string; tags: string[] }>
    > = {
      frontend: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "em과 rem의 차이를 설명해 주세요.", difficulty: "Easy", tags: ["CSS", "웹"] },
        {
          id: 3,
          question: "크로스 브라우징 이슈 경험이 있나요? 있다면 해결은 어떻게 하였나요?",
          difficulty: "Easy",
          tags: ["웹"],
        },
      ],
      backend: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "RESTful API의 특징과 장점을 설명해주세요.", difficulty: "Medium", tags: ["API", "Backend"] },
      ],
      android: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "안드로이드의 생명주기(Lifecycle)에 대해 설명해주세요.", difficulty: "Medium", tags: ["Android"] },
      ],
      ios: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "iOS의 메모리 관리 방식인 ARC에 대해 설명해주세요.", difficulty: "Medium", tags: ["iOS"] },
      ],
      devops: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "CI/CD 파이프라인의 개념과 장점을 설명해주세요.", difficulty: "Medium", tags: ["DevOps"] },
      ],
    };

    const techStackQuestionsMap: Record<
      string,
      Array<{ id: number; question: string; difficulty: string; tags: string[] }>
    > = {
      react: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "React의 Virtual DOM이란 무엇이고, 왜 사용하나요?", difficulty: "Medium", tags: ["React", "Virtual DOM"] },
      ],
      vue: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "Vue의 반응성 시스템(Reactivity System)에 대해 설명해주세요.", difficulty: "Medium", tags: ["Vue", "Reactivity"] },
      ],
      nodejs: [
        { id: 1, question: "1분 자기소개 부탁드립니다.", difficulty: "Easy", tags: ["자기소개"] },
        { id: 2, question: "Node.js의 이벤트 루프(Event Loop)에 대해 설명해주세요.", difficulty: "Hard", tags: ["Node.js", "Event Loop"] },
      ],
    };

    const loadedQuestions: Question[] = [];

    if (type === "position" && id) {
      const positionQuestions = positionQuestionsMap[id] || [];
      questionIds.forEach((qId) => {
        const question = positionQuestions.find((q) => q.id === qId);
        if (question) {
          loadedQuestions.push({
            id: question.id,
            question: question.question,
            difficulty: question.difficulty,
            tags: question.tags,
          });
        }
      });
    } else if (type === "tech-stack" && stacks.length > 0) {
      const allTechQuestions: Array<{ id: number; question: string; difficulty: string; tags: string[] }> = [];
      stacks.forEach((stack) => {
        const stackQuestions = techStackQuestionsMap[stack] || [];
        allTechQuestions.push(...stackQuestions);
      });

      const uniqueTechQuestions = Array.from(new Map(allTechQuestions.map((q) => [q.id, q])).values());

      questionIds.forEach((qId) => {
        const question = uniqueTechQuestions.find((q) => q.id === qId);
        if (question) {
          loadedQuestions.push({
            id: question.id,
            question: question.question,
            difficulty: question.difficulty,
            tags: question.tags,
          });
        }
      });
    }

    setQuestions(loadedQuestions);
    questionsRef.current = loadedQuestions;
    setQuestionsLoaded(true);

    const initialSttTexts: Record<number, string> = {};
    loadedQuestions.forEach((q) => {
      initialSttTexts[q.id] = "";
    });
    setSttTexts(initialSttTexts);
  }, [questionIds.join(","), type, id, stacks.join(",")]);

  // AI 피드백 로드
  useEffect(() => {
    if (!questionsLoaded || questionsRef.current.length === 0 || feedbackLoaded) {
      return;
    }

    let isMounted = true;

    const fetchFeedback = async () => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!isMounted) return;

      const currentQuestions = questionsRef.current;
      const mockFeedbacks: Feedback[] = currentQuestions.map((q) => {
        const isSelfIntro = q.question.includes("자기소개");
        return {
          questionId: q.id,
          question: q.question,
          feedback: `이 답변은 대체로 정확한 내용을 포함하고 있으나, ${q.question}에 대한 이해를 더 깊이 할 수 있습니다.`,
          modelAnswer: `모범 답안 예시입니다.`,
          answerText: isSelfIntro
            ? "안녕하세요. 저는 경제학을 전공하고 3년간 은행에서 근무한 경험이 있습니다. 국민은행의 성장 가능성과 안정성을 보고 핀테크 분야로 이직을 결심하게 되었습니다."
            : "답변 내용이 여기에 표시됩니다.",
          keywords: isSelfIntro ? ["경제학", "은행", "핀테크"] : ["키워드1", "키워드2", "키워드3"],
          includedKeywords: isSelfIntro ? 3 : 2,
          totalKeywords: 3,
          emotionStats: {
            positive: 8.94,
            neutral: 72.07,
            negative: 18.99,
          },
          frameEmotions: Array.from({ length: 45 }, (_, i) => ({
            time: i,
            positive: Math.max(0, 10 + Math.sin(i / 5) * 5 + (Math.random() - 0.5) * 3),
            neutral: Math.max(0, 70 + Math.cos(i / 3) * 10 + (Math.random() - 0.5) * 5),
            negative: Math.max(0, 20 - Math.sin(i / 4) * 5 + (Math.random() - 0.5) * 3),
          })),
          answerIntentions: isSelfIntro
            ? [
                { name: "진정성(직무)", percentage: 14.14, category: "인성면접: 기타" },
                { name: "진정성(회사)", percentage: 3.65, category: "인성면접: 기타" },
                { name: "도전정신", percentage: 3.27, category: "인성면접: 성격" },
                { name: "ICT기술지향성", percentage: 1.92, category: "직무면접: 태도" },
                { name: "주도성", percentage: 1.74, category: "직무면접: 태도" },
              ]
            : [
                { name: "기술 이해도", percentage: 25.5, category: "직무면접" },
                { name: "실무 경험", percentage: 15.3, category: "직무면접" },
              ],
          expressionFeedback: "무표정이 많습니다.",
          intentionFeedback: "답변의 주요 의도는 진정성(직무), 진정성(회사), 도전정신 입니다.",
        };
      });

      setFeedbacks(mockFeedbacks);
      setIsLoading(false);
      setFeedbackLoaded(true);
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [questionsLoaded, feedbackLoaded]);

  if (isLoading) {
    return (
      <div className={`flex flex-col ${hideHeaderFooter ? "" : "min-h-screen"} bg-white`}>
        {!hideHeaderFooter && <Header />}
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="inline-block mb-4 w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
            <p className="text-lg text-gray-600">면접 분석 결과를 생성하는 중...</p>
          </div>
        </main>
        {!hideHeaderFooter && <Footer />}
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestionIndex];
  const currentFeedback = feedbacks.find((f) => f.questionId === currentQuestion?.id);

  if (!currentQuestion || !currentFeedback) {
    return (
      <div className={`flex flex-col ${hideHeaderFooter ? "" : "min-h-screen"} bg-white`}>
        {!hideHeaderFooter && <Header />}
        <main className="flex flex-1 justify-center items-center">
          <p className="text-gray-600">면접 데이터를 불러올 수 없습니다.</p>
        </main>
        {!hideHeaderFooter && <Footer />}
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex flex-col ${hideHeaderFooter ? "" : "min-h-screen"} bg-white`}>
      {!hideHeaderFooter && <Header />}

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">면접 분석 결과</h1>
            <p className="text-gray-600">
              "{currentQuestion.question}" 문항에 대한 면접 분석 결과입니다.
            </p>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { id: "detail", label: "세부 분석", badge: null },
              { id: "emotion", label: "감정 분석", badge: null },
              { id: "strength", label: "강점 분석", badge: null },
              { id: "intention", label: "답변 의도", badge: null },
              { id: "keywords", label: "키워드 포함 여부", badge: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium transition relative ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs text-white bg-blue-600 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* 메인 컨텐츠 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 왼쪽: 면접 영상 및 요약 */}
            <div className="space-y-6">
              {/* 영상 플레이어 */}
              <div className="flex justify-center items-center bg-gray-900 rounded-lg aspect-video">
                <div className="text-center text-white">
                  <svg className="mx-auto mb-2 w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <p className="text-sm">면접 영상</p>
                </div>
              </div>

              {/* 면접 정보 */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="mb-2 text-sm text-gray-500">실전 면접</div>
                <div className="mb-4 text-xs text-gray-400">{formatDate(new Date())}</div>
                <div className="mb-4 text-lg font-semibold text-gray-900">
                  Q. {currentQuestion.question}
                </div>

                {/* 피드백 요약 */}
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">😐</span>
                    <span className="text-sm text-gray-700">{currentFeedback.expressionFeedback}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">💬</span>
                    <span className="text-sm text-gray-700">{currentFeedback.intentionFeedback}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl">🔑</span>
                    <span className="text-sm text-gray-700">
                      핵심 키워드 {currentFeedback.totalKeywords}개 중 {currentFeedback.includedKeywords}개 포함 되었습니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* 감정 통계 */}
              {activeTab === "detail" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">감정 통계</h3>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2 text-xs text-gray-500">
                      <span>0초</span>
                      <span>44초</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full">
                      <div className="absolute left-[68%] top-0 w-0.5 h-full bg-red-500"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionGood} alt="긍정" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.positive.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">긍정</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionSoso} alt="중립" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.neutral.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">중립</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionBad} alt="부정" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.negative.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">부정</div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">
                    *한국인 감정인식을 위한 복합 영상의 감정 분석 및 표정 분석
                  </p>
                </div>
              )}

              {/* 개인화된 피드백 */}
              {activeTab === "detail" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <p className="mb-4 leading-relaxed text-gray-700">
                    면접 중에 무표정이 많은 편입니다. 면접 중에 무표정을 유지하는 것은 감정 표현이나 자세에 대한
                    신경을 쓰지 않는 것과 같습니다. 조금 더 표정을 다듬고 자세를 조절하여, 면접관들에게 더 나은
                    인상을 남길 수 있도록 노력해주세요! 자신감 있고 친근한 미소는 면접을 더욱 유익하게 만들어 줄 수
                    있습니다.
                  </p>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex gap-2 items-start mb-2">
                      <span className="text-xl">💡</span>
                      <h4 className="font-semibold text-gray-900">긍정적 표정의 중요성</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      면접에서 긍정적인 표정은 자신감을 나타내며 신뢰를 보여주는 데 도움이 됩니다. 이는 자신에 대한
                      확신을 보여주며, 어려움에 대처할 준비가 되어 있다는 인상을 줍니다. 또한 긍정적 분위기를 조성하여
                      면접 상황을 더욱 편안하게 만들어 줄 수 있고, 면접관에게 긍정적인 인상을 강화시킵니다.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽: 답변 내용 및 분석 */}
            <div className="space-y-6">
              {/* 답변 내용 - 답변 의도 탭과 감정 분석 탭이 아닐 때만 표시 */}
              {activeTab !== "intention" && activeTab !== "emotion" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">답변 내용</h3>
                  <div className="p-4 mb-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg">
                    {currentFeedback.answerText || sttTexts[currentQuestion.id] || "답변 내용이 여기에 표시됩니다."}
                  </div>

                  {/* 키워드 포함 여부 */}
                  <div className="mb-4">
                    <div className="mb-3 text-sm text-gray-700">
                      핵심 키워드: 미리 작성된 핵심 키워드 {currentFeedback.totalKeywords}개 중{" "}
                      {currentFeedback.includedKeywords}개의 키워드가 포함되어 있습니다.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentFeedback.keywords.map((keyword, idx) => {
                        const isIncluded = idx < currentFeedback.includedKeywords;
                        return (
                          <span
                            key={keyword}
                            className={`px-3 py-1.5 text-sm rounded-lg border ${
                              isIncluded
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {keyword}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 프레임별 감정 변화 차트 */}
              {activeTab === "emotion" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">프레임별 감정 변화</h3>
                  <div className="relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                      {/* Y축 레이블 */}
                      <text x="10" y="20" fontSize="12" fill="#6B7280" textAnchor="start">
                        긍정
                      </text>
                      <text x="10" y="100" fontSize="12" fill="#6B7280" textAnchor="start">
                        중립
                      </text>
                      <text x="10" y="180" fontSize="12" fill="#6B7280" textAnchor="start">
                        부정
                      </text>

                      {/* 그리드 라인 */}
                      <line x1="50" y1="0" x2="50" y2="200" stroke="#E5E7EB" strokeWidth="1" />
                      <line x1="50" y1="100" x2="800" y2="100" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />

                      {/* 감정 변화 라인 */}
                      {currentFeedback.frameEmotions.length > 0 && (
                        <>
                          {/* 긍정 라인 (파란색) */}
                          <polyline
                            points={currentFeedback.frameEmotions
                              .map(
                                (frame, idx) =>
                                  `${50 + (idx / (currentFeedback.frameEmotions.length - 1)) * 750},${
                                    100 - (frame.positive / 100) * 100
                                  }`
                              )
                              .join(" ")}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />

                          {/* 중립 라인 (노란색) */}
                          <polyline
                            points={currentFeedback.frameEmotions
                              .map(
                                (frame, idx) =>
                                  `${50 + (idx / (currentFeedback.frameEmotions.length - 1)) * 750},${
                                    100 - (frame.neutral / 100) * 100
                                  }`
                              )
                              .join(" ")}
                            fill="none"
                            stroke="#FBBF24"
                            strokeWidth="2"
                          />

                          {/* 부정 라인 (빨간색) */}
                          <polyline
                            points={currentFeedback.frameEmotions
                              .map(
                                (frame, idx) =>
                                  `${50 + (idx / (currentFeedback.frameEmotions.length - 1)) * 750},${
                                    100 + (frame.negative / 100) * 100
                                  }`
                              )
                              .join(" ")}
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="2"
                          />

                          {/* 특정 시점 강조 (10초 지점) */}
                          {(() => {
                            const highlightIdx = 10;
                            const x = 50 + (highlightIdx / (currentFeedback.frameEmotions.length - 1)) * 750;
                            return (
                              <line
                                x1={x}
                                y1="0"
                                x2={x}
                                y2="200"
                                stroke="#EF4444"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                              />
                            );
                          })()}
                        </>
                      )}

                      {/* X축 시간 레이블 */}
                      <text x="50" y="195" fontSize="10" fill="#6B7280" textAnchor="middle">
                        0초
                      </text>
                      <text x="800" y="195" fontSize="10" fill="#6B7280" textAnchor="middle">
                        {currentFeedback.frameEmotions.length - 1}초
                      </text>
                    </svg>
                  </div>

                  {/* 범례 */}
                  <div className="flex gap-4 justify-center mt-4">
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-0.5 bg-blue-500"></div>
                      <span className="text-xs text-gray-600">긍정</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-0.5 bg-yellow-500"></div>
                      <span className="text-xs text-gray-600">중립</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-0.5 bg-red-500"></div>
                      <span className="text-xs text-gray-600">부정</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 감정 통계 - 감정 분석 탭 */}
              {activeTab === "emotion" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">감정 통계</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionGood} alt="긍정" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.positive.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">긍정</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionSoso} alt="중립" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.neutral.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">중립</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="mb-2 flex justify-center">
                        <img src={emotionBad} alt="부정" className="w-16 h-16 object-contain" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currentFeedback.emotionStats.negative.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">부정</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 답변 의도 분석 */}
              {activeTab === "intention" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">답변 의도</h3>
                  <div className="space-y-4">
                    {currentFeedback.answerIntentions.map((intention, idx) => {
                      const colors = [
                        "bg-pink-200",
                        "bg-orange-200",
                        "bg-yellow-200",
                        "bg-blue-200",
                        "bg-purple-200",
                      ];
                      return (
                        <div key={idx}>
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="font-medium text-gray-700">{intention.name}</span>
                            <span className="text-gray-600">{intention.percentage.toFixed(2)}%</span>
                          </div>
                          <div className="overflow-hidden h-6 bg-gray-200 rounded-full">
                            <div
                              className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                              style={{ width: `${intention.percentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">{intention.category}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-gray-500">
                    * Al-Hub 채용면접 인터뷰 데이터의 52개 중 답변 의도 중 상위 5개
                  </p>
                </div>
              )}

              {/* 답변 의도의 중요성 */}
              {activeTab === "intention" && (
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex gap-2 items-start mb-2">
                    <span className="text-xl">💡</span>
                    <h4 className="font-semibold text-gray-900">답변 의도의 중요성</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    면접관의 질문 의도를 정확히 파악하는 것은 효과적인 면접 준비의 핵심입니다. 질문의 의도를 이해하면
                    더 정확하고 관련성 높은 답변을 제공할 수 있으며, 이를 통해 전문성과 자신감을 보여줄 수 있습니다.
                  </p>
                </div>
              )}

              {/* AI 피드백 */}
              {activeTab === "detail" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">AI 피드백</h3>
                  <div className="p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg">
                    {currentFeedback.feedback}
                  </div>
                </div>
              )}

              {/* 모범 답안 */}
              {activeTab === "detail" && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">모범 답안</h3>
                  <div className="p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-blue-50 rounded-lg">
                    {currentFeedback.modelAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 질문 네비게이션 */}
          {questions.length > 1 && (
            <div className="flex gap-2 justify-center mt-8">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedQuestionIndex === idx
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              type="button"
              onClick={() => {
                const path = type === "position" ? "/position" : "/tech-stack";
                navigate(path);
              }}
              className="px-6 py-3 font-medium text-gray-800 bg-gray-200 rounded-lg transition hover:bg-gray-300"
            >
              다시 면접하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default InterviewFeedbackPage;
