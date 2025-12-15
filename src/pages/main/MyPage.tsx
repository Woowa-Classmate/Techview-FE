import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InputBox from "@/components/input/InputBox";
import DefaultButton from "@/components/button/DefaultButton";
import CheckButton from "@/components/button/CheckButton";
import * as userApi from "@/api/user";

interface TechStack {
  id: string;
  name: string;
  category: string;
  color: string;
}

const MyPage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [skills, setSkills] = useState<number[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 기술 스택 목록 (TechStackSelectPage에서 가져옴)
  const techStacks: TechStack[] = [
    // Frontend
    { id: "react", name: "React", category: "Frontend", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "vue", name: "Vue", category: "Frontend", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "angular", name: "Angular", category: "Frontend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "svelte", name: "Svelte", category: "Frontend", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "nextjs", name: "Next.js", category: "Frontend", color: "bg-gray-100 text-gray-700 border-gray-300" },
    { id: "nuxtjs", name: "Nuxt.js", category: "Frontend", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { id: "jQuery", name: "jQuery", category: "Frontend", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { id: "backbone.js", name: "backbone.js", category: "Frontend", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { id: "ember.js", name: "ember.js", category: "Frontend", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    // Backend
    { id: "nodejs", name: "Node.js", category: "Backend", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "python", name: "Python", category: "Backend", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { id: "java", name: "Java", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "spring", name: "Spring", category: "Backend", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "FastAPI", name: "FastAPI", category: "Backend", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "django", name: "Django", category: "Backend", color: "bg-gray-100 text-gray-700 border-gray-300" },
    { id: "express", name: "Express", category: "Backend", color: "bg-gray-100 text-gray-700 border-gray-300" },
    { id: "nestjs", name: "NestJS", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "go", name: "go", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "rust", name: "rust", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "php", name: "php", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "ruby", name: "ruby", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "kotlin", name: "kotlin", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "dart", name: "dart", category: "Backend", color: "bg-red-100 text-red-700 border-red-300" },
    // Database
    { id: "mysql", name: "MySQL", category: "Database", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "postgresql", name: "PostgreSQL", category: "Database", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "mongodb", name: "MongoDB", category: "Database", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "redis", name: "Redis", category: "Database", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "oracle", name: "Oracle", category: "Database", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "mariadb", name: "MariaDB", category: "Database", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "sqlite", name: "SQLite", category: "Database", color: "bg-red-100 text-red-700 border-red-300" },
    // Cloud & DevOps
    { id: "aws", name: "AWS", category: "Cloud", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "azure", name: "Azure", category: "Cloud", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "gcp", name: "GCP", category: "Cloud", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "ncp", name: "NCP", category: "Cloud", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "openstack", name: "openstack", category: "Cloud", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "vsphere", name: "vsphere", category: "Cloud", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "docker", name: "Docker", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "kubernetes", name: "Kubernetes", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "github-actions", name: "GitHub Actions", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "terraform", name: "Terraform", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "ansible", name: "Ansible", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "jenkins", name: "jenkins", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "gitlab", name: "gitlab", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "sonarqube", name: "sonarqube", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "prometheus", name: "prometheus", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "grafana", name: "grafana", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "elasticsearch", name: "elasticsearch", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "logstash", name: "logstash", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "kibana", name: "kibana", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "rabbitmq", name: "rabbitmq", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "kafka", name: "kafka", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "cosign", name: "cosign", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "argo-cd", name: "argo-cd", category: "DevOps", color: "bg-blue-100 text-blue-700 border-blue-300" },
    // Mobile
    { id: "react-native", name: "React Native", category: "Mobile", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "flutter", name: "Flutter", category: "Mobile", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "swift", name: "swift", category: "Mobile", color: "bg-red-100 text-red-700 border-red-300" },
    // Language
    { id: "typescript", name: "TypeScript", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "javascript", name: "javascript", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "html", name: "html", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "css", name: "css", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c", name: "c", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c++", name: "c++", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c#", name: "c#", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "scala", name: "scala", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "haskell", name: "haskell", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    // Tool
    { id: "git", name: "Git", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "jira", name: "jira", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "slack", name: "slack", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
  ];

  const stackCategories = ["Frontend", "Backend", "Database", "Cloud", "DevOps", "Mobile", "Language", "Tool"];

  // 기술 스택 ID를 숫자로 변환하는 함수 (임시 - 실제로는 API에서 받아온 ID를 사용해야 함)
  const stackIdToNumber = (stackId: string): number => {
    const index = techStacks.findIndex(s => s.id === stackId);
    return index >= 0 ? index + 1 : 0;
  };

  const numberToStackId = (num: number): string => {
    return techStacks[num - 1]?.id || "";
  };

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      // 로그인 상태 확인
      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }

      // Access Token 확인
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("Access Token이 없습니다. 로그인 페이지로 이동합니다.");
        navigate("/login");
        return;
      }
      
      setIsLoading(true);
      setMessage(null); // 이전 메시지 초기화
      
      try {
        const userInfo = await userApi.getMyInfo();
        setName(userInfo.name);
        setEmail(userInfo.email);

        const userSkills = await userApi.getMySkills();
        setSkills(userSkills);
        // 숫자 ID를 문자열 ID로 변환하여 선택 상태 설정
        setSelectedStacks(userSkills.map(num => numberToStackId(num)).filter(id => id !== ""));

        const userCategories = await userApi.getMyCategories();
        setCategories(userCategories);
      } catch (error: any) {
        console.error("사용자 정보 로드 실패:", error);
        console.error("에러 상세:", {
          status: error.response?.status,
          data: error.response?.data,
          token: localStorage.getItem("accessToken") ? "있음" : "없음",
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          // 403 에러는 인증 문제이므로 조용히 로그인 페이지로 이동
          // 메시지를 표시하지 않고 바로 이동
          navigate("/login");
        } else {
          setMessage({ type: "error", text: error.response?.data?.message || "정보를 불러오는데 실패했습니다." });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [user, isAuthenticated, navigate]);

  // 이름 수정
  const handleUpdateName = async () => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "이름을 입력해주세요." });
      return;
    }

    setIsSaving(true);
    try {
      await userApi.updateMyInfo({ name });
      setIsEditingName(false);
      
      // AuthContext의 사용자 정보 갱신
      await refreshUser();
      
      setMessage({ type: "success", text: "이름이 수정되었습니다." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "이름 수정에 실패했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  // 기술스택 토글
  const handleToggleStack = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId)
        ? prev.filter((id) => id !== stackId)
        : [...prev, stackId]
    );
  };

  // 기술스택 저장
  const handleSaveSkills = async () => {
    setIsSaving(true);
    try {
      // 선택된 스택 ID를 숫자 배열로 변환
      const skillNumbers = selectedStacks.map(stackId => stackIdToNumber(stackId)).filter(num => num > 0);
      await userApi.updateMySkills({ skills: skillNumbers });
      setSkills(skillNumbers);
      setMessage({ type: "success", text: "기술스택이 저장되었습니다." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "기술스택 저장에 실패했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  const getStacksByCategory = (category: string) => {
    return techStacks.filter((stack) => stack.category === category);
  };

  // 관심 분야 수정
  const handleUpdateCategories = async (newCategories: number[]) => {
    setIsSaving(true);
    try {
      await userApi.updateMyCategories({ categories: newCategories });
      setCategories(newCategories);
      setMessage({ type: "success", text: "관심 분야가 저장되었습니다." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "관심 분야 저장에 실패했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="inline-block mb-4 w-12 h-12 rounded-full border-b-2 border-gray-600 animate-spin"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex flex-1 px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold text-gray-900">마이페이지</h1>

          {/* 메시지 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === "success" 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* 사용자 정보 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">사용자 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">이름</label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <InputBox
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력해주세요"
                        className="flex-1"
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isSaving ? "저장 중..." : "저장"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setName(user?.name || "");
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{name || "-"}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">이메일</label>
                  <div className="p-3 text-gray-900 bg-gray-50 rounded-lg">
                    {email || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 기술스택 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">기술스택</h2>
              <p className="mb-4 text-sm text-gray-600">
                관심 있는 기술 스택을 선택해주세요 ({selectedStacks.length}개 선택됨)
              </p>
              
              {/* 카테고리별 기술 스택 */}
              <div className="mb-4 space-y-4">
                {stackCategories.map((category) => {
                  const stacks = getStacksByCategory(category);
                  if (stacks.length === 0) return null;

                  return (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="mb-3 text-sm font-semibold text-gray-800">{category}</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {stacks.map((stack) => {
                          const isSelected = selectedStacks.includes(stack.id);
                          return (
                            <button
                              key={stack.id}
                              onClick={() => handleToggleStack(stack.id)}
                              className={`
                                flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-sm
                                ${isSelected
                                  ? `${stack.color} border-current shadow-md`
                                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }
                              `}
                            >
                              <CheckButton
                                checked={isSelected}
                                onChange={() => handleToggleStack(stack.id)}
                                size={16}
                              />
                              <span className={`font-medium ${isSelected ? "font-semibold" : "text-gray-700"}`}>
                                {stack.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSkills}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>

            {/* 관심 분야 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">관심 분야</h2>
              <div className="p-4 mb-4 bg-gray-50 rounded-lg">
                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((categoryId) => (
                      <span
                        key={categoryId}
                        className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full"
                      >
                        분야 ID: {categoryId}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">설정된 관심 분야가 없습니다.</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                관심 분야는 추후 설정 기능이 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
