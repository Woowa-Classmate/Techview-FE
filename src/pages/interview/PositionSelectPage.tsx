import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FEImage from "@/assets/position/FE.png";
import SEL_FEImage from "@/assets/position/SEL_FE.png";
import BEImage from "@/assets/position/BE.png";
import SEL_BEImage from "@/assets/position/SEL_BE.png";
import ANDImage from "@/assets/position/AND.png";
import SEL_ANDImage from "@/assets/position/SEL_AND.png";
import IOSImage from "@/assets/position/IOS.png";
import SEL_IOSImage from "@/assets/position/SEL_IOS.png";
import DEVImage from "@/assets/position/DEV.png";
import SEL_DEVImage from "@/assets/position/SEL_DEV.png";

const PositionSelectPage = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positions = [
    {
      id: "frontend",
      name: "Frontend",
      defaultImage: FEImage,
      selectedImage: SEL_FEImage,
    },
    {
      id: "backend",
      name: "Backend",
      defaultImage: BEImage,
      selectedImage: SEL_BEImage,
    },
    {
      id: "android",
      name: "Android",
      defaultImage: ANDImage,
      selectedImage: SEL_ANDImage,
    },
    {
      id: "ios",
      name: "iOS",
      defaultImage: IOSImage,
      selectedImage: SEL_IOSImage,
    },
    {
      id: "devops",
      name: "DevOps",
      defaultImage: DEVImage,
      selectedImage: SEL_DEVImage,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          {/* 제목 */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              원하는 포지션을 선택해주세요
            </h1>
            <p className="text-gray-600 text-[0.9rem]">
              직무별 더 자세한 문제를 확인할 수 있습니다
            </p>
          </div>

          {/* 포지션 카드 그리드 */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            {positions.map((position) => (
              <Link
                key={position.id}
                to={`/position/${position.id}`}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                onMouseEnter={() => setHoveredId(position.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="mb-4">
                  <img
                    src={hoveredId === position.id ? position.selectedImage : position.defaultImage}
                    alt={position.name}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{position.name}</h2>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PositionSelectPage;

