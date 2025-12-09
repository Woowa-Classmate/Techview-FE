import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import InputBox from "../components/input/InputBox";
import DefaultButton from "../components/button/DefaultButton";

const positions = ["Frontend", "Backend", "Android", "iOS", "DevOps"] as const;
type Position = (typeof positions)[number];

const techStacks: Record<Position, string[]> = {
  Frontend: ["React", "Vue", "Angular", "Svelte", "Next.js", "TypeScript"],
  Backend: ["Node.js", "Spring", "Django", "FastAPI"],
  Android: ["Kotlin", "Java", "Compose"],
  iOS: ["SwiftUI", "UIKit"],
  DevOps: ["Docker", "Kubernetes", "AWS", "GitHub Actions"],
};

const departments = [
  "컴퓨터공학부",
  "IT 정보공학과",
  "컴퓨터인공지능학부",
] as const;

const SignUpPage = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [name, setName] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [department, setDepartment] = useState<(typeof departments)[number] | "">("");

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  const handleSubmit = () => {
    console.log("SignUp payload", {
      studentId,
      password,
      name,
      email: emailLocal ? `${emailLocal}@jbnu.ac.kr` : "",
      position,
      techStacks: selectedStacks,
      department,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex overflow-y-auto justify-center px-1 py-4">
        <div className="py-2 w-full max-w-md">
          <h1 className="mb-3 text-lg font-medium text-center text-gray-800">
            회원가입
          </h1>

          <div className="space-y-3 text-xs text-gray-800">
            {/* 학번(아이디) */}
            <div>
              <label className="block mb-1 text-xs font-medium">학번 (아이디)</label>
              <InputBox
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="학번을 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block mb-1 text-xs font-medium">비밀번호</label>
              <InputBox
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block mb-1 text-xs font-medium">비밀번호 확인</label>
              <InputBox
                type="password"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                placeholder="비밀번호를 다시 입력해 주세요"
                className="w-full"
                isError={passwordCheck !== "" && passwordCheck !== password}
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="block mb-1 text-xs font-medium">이름</label>
              <InputBox
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해 주세요"
                className="w-full"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block mb-1 text-xs font-medium">이메일</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <InputBox
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                    placeholder="이메일 아이디"
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-gray-700">@jbnu.ac.kr</span>
              </div>
            </div>

            {/* 포지션 */}
            <div>
              <label className="block mb-1 text-xs font-medium">본인의 포지션</label>
              <div className="flex flex-wrap gap-1.5">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`px-2 py-1 rounded-full border text-[0.7rem] transition ${
                      position === pos
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 기술 스택 */}
            <div>
              <label className="block mb-1 text-xs font-medium">본인의 기술 스택 (중복 선택 가능)</label>
              <div className="space-y-1">
                <p className="text-[0.6rem] text-gray-500">
                  포지션을 먼저 선택하면 추천 스택이 표시됩니다.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(position ? techStacks[position] : Object.values(techStacks).flat()).map(
                    (stack) => {
                      const active = selectedStacks.includes(stack);
                      return (
                        <button
                          key={stack}
                          type="button"
                          onClick={() => toggleStack(stack)}
                          className={`px-2 py-0.5 rounded-full border text-[0.7rem] transition ${
                            active
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {stack}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            {/* 학과 */}
            <div>
              <label className="block mb-1 text-xs font-medium">학과</label>
              <div className="flex flex-wrap gap-1.5">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartment(dept)}
                    className={`px-2 py-1 rounded-full border text-[0.7rem] transition ${
                      department === dept
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-1 pb-2">
              <DefaultButton text="회원가입" onClick={handleSubmit} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUpPage;


