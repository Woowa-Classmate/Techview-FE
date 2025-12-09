import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CheckButton from "../components/button/CheckButton";
import DefaultButton from "../components/button/DefaultButton";

interface TechStack {
  id: string;
  name: string;
  category: string;
  color: string;
}

const TechStackSelectPage = () => {
  const navigate = useNavigate();
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

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
    { id: "kotlin", name: "kotlin", category: "Mobile", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "swift", name: "swift", category: "Mobile", color: "bg-red-100 text-red-700 border-red-300" },
    { id: "dart", name: "dart", category: "Mobile", color: "bg-red-100 text-red-700 border-red-300" },

    
    // 기타
    { id: "typescript", name: "TypeScript", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "javascript", name: "javascript", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "html", name: "html", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "css", name: "css", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "python", name: "python", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c", name: "c", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c++", name: "c++", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "c#", name: "c#", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "go", name: "go", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "rust", name: "rust", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "php", name: "php", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "ruby", name: "ruby", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "kotlin", name: "kotlin", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "dart", name: "dart", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "scala", name: "scala", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "haskell", name: "haskell", category: "Language", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "git", name: "Git", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "jira", name: "jira", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "slack", name: "slack", category: "Tool", color: "bg-orange-100 text-orange-700 border-orange-300" },
  ];

  const categories = ["Frontend", "Backend", "Database", "Cloud", "DevOps", "Mobile", "Language", "Tool"];

  const handleToggleStack = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId)
        ? prev.filter((id) => id !== stackId)
        : [...prev, stackId]
    );
  };

  const handleNext = () => {
    if (selectedStacks.length === 0) return;
    const stacksParam = selectedStacks.join(",");
    navigate(`/tech-stack/questions?stacks=${stacksParam}`);
  };

  const getStacksByCategory = (category: string) => {
    return techStacks.filter((stack) => stack.category === category);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* 제목 */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              기술 스택을 선택해주세요
            </h1>
            <p className="text-gray-600 text-[0.9rem]">
              관심 있는 기술 스택을 선택하면 관련 질문을 확인할 수 있습니다
            </p>
            {selectedStacks.length > 0 && (
              <p className="mt-2 text-sm font-medium text-yellow-600">
                {selectedStacks.length}개의 기술 스택이 선택되었습니다
              </p>
            )}
          </div>

          {/* 카테고리별 기술 스택 */}
          <div className="space-y-8">
            {categories.map((category) => {
              const stacks = getStacksByCategory(category);
              if (stacks.length === 0) return null;

              return (
                <div key={category} className="p-6 bg-white rounded-xl shadow-sm">
                  <h2 className="mb-4 text-xl font-bold text-gray-800">{category}</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {stacks.map((stack) => {
                      const isSelected = selectedStacks.includes(stack.id);
                      return (
                        <button
                          key={stack.id}
                          onClick={() => handleToggleStack(stack.id)}
                          className={`
                            flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                            ${isSelected
                              ? "bg-green-100 text-green-700 border-green-300 shadow-md scale-[1.02]"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }
                          `}
                        >
                          <CheckButton
                            checked={isSelected}
                            onChange={() => handleToggleStack(stack.id)}
                            size={20}
                          />
                          <span className={`font-medium text-sm ${isSelected ? "font-semibold" : "text-gray-700"}`}>
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

          {/* 하단 버튼 */}
          <div className="flex justify-center mt-8">
            <div className="w-full max-w-md">
              <DefaultButton
                text="질문 보기"
                onClick={handleNext}
                disabled={selectedStacks.length === 0}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechStackSelectPage;

