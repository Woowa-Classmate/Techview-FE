import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getQuestionsByPosition, QuestionDetail } from "@/api/question";

const BOOKMARK_KEY = "techview_bookmarks";

const PositionQuestionPage = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"selected" | "random">("selected");
  const [sortBy, setSortBy] = useState<string>("difficulty-low");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);

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

  // sortBy를 difficultyOrder로 변환
  const getDifficultyOrder = (sortBy: string): "asc" | "desc" | undefined => {
    if (sortBy === "difficulty-low") return "asc";
    if (sortBy === "difficulty-high") return "desc";
    return "asc"; // 기본값 (popularity 등은 기본값 사용)
  };

  // 질문 데이터 로드
  useEffect(() => {
    const loadQuestions = async () => {
      if (!positionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const positionNames: Record<string, string> = {
          frontend: "Frontend",
          backend: "Backend",
          android: "Android",
          ios: "iOS",
          devops: "DevOps",
        };

        const positionName = positionNames[positionId] || positionId;
        const difficultyOrder = getDifficultyOrder(sortBy);

        if (activeTab === "selected") {
          // 선택 면접: 포지션별 모든 질문 조회
          const data = await getQuestionsByPosition(positionName, {
            page: currentPage,
            size: pageSize,
            difficultyOrder,
          });
          // API 응답이 배열인지 확인
          const questionsArray = Array.isArray(data) ? data : [];
          setQuestions(questionsArray);
          
          // 다음 페이지 존재 여부 확인: 다음 페이지를 조회해서 데이터가 있는지 확인
          if (questionsArray.length === pageSize) {
            // 현재 페이지가 가득 차 있으면 다음 페이지 확인
            const nextPageData = await getQuestionsByPosition(positionName, {
              page: currentPage + 1,
              size: pageSize,
              difficultyOrder,
            });
            const nextPageArray = Array.isArray(nextPageData) ? nextPageData : [];
            setHasMore(nextPageArray.length > 0);
          } else {
            // 현재 페이지가 가득 차지 않으면 마지막 페이지
            setHasMore(false);
          }
        } else {
          // 랜덤 면접: 포지션별 모든 질문을 가져와서 5개 랜덤 선택
          // 먼저 전체 질문을 가져옴 (충분히 많이)
          let allQuestions: QuestionDetail[] = [];
          let page = 0;
          const fetchSize = 50; // 한 번에 많이 가져오기
          
          while (true) {
            const data = await getQuestionsByPosition(positionName, {
              page,
              size: fetchSize,
              difficultyOrder: getDifficultyOrder(sortBy),
            });
            const questionsArray = Array.isArray(data) ? data : [];
            allQuestions = [...allQuestions, ...questionsArray];
            
            // 더 이상 질문이 없으면 중단
            if (questionsArray.length < fetchSize) {
              break;
            }
            page++;
            
            // 너무 많이 가져오는 것을 방지 (최대 200개)
            if (allQuestions.length >= 200) {
              break;
            }
          }
          
          // 5개 랜덤 선택
          const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
          const randomQuestions = shuffled.slice(0, Math.min(5, shuffled.length));
          setQuestions(randomQuestions);
          
          // 랜덤으로 선택된 5개 질문을 자동으로 선택
          setSelectedQuestionIds(randomQuestions.map(q => q.id));
          
          setHasMore(false); // 랜덤 면접은 페이지네이션 없음
        }
      } catch (err: any) {
        console.error("질문 로드 실패:", err);
        
        // 401 에러인 경우
        if (err?.response?.status === 401) {
          const hasToken = !!localStorage.getItem("accessToken");
          if (hasToken) {
            setError("토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
          } else {
            setError("질문을 조회하려면 로그인이 필요합니다.");
          }
        } else {
          const errorMessage = 
            err?.response?.data?.message ||
            err?.response?.data?.resultMsg ||
            err?.message ||
            "질문을 불러오는데 실패했습니다.";
          setError(errorMessage);
        }
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [positionId, activeTab, currentPage, sortBy]);

  // 탭 변경 시 페이지 리셋 및 선택 초기화
  useEffect(() => {
    setCurrentPage(0);
    if (activeTab === "selected") {
      // 선택 면접으로 변경 시 선택 초기화
      setSelectedQuestionIds([]);
    }
  }, [activeTab]);

  // 정렬 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [sortBy]);

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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
    navigate(`/interview/position/${positionId}?questions=${questionIds}`);
  };

  const positionNames: Record<string, string> = {
    frontend: "Frontend",
    backend: "Backend",
    android: "Android",
    ios: "iOS",
    devops: "DevOps",
  };

  const positionName = positionNames[positionId || ""] || "Frontend";

  // 난이도 표시 변환
  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      EASY: "Easy",
      MEDIUM: "Medium",
      HARD: "Hard",
    };
    return labels[difficulty] || difficulty;
  };

  // 서버에서 정렬하므로 클라이언트 측 정렬 제거
  const sortedQuestions = Array.isArray(questions) ? questions : [];

  const sortOptions = [
    { value: "difficulty-low", label: "난이도 낮은 순" },
    { value: "difficulty-high", label: "난이도 높은 순" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-yellow-600">POSITION TEST</h2>
            <h1 className="mb-4 text-4xl font-bold text-gray-800">{positionName}</h1>
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">질문을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">질문이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                // categories와 skills를 합쳐서 태그로 표시
                const allTags = [...(q.categories || []), ...(q.skills || [])];
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                      } else {
                        // 최대 5개까지만 선택 가능
                        if (selectedQuestionIds.length < 5) {
                          setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                        } else {
                          alert("질문은 최대 5개까지만 선택할 수 있습니다.");
                        }
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
                          <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded">
                            #{getDifficultyLabel(q.difficulty)}
                          </span>
                          {allTags.map((tag, index) => (
                            <span
                              key={`${tag}-${index}`}
                              className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(q.id, e)}
                        className={`ml-4 p-2 hover:bg-gray-100 rounded transition ${
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

          {/* 페이지네이션 (선택 면접에서만 표시) */}
          {!isLoading && !error && questions.length > 0 && activeTab === "selected" && (
            <div className="flex gap-2 justify-center items-center mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                페이지 {currentPage + 1}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!hasMore || questions.length === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
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
                {selectedQuestionIds.length < 5 && (
                  <span className="ml-2 text-gray-500">(최대 5개까지 선택 가능)</span>
                )}
              </div>
              <button
                onClick={handleStartInterview}
                className="px-8 py-3 font-semibold text-white bg-amber-500 rounded-full shadow-md transition-all hover:bg-amber-600"
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

export default PositionQuestionPage;
