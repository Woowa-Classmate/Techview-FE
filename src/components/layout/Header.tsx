import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import techviewLogo from "../../assets/logo/techview_logo.png";

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  // 페이지 로드 시 user 정보 확인 및 갱신
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && (!user || !user.name)) {
      // 토큰이 있지만 user 정보가 없거나 name이 없으면 갱신 시도
      refreshUser();
    }
  }, [user, refreshUser]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 mx-auto max-w-7xl">
        <div className="flex gap-6 justify-between items-center">
          {/* 로고 + 네비게이션 메뉴 */}
          <div className="flex items-center gap-17">
            <Link to="/" className="flex items-center">
              <img 
                src={techviewLogo} 
                alt="TECHVIEW" 
                className="object-contain h-6"
              />
            </Link>
            <nav className="hidden gap-6 items-center md:flex">
              <Link
                to="/position"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                Position Select
              </Link>
              <Link
                to="/board"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                Community
              </Link>
              <a
                href="https://jbnu.copykiller.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                CopyKiller
              </a>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                About
              </Link>
            </nav>
            
          </div>

          
          {/* 로그인/회원가입 */}
          <div className="flex gap-6 items-center">
            {/* 로그인 상태에 따른 UI */}
            {isAuthenticated && user ? (
              <div className="flex gap-4 items-center text-sm">
                <span className="font-medium text-gray-700">
                  안녕하세요 {user.name}님
                </span>
                <Link
                  to="/mypage"
                  className="text-xs text-gray-600 hover:text-gray-900 transition"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-600 hover:text-gray-900 transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center text-sm">
                <Link 
                  to="/login" 
                  className="font-medium text-gray-700 transition hover:text-gray-900"
                >
                  로그인
                </Link>
                <span className="text-gray-500">또는</span>
                <Link 
                  to="/signup" 
                  className="font-medium text-gray-700 transition hover:text-gray-900"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

