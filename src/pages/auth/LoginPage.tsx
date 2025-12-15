import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InputBox from "@/components/input/InputBox";
import DefaultButton from "@/components/button/DefaultButton";
import SuccessModal from "@/components/modal/SuccessModal";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex flex-1 justify-center items-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* 제목 */}
          <h1 className="mb-9 text-2xl font-medium text-center text-gray-800">
            로그인
          </h1>

          {/* 로그인 폼 */}
          <div className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <InputBox
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해 주세요"
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <InputBox
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {/* 비밀번호 찾기 링크 */}
              <div className="flex justify-end mt-4 text-xs text-gray-600">
                <Link to="/find-password" className="transition hover:text-gray-900">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div className="pt-4">
              <DefaultButton 
                text={isLoading ? "로그인 중..." : "로그인"}
                onClick={handleLogin}
                disabled={isLoading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 mt-4 text-xs text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* 로그인 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="로그인 성공"
        message={user ? `안녕하세요 ${user.name}님!` : "로그인에 성공했습니다."}
        confirmText="확인"
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default LoginPage;

