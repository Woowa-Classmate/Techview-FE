import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const FindIdPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm">
          {/* 제목 */}
          <h1 className="text-2xl font-medium text-gray-800 mb-9 text-center">
            아이디 찾기
          </h1>

          {/* 안내 메시지 */}
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-700 mb-4">
                아이디는 회원가입 시 사용한 이메일 주소입니다.
              </p>
              <p className="text-xs text-gray-500">
                아이디를 잊으셨다면 관리자에게 문의해주세요.
              </p>
            </div>

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

