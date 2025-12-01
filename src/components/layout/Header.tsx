import { Link } from "react-router-dom";
import { useState } from "react";
import techviewLogo from "../../assets/logo/techview_logo.png";

const Header = () => {
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [selectedTechArea, setSelectedTechArea] = useState<
    "frontend" | "backend" | "mobile" | "devops"
  >("frontend");

  const techStacks: Record<typeof selectedTechArea, string[]> = {
    frontend: [
      "React",
      "Vue",
      "Angular",
      "Svelte",
      "Next.js",
      "Nuxt.js",
      "TypeScript"
    ],
    backend: [
      "Node.js",
      "Express",
      "NestJS",
      "Spring",
      "Spring Boot",
      "Django",
      "FastAPI",
      "Laravel",
      "Go",
      "Gin",
    ],
    mobile: [
      "Android (Kotlin)",
      "iOS (Swift)",
      "React Native",
      "Flutter",
      "KMP",
    ],
    devops: [
      "Docker",
      "Kubernetes",
      "AWS",
      "GCP",
      "Azure",
      "Jenkins",
      "GitHub Actions",
      "GitLab CI",
      "Terraform",
      "Helm",
      "Ansible",
      "Chef",
      "OpenStack",
      "Prometheus",
      "Grafana",
      "ELK Stack",
    ],
  };

  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((item) => item !== stack) : [...prev, stack],
    );
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* 로고 */}
          <Link to="/" className="flex items-center">
            <img 
              src={techviewLogo} 
              alt="TECHVIEW" 
              className="h-6 object-contain"
            />
          </Link>

          {/* 네비게이션 메뉴 + 검색 */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <nav className="hidden md:flex items-center gap-4">
              {/* Position Select */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPositionOpen((prev) => !prev);
                    setIsTechOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900 transition bg-white"
                >
                  Position Select
                </button>
                {isPositionOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg text-xs text-gray-700 z-20">
                    {["Frontend", "Backend", "Android", "iOS", "DevOps"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tech Select */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsTechOpen((prev) => !prev);
                    setIsPositionOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:border-gray-500 hover:text-gray-900 transition bg-white"
                >
                  Tech Select
                </button>
                {isTechOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg text-xs text-gray-700 z-20 p-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-1 min-w-24 border-r pr-3">
                        {[
                          { key: "frontend", label: "Frontend" },
                          { key: "backend", label: "Backend" },
                          { key: "mobile", label: "Mobile" },
                          { key: "devops", label: "DevOps" },
                        ].map((area) => (
                          <button
                            key={area.key}
                            type="button"
                            onClick={() => setSelectedTechArea(area.key as typeof selectedTechArea)}
                            className={`text-left px-2 py-1 rounded ${
                              selectedTechArea === area.key
                                ? "bg-gray-900 text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {area.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex-1 pl-1 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">
                          Stack
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {techStacks[selectedTechArea].map((stack) => {
                            const active = selectedStacks.includes(stack);
                            return (
                              <button
                                key={stack}
                                type="button"
                                onClick={() => toggleStack(stack)}
                                className={`px-2 py-0.5 rounded-full border text-[11px] transition ${
                                  active
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {stack}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log("Selected tech stacks:", selectedStacks);
                            setIsTechOpen(false);
                          }}
                          className="self-end mt-1 px-3 py-1 rounded-full bg-gray-900 text-white text-[11px] font-medium hover:bg-gray-800 transition"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* About */}
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition"
              >
                About
              </Link>
            </nav>

            {/* 검색창 */}
            <div className="hidden sm:flex items-center">
              <input
                type="text"
                placeholder="Search"
                className="w-40 md:w-56 px-3 py-1.5 border border-gray-300 rounded-full text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
              />
            </div>
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
    </header>
  );
};

export default Header;

