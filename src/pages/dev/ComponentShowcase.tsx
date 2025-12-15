import { useState } from "react";
import DefaultButton from "@/components/button/DefaultButton";
import CheckButton from "@/components/button/CheckButton";
import IconButton from "@/components/button/IconButton";
import ToggleSwitchBtn from "@/components/button/ToggleSwitchBtn";
import BottomButtonWrapper from "@/components/button/BottomButtonWrapper";
import InputBox from "@/components/input/InputBox";
import SubText from "@/components/text/SubText";
import Title1 from "@/components/title/Title1";
import Title2 from "@/components/title/Title2";
import LoginForm from "@/components/login/LoginForm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ComponentShowcase = () => {
  const [checkButtonChecked, setCheckButtonChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8 pb-32">
        <div className="mx-auto space-y-12 max-w-4xl">
        <div className="mb-8 text-center">
          <Title1 text="컴포넌트 쇼케이스" />
          <SubText text="프로젝트에서 사용하는 모든 컴포넌트를 확인할 수 있습니다." className="mt-4" />
        </div>

        {/* Title 컴포넌트 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Title 컴포넌트</h2>
          <div className="space-y-4">
            <Title1 text="Title1 컴포넌트 예시" />
            <Title2 text="Title2 컴포넌트 예시" />
          </div>
        </section>

        {/* Text 컴포넌트 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Text 컴포넌트</h2>
          <SubText text="SubText 컴포넌트 예시입니다. 회색 텍스트로 표시됩니다." />
        </section>

        {/* Button 컴포넌트 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Button 컴포넌트</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">DefaultButton</h3>
              <div className="space-y-2">
                <DefaultButton text="기본 버튼" onClick={() => alert("클릭됨!")} />
                <DefaultButton text="비활성 버튼" disabled />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">CheckButton</h3>
              <div className="flex gap-4 items-center">
                <CheckButton 
                  checked={checkButtonChecked} 
                  onChange={setCheckButtonChecked}
                />
                <span>체크 상태: {checkButtonChecked ? "체크됨" : "체크 안됨"}</span>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">IconButton</h3>
              <IconButton 
                src="https://via.placeholder.com/40" 
                alt="아이콘" 
                width={40}
                height={40}
                onClick={() => alert("아이콘 클릭됨!")}
              />
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">ToggleSwitchBtn</h3>
              <ToggleSwitchBtn 
                label="알림 설정" 
                checked={toggleChecked} 
                onChange={setToggleChecked}
              />
            </div>
          </div>
        </section>

        {/* Input 컴포넌트 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Input 컴포넌트</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">InputBox</h3>
              <InputBox 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="입력하세요"
              />
              <p className="mt-2 text-sm text-gray-500">입력값: {inputValue}</p>
            </div>
            <div>
              <InputBox 
                placeholder="에러 상태" 
                isError={true}
              />
            </div>
            <div>
              <InputBox 
                placeholder="비활성 상태" 
                disabled
              />
            </div>
            <div>
              <InputBox 
                type="password"
                placeholder="비밀번호 입력"
              />
            </div>
          </div>
        </section>

        {/* Login 컴포넌트 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Login 컴포넌트</h2>
          <LoginForm />
        </section>

        {/* SignUp 컴포넌트 - API/모달 의존성으로 인해 주석 처리 */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">SignUp 컴포넌트</h2>
          <div className="py-8 text-center text-gray-500">
            <p>SignUp 컴포넌트들은 API 및 모달 컴포넌트 의존성이 있어</p>
            <p>실제 페이지에서 확인해주세요.</p>
            <div className="mt-4 space-y-2 text-sm text-left">
              <p>• EmailVerification - 이메일 인증 컴포넌트</p>
              <p>• PasswordFields - 비밀번호 입력 컴포넌트</p>
              <p>• BirthInput - 생년월일 입력 컴포넌트</p>
              <p>• AgreementForm - 약관 동의 컴포넌트</p>
            </div>
          </div>
        </section>
      </div>

      {/* BottomButtonWrapper 예시 */}
      <BottomButtonWrapper>
        <DefaultButton text="하단 고정 버튼" onClick={() => alert("하단 버튼 클릭!")} />
      </BottomButtonWrapper>
      </main>

      <Footer />
    </div>
  );
};

export default ComponentShowcase;

