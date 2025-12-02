import { Link } from "react-router-dom";
import techviewLogo from "../../assets/logo/techview_logo.png";

const Header = () => {

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* 로고 + 네비게이션 메뉴 */}
          <div className="flex items-center gap-17">
            <Link to="/" className="flex items-center">
              <img 
                src={techviewLogo} 
                alt="TECHVIEW" 
                className="h-6 object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/position"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                Position Select
              </Link>
              <Link
                to="/tech"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                Tech Select
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                About
              </Link>
            </nav>
          </div>

          {/* 검색창 + 로그인/회원가입 */}
          <div className="flex items-center gap-6">
            {/* 검색창 */}
            <div className="hidden sm:flex items-center">
              <input
                type="text"
                placeholder="Search"
                className="w-40 md:w-56 px-3 py-1.5 border border-gray-300 rounded-full text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>
            {/* 로그인/회원가입 */}
            <div className="flex items-center gap-2 text-sm">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                로그인
              </Link>
              <span className="text-gray-500">또는</span>
              <Link 
                to="/signup" 
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

