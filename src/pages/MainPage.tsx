import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="px-6 pt-24 pb-8 mx-auto max-w-7xl">
          {/* 메인 타이틀 */}
          <div className="mb-4">
          <h1 className="text-1xl font-air">
            IT 취준생을 위한 기술 모의면접 서비스<br />
            </h1>
            <h1 className="text-7xl font-bold text-gray-800 font-air">
              TECHVIEW
            </h1>
          </div>

          {/* 그라데이션 배너 */}
          <div className="w-full h-60 mb-8 rounded-lg bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-300 animate-gradient bg-[length:200%_100%]"></div>

          {/* 통계 */}
          <div className="mb-10 text-right text-gray-700">
            <p className="text-ls">
              <span>100</span>개의 모의면접 문제
            </p>
            <p className="text-ls">
              <span>500</span>명의 사용자와 함께
            </p>
          </div>

          {/* 안내 문구 */}
          <div className="text-sm text-center text-gray-600">
            <p>
              버그 발견 시{" "}
              <a href="#" className="text-blue-600 hover:underline">
                여기에 제보해주시면 감사하겠습니다.
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;

