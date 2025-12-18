import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTokenExpiredStore } from "@/stores/tokenExpiredStore";
import { useAuthStore } from "@/stores/authStore";

const TokenExpiredModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTokenExpired = useTokenExpiredStore((state) => state.isTokenExpired);
  const hideTokenExpiredModal = useTokenExpiredStore((state) => state.hideTokenExpiredModal);
  const logout = useAuthStore((state) => state.logout);

  // 로그인 페이지나 회원가입 페이지에서는 모달을 표시하지 않음
  const isAuthPage = location.pathname === "/login" || 
                     location.pathname === "/signup" || 
                     location.pathname === "/admin/login" ||
                     location.pathname.startsWith("/find-");

  // 로그인 페이지로 이동했을 때 모달 자동으로 닫기
  useEffect(() => {
    if (isAuthPage && isTokenExpired) {
      hideTokenExpiredModal();
    }
  }, [isAuthPage, isTokenExpired, hideTokenExpiredModal]);

  const handleConfirm = async () => {
    hideTokenExpiredModal();
    await logout();
    navigate("/login");
  };

  // 로그인 관련 페이지에서는 모달을 표시하지 않음
  if (!isTokenExpired || isAuthPage) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/50 animate-fade-in">
      <div className="mx-4 w-full max-w-sm">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
          {/* 아이콘과 제목 */}
          <div className="mb-4 text-center">
            <div className="inline-flex justify-center items-center mb-3 w-12 h-12 bg-red-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">세션이 만료되었습니다</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              토큰이 만료되었거나 유효하지 않습니다.{'\n'}
              다시 로그인해주세요.
            </p>
          </div>

          {/* 버튼 */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiredModal;


