import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AboutPage = () => {
  const [expandedPatches, setExpandedPatches] = useState<Record<string, boolean>>({
    "2025.01": true,
  });

  const togglePatch = (patchId: string) => {
    setExpandedPatches((prev) => ({
      ...prev,
      [patchId]: !prev[patchId],
    }));
  };
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* 헤더 */}
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900">ABOUT</h1>
            <div className="mx-auto space-y-3 max-w-3xl">
              <p className="text-xl font-medium text-gray-800">
                <strong className="text-yellow-600">TECHVIEW</strong> : 전북대학교 IT 취준생을 위한 기술 모의면접 서비스
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                Techview는 전북대학교 IT 취준생을 위한 기술 모의면접 서비스이며, 실전 면접 환경을 제공합니다.
                포지션별 및 기술 스택별 면접 질문을 선택하여 녹화 면접을 진행하고, AI 피드백을 받을 수 있습니다.
              </p>
            </div>
          </div>

          {/* How To Use */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">How To Use</h2>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Techview 사용 안내</h3>
                  <ul className="space-y-1.5 text-gray-600">
                    <li>• PC 환경에 최적화되어 있으며, 모바일에서는 정상적인 사용이 어려울 수 있습니다.</li>
                    <li>• 원활한 사용을 위해 PC 환경을 권장합니다.</li>
                    <li>• Google Chrome 브라우저 사용을 권장합니다.</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs italic text-gray-500">
                    Techview is optimized for PC environment. We recommend using Google Chrome browser.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="mb-12">
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Project Info</h2>
            <div className="flex flex-col gap-8 justify-center items-center mx-auto max-w-4xl md:flex-row">
              <div className="text-center">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Github</h3>
                <a 
                  href="https://github.com/Woowa-Classmate/Techview-FE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex gap-2 items-center px-4 py-2 text-sm text-white bg-gray-900 rounded-lg transition hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>Github 주소</span>
                </a>
              </div>
              <div className="text-center">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Contact</h3>
                <a 
                  href="mailto:techview@jbnu.ac.kr"
                  className="inline-flex gap-2 items-center px-4 py-2 text-sm text-white bg-gray-900 rounded-lg transition hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>techview@jbnu.ac.kr</span>
                </a>
              </div>
            </div>
          </div>

          {/* Patch Note */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Patch Note</h2>
            <div className="space-y-4">
              {/* 2025.01 */}
              <div>
                <button
                  onClick={() => togglePatch("2025.12")}
                  className="flex gap-3 items-center p-2 w-full text-left rounded-lg transition hover:bg-gray-50"
                >
                  <svg 
                    className={`flex-shrink-0 mt-1 w-5 h-5 text-yellow-600 transition-transform ${
                      expandedPatches["2025.12"] ? "rotate-90" : ""
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-800">2025.12</p>
                </button>
                {expandedPatches["2025.12"] && (
                  <div className="mt-2 ml-8 space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">기능 추가</h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• 초기 버전 릴리스</li>
                        <li>• 포지션별 면접 질문 선택 기능</li>
                        <li>• 기술 스택별 면접 질문 선택 기능</li>
                        <li>• 녹화 면접 기능</li>
                        <li>• AI 피드백 기능</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Development Team */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">TECHVIEW DEVELOPMENT TEAM</h2>
            <div className="overflow-hidden bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">TECHVIEW v1</h3>
                {/* 2025 팀 */}
                <div className="px-6 py-4 bg-gray-100 rounded-lg">
                  <div className="flex gap-6 items-center">
                    <span className="text-xl font-bold text-yellow-600">2025</span>
                    <span className="text-base font-medium text-gray-700">최홍석 · 허완</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

