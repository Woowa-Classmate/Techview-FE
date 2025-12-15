import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InputBox from "@/components/input/InputBox";
import DefaultButton from "@/components/button/DefaultButton";

const FindIdPage = () => {
  const navigate = useNavigate();
  const [emailLocal, setEmailLocal] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSendEmail = () => {
    console.log("아이디 찾기 인증번호 발송:", emailLocal);
    // TODO: 실제 API 호출
    setIsEmailSent(true);
    alert(`${emailLocal}@jbnu.ac.kr로 인증번호를 발송했습니다.`);
  };

  const handleVerifyCode = () => {
    console.log("인증번호 확인:", verificationCode);
    // TODO: 실제 API 호출로 인증번호 확인
    if (verificationCode.length === 6) {
      setIsVerified(true);
      alert("인증이 완료되었습니다. 아이디 정보를 확인하세요.");
      // TODO: 인증 완료 후 아이디 표시 또는 다음 단계로 이동
    } else {
      alert("인증번호를 올바르게 입력해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm">
          {/* 제목 */}
          <h1 className="text-2xl font-medium text-gray-800 mb-9 text-center">
            아이디 찾기
          </h1>

          {/* 폼 */}
          <div className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <label className="block mb-1 font-medium text-xs text-gray-800">이메일</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <InputBox
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                    placeholder="이메일 아이디"
                    className="w-full"
                    disabled={isEmailSent}
                  />
                </div>
                <span className="text-gray-700 text-sm">@jbnu.ac.kr</span>
              </div>
            </div>

            {/* 메일 발송 버튼 */}
            {!isEmailSent && (
              <div className="pt-4">
                <DefaultButton 
                  text="메일 발송하기" 
                  onClick={handleSendEmail}
                />
              </div>
            )}

            {/* 인증번호 입력 */}
            {isEmailSent && !isVerified && (
              <div>
                <label className="block mb-1 font-medium text-xs text-gray-800">인증번호</label>
                <InputBox
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="인증번호 6자리 입력"
                  className="w-full"
                  maxLength={6}
                />
                <div className="pt-4">
                  <DefaultButton 
                    text="인증번호 확인" 
                    onClick={handleVerifyCode}
                  />
                </div>
              </div>
            )}

            {/* 인증 완료 후 아이디 표시 영역 */}
            {isVerified && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">인증이 완료되었습니다.</p>
                <p className="text-sm font-medium text-gray-800">
                  아이디: <span className="text-blue-600">user123</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  (실제로는 서버에서 조회한 아이디가 표시됩니다)
                </p>
              </div>
            )}

            {/* 로그인 페이지로 돌아가기 버튼 */}
            <div>
              <button
                onClick={() => navigate("/login")}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindIdPage;

