import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import InputBox from "../components/input/InputBox";
import DefaultButton from "../components/button/DefaultButton";

const LoginPage = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm">
          {/* 제목 */}
          <h1 className="text-2xl font-medium text-gray-800 mb-9 text-center">
            로그인
          </h1>

          {/* 로그인 폼 */}
          <div className="space-y-4">
            {/* 아이디 입력 */}
            <div>
              <InputBox
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="relative">
              <InputBox
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                className="w-full"
              />
              {/* 아이디/비밀번호 찾기 링크 */}
              <div className="absolute right-0 top-full mt-4 flex gap-3 text-xs text-gray-600">
                <Link to="/find-id" className="hover:text-gray-900 transition">
                  아이디 찾기
                </Link>
                <span>|</span>
                <Link to="/find-password" className="hover:text-gray-900 transition">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div className="pt-14">
              <DefaultButton 
                text="로그인" 
                onClick={() => {
                  console.log("로그인 시도", { id, password });
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;

