import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InputBox from "@/components/input/InputBox";
import DefaultButton from "@/components/button/DefaultButton";
import { useAuth } from "@/contexts/AuthContext";
import { isValidEmail, isValidPassword } from "@/utils/validation";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    // 유효성 검사
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    if (password !== passwordCheck) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, name);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex flex-1 justify-center items-center px-4 py-10">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-xl font-medium text-center text-gray-800">
            회원가입
          </h1>

          <div className="space-y-5 text-sm text-gray-800">
            {/* 이메일 */}
            <div>
              <label className="block mb-2 text-sm font-medium">이메일</label>
              <InputBox
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="block mb-2 text-sm font-medium">이름</label>
              <InputBox
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block mb-2 text-sm font-medium">비밀번호</label>
              <InputBox
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요 (최소 8자, 영문/숫자/특수문자 포함)"
                className="w-full"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block mb-2 text-sm font-medium">비밀번호 확인</label>
              <InputBox
                type="password"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                placeholder="비밀번호를 다시 입력해 주세요"
                className="w-full"
                isError={passwordCheck !== "" && passwordCheck !== password}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="pt-4">
              <DefaultButton 
                text={isLoading ? "회원가입 중..." : "회원가입"} 
                onClick={handleSubmit}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUpPage;


