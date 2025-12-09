import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const BOOKMARK_KEY = "techview_bookmarks";

const PositionQuestionPage = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"selected" | "random">("selected");
  const [sortBy, setSortBy] = useState<string>("difficulty-low");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

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

  // 예시 질문 데이터
  const questions = [
    {
      id: 1,
      question: "em과 rem의 차이를 설명해 주세요.",
      difficulty: "Easy",
      tags: ["CSS", "웹"],
    },
    {
      id: 2,
      question: "inline과 inline-block의 차이점은 무엇인가요?",
      difficulty: "Easy",
      tags: ["CSS"],
    },
    {
      id: 3,
      question: "크로스 브라우징 이슈 경험이 있나요? 있다면 해결은 어떻게 하였나요?",
      difficulty: "Easy",
      tags: ["웹"],
    },
  ];

  const sortOptions = [
    { value: "difficulty-low", label: "난이도 낮은 순" },
    { value: "difficulty-high", label: "난이도 높은 순" },
    { value: "popularity", label: "인기 순" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="text-yellow-600 text-sm font-semibold mb-2">POSITION TEST</h2>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{positionName}</h1>
            <p className="text-gray-600 text-sm mb-1">
              질문을 선택해 질문에 대한 답을 준비해보세요.
            </p>
            <p className="text-gray-600 text-sm">
              동영상 녹화를 통해 면접 영상을 확인할 수 있습니다.
            </p>
          </div>

          {/* 탭 및 정렬 */}
          <div className="flex items-center justify-between mb-6">
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
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition flex items-center gap-2"
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
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
          <div className="space-y-4">
            {questions.map((q) => {
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-yellow-600 font-bold text-lg">Q.</span>
                      <p className="text-gray-800 text-base flex-1">{q.question}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        #{q.difficulty}
                      </span>
                      {q.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
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
        </div>
      </main>

      {/* 하단 고정 버튼 */}
      {selectedQuestionIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{selectedQuestionIds.length}개</span>의 질문이 선택되었습니다
              </div>
              <button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600 transition-all shadow-md"
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

