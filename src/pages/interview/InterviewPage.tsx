import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getQuestionById, QuestionDetail } from "@/api/question";

interface Question {
  id: number;
  question: string;
  difficulty: string;
  tags: string[];
  timeLimit?: number; // 초 단위
}

// QuestionDetail을 Question으로 변환
const convertQuestionDetail = (detail: QuestionDetail): Question => {
  return {
    id: detail.id,
    question: detail.question,
    difficulty: detail.difficulty,
    tags: [...(detail.categories || []), ...(detail.skills || [])],
    timeLimit: 180, // 기본값 3분
  };
};

const InterviewPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const questionIds = searchParams.get("questions")?.split(",").map(Number) || [];
  const stacks = searchParams.get("stacks")?.split(",") || [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const questionTimerRef = useRef<number | null>(null);
  const recordingTimeIntervalRef = useRef<number | null>(null);

  // 질문 데이터 로드
  useEffect(() => {
    const loadQuestions = async () => {
      if (questionIds.length === 0) {
        setQuestions([]);
        return;
      }

      try {
        console.log("질문 로드 시작:", { questionIds, type, id });
        
        // 선택한 질문 ID들로 실제 API에서 질문 데이터 가져오기
        const questionPromises = questionIds.map((qId) => getQuestionById(qId));
        const questionDetails = await Promise.all(questionPromises);
        
        // QuestionDetail을 Question으로 변환
        const loadedQuestions: Question[] = questionDetails.map(convertQuestionDetail);
        
        console.log("로드된 질문:", loadedQuestions);
        setQuestions(loadedQuestions);
      } catch (error: any) {
        console.error("질문 로드 실패:", error);
        // 에러 발생 시 빈 배열 설정
        setQuestions([]);
        
        // 401 에러인 경우
        if (error?.response?.status === 401) {
          alert("질문을 조회하려면 로그인이 필요합니다.");
        } else {
          alert("질문을 불러오는데 실패했습니다.");
        }
      }
    };

    loadQuestions();
  }, [questionIds, type, id]);

  // 페이지 진입 시 자동으로 카운트다운 시작
  useEffect(() => {
    if (questions.length > 0 && !hasStarted && countdown === null) {
      console.log("카운트다운 시작!");
      setCountdown(5);
    }
  }, [questions.length, hasStarted]);

  // 비디오 스트림 초기화
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("비디오 초기화 실패:", error);
        alert("카메라 및 마이크 접근 권한이 필요합니다.");
      }
    };

    initializeVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 녹화 정지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimeIntervalRef.current) {
        clearInterval(recordingTimeIntervalRef.current);
      }
    }
  };

  // 녹화 결과 저장
  const saveRecording = async (blob: Blob, questionId: number) => {
    // 실제로는 서버에 업로드해야 함
    console.log(`질문 ${questionId} 녹화 저장:`, blob.size, "bytes");
    // TODO: 서버 API 호출
  };


  // 카운트다운이 0이 되었을 때 면접 시작
  useEffect(() => {
    if (countdown === 0 && !hasStarted) {
      setHasStarted(true);
      setCountdown(null);
      
      // 질문 타이머 시작
      if (questions[currentQuestionIndex]) {
        const timeLimit = questions[currentQuestionIndex].timeLimit || 180;
        setQuestionTime(timeLimit);

        questionTimerRef.current = window.setInterval(() => {
          setQuestionTime((prev) => {
            if (prev <= 1) {
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      // 녹화 시작
      if (streamRef.current) {
        try {
          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: "video/webm;codecs=vp8,opus",
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordingChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordingChunksRef.current, { type: "video/webm" });
            saveRecording(blob, questions[currentQuestionIndex].id);
            recordingChunksRef.current = [];
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(1000);
          setIsRecording(true);
          setRecordingTime(0);

          recordingTimeIntervalRef.current = window.setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        } catch (error) {
          console.error("녹화 시작 실패:", error);
        }
      }
    }
  }, [countdown, hasStarted, questions, currentQuestionIndex]);

  // 카운트다운 진행
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // 질문 타이머 종료
  const resetQuestionTimer = () => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    if (questions[currentQuestionIndex]) {
      setQuestionTime(questions[currentQuestionIndex].timeLimit || 180);
    }
  };

  // 시간 종료 처리
  const handleTimeUp = () => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    stopRecording();
    // 자동으로 다음 질문으로 이동
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  // 다음 질문으로 이동
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      stopRecording();
      resetQuestionTimer();
      
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsTransitioning(false);
        setRecordingTime(0);
      }, 500);
    } else {
      // 모든 질문 완료
      handleComplete();
    }
  };

  // 면접 완료
  const handleComplete = async () => {
    stopRecording();
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    // 세션 ID 생성
    const sessionId = `session_${Date.now()}`;
    
    // 선택한 질문들에 대한 면접 기록 생성
    const interviewRecords = questions.map((q) => {
      const duration = Math.floor(Math.random() * 60) + 10; // 10-70초 랜덤
      const isFailed = duration < 10;
      
      return {
        id: `${sessionId}_${q.id}`,
        sessionId: sessionId,
        type: type || "position",
        positionId: type === "position" ? id : undefined,
        stacks: type === "tech-stack" ? (id ? [id] : []) : undefined,
        questionIds: [q.id],
        question: q.question,
        date: new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: duration,
        status: isFailed ? ("failed" as const) : ("success" as const),
        failureReason: isFailed ? "10초 미만의 영상은 분석이 불가능합니다." : undefined,
      };
    });
    
    // localStorage에 저장
    localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(interviewRecords));
    
    // 면접 목록 페이지로 이동 (세션 ID 포함)
    navigate(`/interview/list?sessionId=${sessionId}`);
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 녹화 시간 포맷팅
  const formatRecordingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center text-white">
            <p className="text-lg">질문을 불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isTimeWarning = questionTime <= 30; // 30초 이하일 때 경고
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="flex flex-col min-h-screen text-white bg-gray-900">
      <Header />

      <main className="flex flex-col flex-1">
        {/* 상단 정보 바 */}
        <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
          <div className="flex justify-between items-center mx-auto max-w-7xl">
            <div>
              <h2 className="mb-1 text-sm text-gray-400">
                {type === "position" ? "POSITION INTERVIEW" : "TECH STACK INTERVIEW"}
              </h2>
              <p className="text-xl font-bold">
                질문 {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="flex gap-6 items-center">
              {/* 녹화 상태 */}
              {isRecording && (
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                  <span className="text-sm text-gray-400">{formatRecordingTime(recordingTime)}</span>
                </div>
              )}
              {/* 질문 타이머 */}
              <div className={`text-lg font-bold ${isTimeWarning ? "text-red-400" : ""}`}>
                {formatTime(questionTime)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 mx-auto w-full max-w-7xl">
          {/* 비디오 영역 */}
          <div className="flex flex-col flex-1 justify-center items-center p-8">
            <div className="overflow-hidden relative mb-6 w-full max-w-4xl bg-black rounded-lg aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="object-cover w-full h-full"
              />
              {/* 카운트다운 오버레이 */}
              {countdown !== null && (
                <div className="flex absolute inset-0 z-50 justify-center items-center bg-gray-900 bg-opacity-90">
                  <div className="relative">
                    <div className="flex justify-center items-center w-48 h-48 rounded-full border-8 border-yellow-400 animate-pulse">
                      <span className="text-8xl font-bold text-yellow-400">{countdown}</span>
                    </div>
                  </div>
                </div>
              )}
              {countdown !== null && (
                <div className="flex absolute inset-0 z-50 justify-center items-center bg-gray-900 bg-opacity-90">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="flex justify-center items-center mx-auto w-48 h-48 rounded-full border-8 border-purple-500 animate-pulse">
                        <span className="text-8xl font-bold text-purple-500">{countdown}</span>
                      </div>
                    </div>
                    <p className="mb-2 text-lg text-gray-300">
                      {countdown}초 뒤에 인터뷰가 바로 시작됩니다.
                    </p>
                    <p className="text-sm text-gray-500">
                      (웹캠이 있는 환경에서 이용해주세요)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 질문 카드 */}
            <div
              className={`w-full max-w-4xl bg-gray-800 rounded-xl p-8 transition-all duration-500 ${
                isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100"
              }`}
            >
              <div className="flex gap-4 items-start mb-4">
                <span className="text-2xl font-bold text-yellow-400">Q.</span>
                <p className="flex-1 text-xl">{currentQuestion.question}</p>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                <span
                  className={`px-3 py-1 text-xs rounded ${
                    currentQuestion.difficulty === "EASY"
                      ? "bg-green-100 text-green-700"
                      : currentQuestion.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  #{currentQuestion.difficulty === "EASY" ? "Easy" : currentQuestion.difficulty === "MEDIUM" ? "Medium" : "Hard"}
                </span>
                {currentQuestion.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs text-gray-300 bg-gray-700 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 컨트롤 패널 */}
          <div className="flex flex-col p-6 w-80 bg-gray-800 border-l border-gray-700">
            <div className="flex-1">
              <h3 className="mb-4 text-lg font-bold">면접 제어</h3>

              {/* 질문 네비게이션 */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium">질문 목록</h4>
                <div className="overflow-y-auto space-y-2 max-h-48">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (index !== currentQuestionIndex) {
                          setIsTransitioning(true);
                          stopRecording();
                          resetQuestionTimer();
                          setTimeout(() => {
                            setCurrentQuestionIndex(index);
                            setIsTransitioning(false);
                            setRecordingTime(0);
                          }, 500);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        index === currentQuestionIndex
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      질문 {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="space-y-2">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-3 w-full font-semibold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-lg transition-all hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600"
                >
                  다음 질문
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-4 py-3 w-full font-semibold bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all hover:from-green-500 hover:to-green-700"
                >
                  면접 완료
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InterviewPage;

