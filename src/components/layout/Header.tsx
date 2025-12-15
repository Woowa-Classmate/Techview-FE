import { Link } from "react-router-dom";
import techviewLogo from "../../assets/logo/techview_logo.png";

const Header = () => {

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
                to="/tech-stack"
                className="text-gray-700 hover:text-gray-900 text-[1rem] font-medium transition"
              >
                Tech Select
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

          
          {/* 검색창 + 로그인/회원가입 */}
          <div className="flex gap-6 items-center">
            {/* 검색창 */}
            <div className="hidden items-center sm:flex">
              <input
                type="text"
                placeholder="Search"
                className="w-40 md:w-56 px-3 py-1.5 border border-gray-300 rounded-full text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>
            {/* 로그인/회원가입 */}
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

