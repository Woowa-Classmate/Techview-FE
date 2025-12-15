import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InputBox from "@/components/input/InputBox";
import DefaultButton from "@/components/button/DefaultButton";
import { useAuth } from "@/contexts/AuthContext";
import * as authApi from "@/api/auth";
import { isValidPassword } from "@/utils/validation";

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"temp" | "reset">("temp"); // temp: 임시 비밀번호 발급, reset: 비밀번호 변경

  // 임시 비밀번호 발급 (로그인된 사용자)
  const handleGenerateTempPassword = async () => {
    if (!isAuthenticated) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.generateTemporaryPassword();
      setSuccess(`임시 비밀번호가 발급되었습니다: ${response.data}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "임시 비밀번호 발급에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경
  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword.trim() || !newPassword.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError("비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== newPasswordCheck) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        currentPassword,
        newPassword,
      });
      setSuccess("비밀번호가 변경되었습니다.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm">
          {/* 제목 */}
          <h1 className="text-2xl font-medium text-gray-800 mb-9 text-center">
            비밀번호 관리
          </h1>

          {/* 모드 선택 */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setMode("temp")}
              className={`px-4 py-2 font-medium transition ${
                mode === "temp"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              임시 비밀번호 발급
            </button>
            <button
              onClick={() => setMode("reset")}
              className={`px-4 py-2 font-medium transition ${
                mode === "reset"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              비밀번호 변경
            </button>
          </div>

          {/* 폼 */}
          <div className="space-y-4">
            {mode === "temp" ? (
              <>
                {/* 임시 비밀번호 발급 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    로그인된 사용자에게 임시 비밀번호를 발급합니다.
                  </p>
                </div>

                {!isAuthenticated && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      로그인이 필요합니다. 먼저 로그인해주세요.
                    </p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">발급 완료</p>
                    <p className="text-sm text-green-700 break-all">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <DefaultButton 
                    text={isLoading ? "발급 중..." : "임시 비밀번호 발급"}
                    onClick={handleGenerateTempPassword}
                    disabled={isLoading || !isAuthenticated}
                  />
                </div>
              </>
            ) : (
              <>
                {/* 비밀번호 변경 */}
                <div>
                  <label className="block mb-1 font-medium text-xs text-gray-800">현재 비밀번호</label>
                  <InputBox
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력해 주세요"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-xs text-gray-800">새 비밀번호</label>
                  <InputBox
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력해 주세요 (최소 8자, 영문/숫자/특수문자 포함)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-xs text-gray-800">새 비밀번호 확인</label>
                  <InputBox
                    type="password"
                    value={newPasswordCheck}
                    onChange={(e) => setNewPasswordCheck(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력해 주세요"
                    className="w-full"
                    isError={newPasswordCheck !== "" && newPasswordCheck !== newPassword}
                  />
                </div>

                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="pt-4">
                  <DefaultButton 
                    text={isLoading ? "변경 중..." : "비밀번호 변경"}
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  />
                </div>
              </>
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

export default FindPasswordPage;

