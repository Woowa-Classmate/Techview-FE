import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface InterviewRecord {
  id: string;
  sessionId: string; // 면접 세션 ID
  type: "position" | "tech-stack";
  positionId?: string;
  stacks?: string[];
  questionIds: number[];
  question: string;
  date: string;
  duration: number; // 초 단위
  thumbnail?: string;
  status: "success" | "failed";
  failureReason?: string;
}

const InterviewListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const sessionId = searchParams.get("sessionId");

  // localStorage에서 면접 세션 데이터 가져오기
  const getInterviewsFromStorage = (): InterviewRecord[] => {
    if (!sessionId) return [];
    const stored = localStorage.getItem(`interview_session_${sessionId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  };

  const [interviews, setInterviews] = useState<InterviewRecord[]>(() => {
    return getInterviewsFromStorage();
  });

  // sessionId가 변경되면 면접 목록 업데이트
  useEffect(() => {
    if (sessionId) {
      const storedInterviews = getInterviewsFromStorage();
      setInterviews(storedInterviews);
    } else {
      setInterviews([]);
    }
  }, [sessionId]);

  // 세션별로 그룹화 (같은 sessionId끼리)
  const sessionGroups = interviews.reduce((acc, interview) => {
    if (!acc[interview.sessionId]) {
      acc[interview.sessionId] = [];
    }
    acc[interview.sessionId].push(interview);
    return acc;
  }, {} as Record<string, InterviewRecord[]>);

  // 세션별로 날짜 추출 및 정렬
  const sessionList = Object.entries(sessionGroups).map(([sessionId, sessionInterviews]) => {
    const firstInterview = sessionInterviews[0];
    const dateParts = firstInterview.date.split(".");
    const dateKey = `${dateParts[0]}. ${dateParts[1]}. ${dateParts[2]}`;
    const sessionNumber = Object.keys(sessionGroups).indexOf(sessionId) + 1;
    return {
      sessionId,
      dateKey,
      sessionNumber,
      interviews: sessionInterviews,
    };
  }).sort((a, b) => {
    // 날짜와 세션 번호로 정렬
    const dateCompare = b.dateKey.localeCompare(a.dateKey);
    if (dateCompare !== 0) return dateCompare;
    return b.sessionNumber - a.sessionNumber;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectInterview = (interview: InterviewRecord) => {
    if (interview.status === "failed") return;

    const params = new URLSearchParams();
    params.set("type", interview.type);
    if (interview.positionId) {
      params.set("id", interview.positionId);
    }
    if (interview.stacks) {
      params.set("stacks", interview.stacks.join(","));
    }
    params.set("questions", interview.questionIds.join(","));
    navigate(`/interview/feedback?${params.toString()}`);
  };

  // const selectedInterview = interviews.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">실전 면접 분석 결과</h1>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button className="px-4 py-2 font-medium text-gray-900 border-b-2 border-gray-900">
              실전 면접
            </button>
            <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900">
              모의 면접
            </button>
          </div>

          {/* 면접 목록 */}
          {interviews.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg">면접 기록이 없습니다.</p>
              <p className="mt-2 text-sm">면접을 완료하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sessionList.map((session) => (
                <div key={session.sessionId}>
                  {/* 세션 헤더 */}
                  <div className="mb-4 text-lg font-semibold text-gray-900">
                    {session.dateKey}. {session.sessionNumber}
                  </div>

                  {/* 영상 그리드 */}
                  <div className="grid grid-cols-2 gap-6">
                    {session.interviews.map((interview) => (
                      <div
                        key={interview.id}
                        onClick={() => handleSelectInterview(interview)}
                        className={`group cursor-pointer transition ${
                          interview.status === "failed" ? "cursor-not-allowed" : ""
                        } ${selectedId === interview.id ? "ring-2 ring-blue-500" : ""}`}
                      >
                        {/* 썸네일 */}
                        <div className="overflow-hidden relative mb-3 bg-gray-900 rounded-lg aspect-video">
                          {interview.status === "failed" ? (
                            <div className="flex justify-center items-center w-full h-full bg-gray-800">
                              <div className="text-center">
                                <svg
                                  className="mx-auto mb-2 w-16 h-16 text-red-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                <p className="text-sm font-medium text-red-500">결과 분석 실패</p>
                                <p className="mt-1 text-xs text-gray-400">{interview.failureReason}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center items-center w-full h-full bg-gray-800 transition group-hover:bg-gray-700">
                              <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}

                          {/* 재생 시간 */}
                          <div className="absolute right-2 bottom-2 px-2 py-1 text-xs font-medium text-white bg-black bg-opacity-70 rounded">
                            {formatDuration(interview.duration)}
                          </div>
                        </div>

                        {/* 정보 */}
                        <div>
                          <div className="mb-1 text-xs text-gray-500">실전 면접</div>
                          {interview.status === "success" && (
                            <div className="mb-1 text-xs text-gray-500">{interview.date}</div>
                          )}
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            Q. {interview.question}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InterviewListPage;

