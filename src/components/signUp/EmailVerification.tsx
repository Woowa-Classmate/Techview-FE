import { useState, useEffect } from "react";
import InputBox from "../input/InputBox";
import SuccessModal from "../modal/SuccessModal";
import { apiClient } from "@/api/client";

interface EmailVerificationProps {
  email: string;
  setEmail: (value: string) => void;
  onVerified?: () => void;
}

const EmailVerification = ({ email, setEmail, onVerified }: EmailVerificationProps) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [inputCode, setInputCode] = useState(""); // 사용자가 입력한 코드
  const [isVerified, setIsVerified] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMsg, setModalMsg] = useState("");

  // 타이머
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isCodeSent && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isCodeSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 이메일 형식 검사
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 중복확인
  const handleEmailCheck = async () => {
    if (!email) {
      setModalType("error");
      setModalMsg("이메일을 입력해주세요.");
      setShowSuccessModal(true);
      return;
    }

    if (!validateEmailFormat(email)) {
      setModalType("error");
      setModalMsg("올바른 이메일 형식이 아닙니다.");
      setShowSuccessModal(true);
      return;
    }

    try {
      const res = await apiClient.get("/auth/idCheck", {
        params: { memberId: email },
        headers: { Authorization: "" } //토큰 제거
      });

      const available = res.data.resultData === true;
      setIsAvailable(available);

      if (!available) {
        setModalType("error");
        setModalMsg("이미 사용 중인 이메일입니다.");
        setShowSuccessModal(true);
        setIsCodeSent(false);
        setTimeLeft(0);
        return;
      }

      handleSendCode(true);

    } catch (err) {
      console.error(err);
      setModalType("error");
      setModalMsg("이메일 확인 중 오류가 발생했습니다.");
      setShowSuccessModal(true);
    }
  };
  
  // 인증번호 전송
  const handleSendCode = async (forceSend = false) => {
    if (!forceSend && isAvailable !== true) {
      return alert("먼저 사용 가능한 이메일을 확인해주세요.");
    }

    try {
      await apiClient.post("/auth/send-verification",
        { email: email },
        { headers: { Authorization: "" } }  // 수정
      );

      setModalType("success");
      setModalMsg("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      setShowSuccessModal(true);

      // 기존 타이머 로직 유지
      setIsCodeSent(true);
      setTimeLeft(180);
      setIsVerified(false);
      setInputCode("");

    } catch (err) {
      console.error(err);
      setModalType("error");
      setModalMsg("인증번호 발송 실패. 다시 시도해주세요.");
      setShowSuccessModal(true);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!inputCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    if (timeLeft <= 0) {
      alert("인증 시간이 만료되었습니다. 다시 요청해주세요.");
      setIsCodeSent(false);
      setInputCode("");
      return;
    }

    try {
      const res = await apiClient.post("/auth/verify-email", 
        { email: email, code: inputCode },
        { headers: { Authorization: "" } }   // 수정
      );

      if (res.data.resultData === true) {
        setModalType("success");
        setModalMsg("이메일 인증이 완료되었습니다!");
        setShowSuccessModal(true);

        setIsVerified(true);
        setIsCodeSent(false);
        setTimeLeft(0);
        onVerified?.();

      } else {
        alert("인증번호가 일치하지 않습니다.");
      }

    } catch (err) {
      console.error(err);
      alert("인증 실패. 다시 시도해주세요.");
    }
  };

  return (
    <div className="space-y-[1.6rem]">
      {/* 이메일 입력 */}
      <div>
        <label className="block text-[1.4rem] font-bold text-gray-700 mb-[0.8rem]">
          아이디
        </label>
        <div className="flex gap-[1rem] items-start">
          <div className="relative flex-1">
            <InputBox
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              borderColor={
                isAvailable === false
                  ? "border-red-400"
                  : isAvailable === true
                  ? "border-blue-400"
                  : "border-gray-300"
              }
            />
            {isAvailable === false && (
              <p className="text-[1rem] text-red-500 mt-[0.4rem]">
                사용 중인 아이디가 있습니다.
              </p>
            )}
            {isAvailable === true && (
              <p className="text-[1rem] text-blue-500 mt-[0.4rem]">
                사용 가능한 아이디입니다. 인증번호를 입력해주세요.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleEmailCheck}
            className="px-[1rem] py-[0.8rem] border rounded-lg text-[1rem] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            인증하기
          </button>
        </div>
      </div>

      {/* 인증번호 입력 - 이메일 인증 후에만 표시 */}
      {isAvailable === true && (
        <div className="mt-[1rem]">
          <label className="block text-[1.4rem] font-bold text-gray-700 mb-[0.8rem]">
            인증번호
          </label>
          <div className="flex gap-[1rem] items-center">
            <div className="relative flex-1">
              <InputBox
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="인증번호를 입력해주세요"
              />
              {isCodeSent && timeLeft > 0 && (
                <span className="absolute right-[1rem] top-1/2 -translate-y-1/2 text-red-500 text-[1.2rem]">
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              className={`px-[1rem] py-[0.8rem] border rounded-lg text-[1rem] font-medium transition ${
                isVerified
                  ? "text-white bg-gray-500 border-gray-500"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {isVerified ? "인증 완료" : "확인하기"}
            </button>
          </div>

          {/* 재전송 버튼 - 인증번호 입력창 아래에 배치 */}
          <div className="mt-[0.8rem] text-left">
            <div className="flex gap-2 items-center">
              <span className="text-[1rem] text-gray-600">
                ⚠️ 이메일을 받지 못하셨나요?
              </span>
              <button
                type="button"
                onClick={() => handleSendCode()}
                className={`text-[1rem] font-medium underline transition ${
                  isCodeSent
                    ? "text-gray-800 hover:text-gray-500"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                이메일 재전송하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인증 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        title={modalType === 'success' ? "인증 완료!" : "이메일을 입력해주세요"}
        message={modalMsg}
        confirmText="확인"
        onConfirm={() => setShowSuccessModal(false)}
      />
    </div>
    
  );
};

export default EmailVerification;
