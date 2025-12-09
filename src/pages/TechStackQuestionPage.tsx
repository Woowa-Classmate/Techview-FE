import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const BOOKMARK_KEY = "techview_bookmarks";

const TechStackQuestionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"selected" | "random">("selected");
  const [sortBy, setSortBy] = useState<string>("difficulty-low");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  useEffect(() => {
    const stacksParam = searchParams.get("stacks");
    if (stacksParam) {
      setSelectedStacks(stacksParam.split(","));
    }
  }, [searchParams]);

  // 북마크 로드
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(BOOKMARK_KEY);
    if (savedBookmarks) {
      try {
        const bookmarks = JSON.parse(savedBookmarks);
        setBookmarkedIds(bookmarks);
      } catch (e) {
        console.error("북마크 로드 실패:", e);
      }
    }
  }, []);

  // 북마크 토글
  const toggleBookmark = (questionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = bookmarkedIds.includes(questionId)
      ? bookmarkedIds.filter((id) => id !== questionId)
      : [...bookmarkedIds, questionId];
    
    setBookmarkedIds(newBookmarks);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(newBookmarks));
  };

  const handleStartInterview = () => {
    // 선택한 질문 ID들을 쿼리 파라미터로 전달
    const questionIds = selectedQuestionIds.join(",");
    const stacksParam = selectedStacks.join(",");
    navigate(`/interview/tech-stack/tech-stack?stacks=${stacksParam}&questions=${questionIds}`);
  };

  const stackNames: Record<string, string> = {
    react: "React",
    vue: "Vue",
    angular: "Angular",
    svelte: "Svelte",
    nextjs: "Next.js",
    nuxtjs: "Nuxt.js",
    nodejs: "Node.js",
    python: "Python",
    java: "Java",
    spring: "Spring",
    FastAPI: "FastAPI",
    django: "Django",
    express: "Express",
    nestjs: "NestJS",
    mysql: "MySQL",
    postgresql: "PostgreSQL",
    mongodb: "MongoDB",
    redis: "Redis",
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    docker: "Docker",
    kubernetes: "Kubernetes",
    "react-native": "React Native",
    flutter: "Flutter",
    typescript: "TypeScript",
    git: "Git",
  };

  // 기술 스택별 질문 데이터 (예시)
  const getQuestionsByStack = (stackId: string) => {
    const questionsMap: Record<string, Array<{ id: number; question: string; difficulty: string; tags: string[] }>> = {
      react: [
        {
          id: 1,
          question: "React의 Virtual DOM이란 무엇이고, 왜 사용하나요?",
          difficulty: "Medium",
          tags: ["React", "Virtual DOM"],
        },
        {
          id: 2,
          question: "useState와 useEffect의 차이점을 설명해주세요.",
          difficulty: "Easy",
          tags: ["React", "Hooks"],
        },
        {
          id: 3,
          question: "React의 렌더링 최적화 방법을 설명해주세요.",
          difficulty: "Hard",
          tags: ["React", "Performance"],
        },
      ],
      vue: [
        {
          id: 4,
          question: "Vue의 반응성 시스템(Reactivity System)에 대해 설명해주세요.",
          difficulty: "Medium",
          tags: ["Vue", "Reactivity"],
        },
        {
          id: 5,
          question: "Vue 2와 Vue 3의 주요 차이점은 무엇인가요?",
          difficulty: "Medium",
          tags: ["Vue"],
        },
      ],
      nodejs: [
        {
          id: 6,
          question: "Node.js의 이벤트 루프(Event Loop)에 대해 설명해주세요.",
          difficulty: "Hard",
          tags: ["Node.js", "Event Loop"],
        },
        {
          id: 7,
          question: "비동기 처리에서 Promise와 async/await의 차이점은?",
          difficulty: "Medium",
          tags: ["Node.js", "Async"],
        },
      ],
      python: [
        {
          id: 8,
          question: "Python의 GIL(Global Interpreter Lock)에 대해 설명해주세요.",
          difficulty: "Hard",
          tags: ["Python"],
        },
        {
          id: 9,
          question: "리스트 컴프리헨션과 일반 반복문의 차이점은?",
          difficulty: "Easy",
          tags: ["Python"],
        },
      ],
      typescript: [
        {
          id: 10,
          question: "TypeScript의 타입 시스템에 대해 설명해주세요.",
          difficulty: "Medium",
          tags: ["TypeScript"],
        },
        {
          id: 11,
          question: "인터페이스와 타입 별칭의 차이점은 무엇인가요?",
          difficulty: "Easy",
          tags: ["TypeScript"],
        },
      ],
    };

    return questionsMap[stackId] || [];
  };

  // 선택한 모든 기술 스택의 질문을 합침
  const allQuestions = selectedStacks.flatMap((stackId) => {
    const questions = getQuestionsByStack(stackId);
    return questions.map((q) => ({ ...q, stackId }));
  });

  // 중복 제거 (같은 ID의 질문이 여러 스택에 있을 수 있음)
  const uniqueQuestions = Array.from(
    new Map(allQuestions.map((q) => [q.id, q])).values()
  );

  const sortOptions = [
    { value: "difficulty-low", label: "난이도 낮은 순" },
    { value: "difficulty-high", label: "난이도 높은 순" },
    { value: "popularity", label: "인기 순" },
  ];

  const difficultyOrder: Record<string, number> = {
    Easy: 1,
    Medium: 2,
    Hard: 3,
  };

  const sortedQuestions = [...uniqueQuestions].sort((a, b) => {
    if (sortBy === "difficulty-low") {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    } else if (sortBy === "difficulty-high") {
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    }
    return 0;
  });

  if (selectedStacks.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex flex-1 justify-center items-center px-4 py-8">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              기술 스택이 선택되지 않았습니다
            </h2>
            <button
              onClick={() => navigate("/tech-stack")}
              className="bg-[#F4A11A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#e09010] transition-all"
            >
              기술 스택 선택하러 가기
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-yellow-600">TECH STACK TEST</h2>
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              선택한 기술 스택: {selectedStacks.map((id) => stackNames[id] || id).join(", ")}
            </h1>
            <p className="mb-1 text-sm text-gray-600">
              질문을 선택해 질문에 대한 답을 준비해보세요.
            </p>
            <p className="text-sm text-gray-600">
              동영상 녹화를 통해 면접 영상을 확인할 수 있습니다.
            </p>
          </div>

          {/* 탭 및 정렬 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-0 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("selected")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "selected"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                선택 면접
              </button>
              <button
                onClick={() => setActiveTab("random")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "random"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                랜덤 면접
              </button>
            </div>

            {/* 정렬 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex gap-2 items-center px-4 py-2 text-sm bg-white rounded-lg border border-gray-300 transition hover:bg-gray-50"
              >
                <span>{sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
                <svg
                  className={`w-4 h-4 transition ${isSortOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isSortOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                        sortBy === option.value ? "bg-gray-50 font-medium" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 질문 목록 */}
          {sortedQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-600">선택한 기술 스택에 대한 질문이 없습니다.</p>
              <button
                onClick={() => navigate("/tech-stack")}
                className="bg-[#F4A11A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#e09010] transition-all"
              >
                다른 기술 스택 선택하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                      } else {
                        setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                      }
                    }}
                    className={`bg-white border rounded-lg p-6 transition-all cursor-pointer ${
                      isSelected
                        ? "border-yellow-400 shadow-md"
                        : "border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex gap-3 items-start mb-3">
                          <span className="text-lg font-bold text-yellow-600">Q.</span>
                          <p className="flex-1 text-base text-gray-800">{q.question}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              q.difficulty === "Easy"
                                ? "bg-green-100 text-green-700"
                                : q.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            #{q.difficulty}
                          </span>
                          {q.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(q.id, e)}
                        className={`p-2 ml-4 rounded transition hover:bg-gray-100 ${
                          bookmarkedIds.includes(q.id) ? "text-yellow-500" : "text-gray-400"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={bookmarkedIds.includes(q.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 하단 고정 버튼 */}
      {selectedQuestionIds.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 mx-auto max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{selectedQuestionIds.length}개</span>의 질문이 선택되었습니다
              </div>
              <button
                onClick={handleStartInterview}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-lg shadow-md transition-all hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600"
              >
                면접 시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TechStackQuestionPage;
