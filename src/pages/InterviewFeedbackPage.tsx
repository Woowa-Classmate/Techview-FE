import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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
}

const InterviewFeedbackPage = () => {
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

  // STT 텍스트는 나중에 녹화 영상에서 자동으로 추출되어 setSttTexts로 채워질 예정

  // 질문 데이터 로드
  useEffect(() => {
    if (questionIds.length === 0) {
      setIsLoading(false);
      setQuestionsLoaded(false);
      return;
    }
    
    // 이미 로드된 경우 중복 방지
    if (questionsLoaded) {
      return;
    }

    // 포지션별 질문 데이터
    const positionQuestionsMap: Record<string, Array<{ id: number; question: string; difficulty: string; tags: string[] }>> = {
      frontend: [
        { id: 1, question: "em과 rem의 차이를 설명해 주세요.", difficulty: "Easy", tags: ["CSS", "웹"] },
        { id: 2, question: "inline과 inline-block의 차이점은 무엇인가요?", difficulty: "Easy", tags: ["CSS"] },
        { id: 3, question: "크로스 브라우징 이슈 경험이 있나요? 있다면 해결은 어떻게 하였나요?", difficulty: "Easy", tags: ["웹"] },
      ],
      backend: [
        { id: 1, question: "RESTful API의 특징과 장점을 설명해주세요.", difficulty: "Medium", tags: ["API", "Backend"] },
        { id: 2, question: "동기와 비동기의 차이점을 설명해주세요.", difficulty: "Easy", tags: ["Backend"] },
      ],
      android: [
        { id: 1, question: "안드로이드의 생명주기(Lifecycle)에 대해 설명해주세요.", difficulty: "Medium", tags: ["Android"] },
      ],
      ios: [
        { id: 1, question: "iOS의 메모리 관리 방식인 ARC에 대해 설명해주세요.", difficulty: "Medium", tags: ["iOS"] },
      ],
      devops: [
        { id: 1, question: "CI/CD 파이프라인의 개념과 장점을 설명해주세요.", difficulty: "Medium", tags: ["DevOps"] },
      ],
    };

    // 기술 스택별 질문 데이터
    const techStackQuestionsMap: Record<string, Array<{ id: number; question: string; difficulty: string; tags: string[] }>> = {
      react: [
        { id: 1, question: "React의 Virtual DOM이란 무엇이고, 왜 사용하나요?", difficulty: "Medium", tags: ["React", "Virtual DOM"] },
        { id: 2, question: "useState와 useEffect의 차이점을 설명해주세요.", difficulty: "Easy", tags: ["React", "Hooks"] },
        { id: 3, question: "React의 렌더링 최적화 방법을 설명해주세요.", difficulty: "Hard", tags: ["React", "Performance"] },
      ],
      vue: [
        { id: 4, question: "Vue의 반응성 시스템(Reactivity System)에 대해 설명해주세요.", difficulty: "Medium", tags: ["Vue", "Reactivity"] },
        { id: 5, question: "Vue 2와 Vue 3의 주요 차이점은 무엇인가요?", difficulty: "Medium", tags: ["Vue"] },
      ],
      nodejs: [
        { id: 6, question: "Node.js의 이벤트 루프(Event Loop)에 대해 설명해주세요.", difficulty: "Hard", tags: ["Node.js", "Event Loop"] },
        { id: 7, question: "비동기 처리에서 Promise와 async/await의 차이점은?", difficulty: "Medium", tags: ["Node.js", "Async"] },
      ],
      python: [
        { id: 8, question: "Python의 GIL(Global Interpreter Lock)에 대해 설명해주세요.", difficulty: "Hard", tags: ["Python"] },
        { id: 9, question: "리스트 컴프리헨션과 일반 반복문의 차이점은?", difficulty: "Easy", tags: ["Python"] },
      ],
      typescript: [
        { id: 10, question: "TypeScript의 타입 시스템에 대해 설명해주세요.", difficulty: "Medium", tags: ["TypeScript"] },
        { id: 11, question: "인터페이스와 타입 별칭의 차이점은 무엇인가요?", difficulty: "Easy", tags: ["TypeScript"] },
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

      const uniqueTechQuestions = Array.from(
        new Map(allTechQuestions.map((q) => [q.id, q])).values()
      );

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
    
    // STT 텍스트 초기화
    const initialSttTexts: Record<number, string> = {};
    loadedQuestions.forEach((q) => {
      initialSttTexts[q.id] = "";
    });
    setSttTexts(initialSttTexts);
  }, [questionIds.join(','), type, id, stacks.join(',')]);

  // AI 피드백 로드
  useEffect(() => {
    if (!questionsLoaded || questionsRef.current.length === 0 || feedbackLoaded) {
      return;
    }

    let isMounted = true;

    const fetchFeedback = async () => {
      setIsLoading(true);
      
      // 시뮬레이션: 실제로는 서버 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!isMounted) return;

      // ref를 통해 현재 questions를 사용하여 피드백 생성
      const currentQuestions = questionsRef.current;
      const mockFeedbacks: Feedback[] = currentQuestions.map((q) => ({
        questionId: q.id,
        question: q.question,
        feedback: `이 답변은 대체로 정확한 내용을 포함하고 있으나, ${q.question}에 대한 이해가 부족하고 약간의 혼동이 있습니다. 화살표 함수는 기존의 함수 선언문과 함수 표현식을 대체하지 않습니다. 대신, 익명 함수 표현식을 더 간결하게 작성할 수 있는 문법적인 형태입니다. 또한, 화살표 함수는 this 값을 자동으로 바인딩하지 않으므로, 메소드로 사용할 때에는 불편함이 있을 수 있습니다. 따라서, 화살표 함수는 간략한 익명 함수를 작성하고자 할 때에 사용될 수 있으며, 함수 내부에서 this를 사용하지 않을 때에 유용합니다. 이 점을 보완하여 답변을 수정하면 될 것입니다.`,
        modelAnswer: `ES6에서 화살표 함수는 주로 간단한 익명 함수를 간결하게 작성하기 위해 사용됩니다. 화살표 함수는 함수 몸체가 한줄인 경우 중괄호와 return 키워드를 생략할 수 있어서 코드를 더욱 간결하게 만들 수 있습니다. 또한, 화살표 함수의 this는 함수를 선언한 범위에서 상속되기 때문에 일반 함수에서 발생하는 this 문제를 피할 수 있습니다. 하지만, 메서드로 사용할 때에는 일반 함수 표현식이 더 적합할 수 있습니다.`,
      }));

      setFeedbacks(mockFeedbacks);
      setIsLoading(false);
      setFeedbackLoaded(true);
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [questionsLoaded, feedbackLoaded]);

  // STT 텍스트는 나중에 녹화 영상에서 자동으로 추출되어 채워질 예정
  // 현재는 빈 상태로 표시됨

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="inline-block mb-4 w-12 h-12 rounded-full border-b-2 border-yellow-600 animate-spin"></div>
            <p className="text-lg text-gray-600">AI 피드백을 분석하는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-800">면접 피드백 결과</h1>
            <p className="text-gray-600">총 {questions.length}개의 질문에 대한 피드백</p>
          </div>

          {/* 피드백 목록 */}
          <div className="space-y-8">
            {questions.map((question, index) => {
              const feedback = feedbacks.find((f) => f.questionId === question.id);

              return (
                <div key={question.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* 면접 질문 */}
                  <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                    <div className="flex gap-3 items-start">
                      <span className="text-xl font-bold text-yellow-600">Q{index + 1}.</span>
                      <p className="flex-1 text-lg font-semibold text-gray-800">{question.question}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 ml-8">
                      <span
                        className={`px-3 py-1 text-xs rounded ${
                          question.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : question.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        #{question.difficulty}
                      </span>
                      {question.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* 2열 레이아웃 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 왼쪽: 내 답변 */}
                      <div>
                        <h3 className="mb-3 text-lg font-bold text-gray-800">내 답변</h3>
                        <div className="px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg min-h-[300px]">
                          {sttTexts[question.id] ? (
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{sttTexts[question.id]}</p>
                          ) : (
                            <p className="text-gray-400 italic">STT로 추출한 텍스트가 여기에 표시됩니다.</p>
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: AI 피드백 및 모범 답안 */}
                      <div className="space-y-6">
                        {/* AI 피드백 */}
                        {feedback && (
                          <div>
                            <h3 className="mb-3 text-lg font-bold text-gray-800">AI 피드백</h3>
                            <div className="px-4 py-4 text-sm bg-white border border-gray-300 rounded-lg min-h-[200px]">
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.feedback}</p>
                            </div>
                          </div>
                        )}

                        {/* AI 모범 답안 */}
                        {feedback && (
                          <div>
                            <h3 className="mb-3 text-lg font-bold text-gray-800">AI 모범 답안</h3>
                            <div className="px-4 py-4 text-sm bg-blue-50 border border-blue-200 rounded-lg min-h-[200px]">
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.modelAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              type="button"
              onClick={() => {
                const path = type === "position" ? "/position" : "/tech-stack";
                navigate(path);
              }}
              className="px-6 py-3 font-medium text-gray-800 bg-gray-200 rounded-lg transition hover:bg-gray-300 cursor-pointer"
            >
              다시 면접하기
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/");
              }}
              className="px-6 py-3 font-semibold text-white bg-[#F4A11A] rounded-lg transition hover:bg-[#e09010] cursor-pointer"
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InterviewFeedbackPage;
