import { useEffect, useState } from "react";
import ConfirmModal from "../modal/ConfirmModal";
import CheckButton from "../button/CheckButton";

interface AgreementFormProps {
  onValidChange?: (isValid: boolean) => void;
}

const AgreementForm = ({ onValidChange }: AgreementFormProps) => {
  const [allChecked, setAllChecked] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,   // 회원약관 (필수)
    privacy: false, // 개인정보 처리방침 (필수)
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // 필수 2항목 체크 상태 부모로 전달
  useEffect(() => {
    const requiredAgreed = agreements.terms && agreements.privacy;
    onValidChange?.(requiredAgreed);
    setAllChecked(Object.values(agreements).every(Boolean));
  }, [agreements, onValidChange]);

  const handleAllCheck = () => {
    const next = !allChecked;
    setAllChecked(next);
    setAgreements({ terms: next, privacy: next });
  };

  const toggle = (key: keyof typeof agreements) => {
    console.log('Toggling:', key, 'current value:', agreements[key]);
    setAgreements(prev => {
      const newValue = { ...prev, [key]: !prev[key] };
      console.log('New agreements:', newValue);
      return newValue;
    });
  };

  return (
    <div className="w-[34rem] text-left flex flex-col gap-[2rem] text-[1.5rem] text-gray-700">
      {/* 전체 동의 */}
      <div className="flex justify-between items-center cursor-pointer" onClick={handleAllCheck}>
        <div className="flex items-center gap-[1rem]">
          <CheckButton
            checked={allChecked}
            onChange={handleAllCheck}
            size={20}
          />
          <span className={`font-bold text-[1.4rem] ${allChecked ? "text-green-600" : "text-gray-800"}`}>전체 동의</span>
        </div>
      </div>

      {/* 온라인서비스 회원약관 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[1rem]">
          <CheckButton
            checked={agreements.terms}
            onChange={(checked) => {
              console.log('Terms onChange:', checked);
              setAgreements(prev => ({ ...prev, terms: checked }));
            }}
            size={18}
          />
          <span className="cursor-pointer" onClick={() => toggle("terms")}>
            온라인서비스 회원약관 <span className="text-red-500">(필수)</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowTerms(true)}
          className="text-gray-400 text-[1.2rem] hover:text-green-600 transition"
        >
          보기 ›
        </button>
      </div>

      {/* 개인정보 취급방침 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[1rem]">
          <CheckButton
            checked={agreements.privacy}
            onChange={(checked) => {
              console.log('Privacy onChange:', checked);
              setAgreements(prev => ({ ...prev, privacy: checked }));
            }}
            size={18}
          />
          <span className="cursor-pointer" onClick={() => toggle("privacy")}>
            개인정보 취급방침 동의 <span className="text-red-500">(필수)</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="text-gray-400 text-[1.2rem] hover:text-green-600 transition"
        >
          보기 ›
        </button>
      </div>

      {/* 회원약관 모달 */}
      <ConfirmModal
        isOpen={showTerms}
        onCancel={() => setShowTerms(false)}
        onConfirm={() => setShowTerms(false)}
        message={
          <div className="max-h-[60vh] overflow-y-auto text-left text-gray-700 text-[0.95rem] leading-relaxed space-y-3">
            <h2 className="mb-2 text-lg font-bold">온라인서비스 회원약관</h2>
            <p>
              제 1 조(목 적)<br />
              이 약관은 주식회사 우리카드(이하 “카드사”라 함)가 온라인(인터넷,
              모바일)에서 제공하는 서비스의 이용조건 및 절차에 관한 기본 사항을
              정함을 목적으로 합니다.
            </p>
            <p>
              제 2 조(용어의 정의)<br />
              “온라인서비스”란 카드사가 유ㆍ무선 인터넷을 통하여 제공하는 정보
              제공 서비스 등을 말합니다. “회원”이란 카드사와 이용계약을 체결하고
              아이디를 부여받은 자를 의미합니다. 그 외의 조항들은 본 약관에
              따라 동일하게 적용됩니다.
            </p>
            <p>
              (중략)<br />
              <br />
              제 21 조(관할법원)<br />
              서비스 이용과 관련하여 분쟁이 발생할 경우, 카드사와 회원은
              성실히 협의하며, 협의로 해결되지 않는 경우 민사소송법상 관할법원에
              소를 제기할 수 있습니다.
            </p>
            <p>
              <strong>부칙(2022. 6. 20.)</strong>
              <br />
              이 약관은 2022년 6월 20일부터 시행합니다. 다만 제6조 제1항 단서는
              2022년 3월 29일부터 시행합니다.
            </p>
          </div>
        }
        confirmTitle="확인"
        confirmColor="#16A34A"
      />

      {/* 개인정보 모달 */}
      <ConfirmModal
        isOpen={showPrivacy}
        onCancel={() => setShowPrivacy(false)}
        onConfirm={() => setShowPrivacy(false)}
        message={
          <div className="max-h-[60vh] overflow-y-auto text-left text-gray-700 text-[0.95rem] leading-relaxed space-y-3">
            <h2 className="mb-2 text-lg font-bold">개인정보 취급방침 동의</h2>
            <p>
              귀하의 계약과 관련하여 귀사가 본인의 개인(신용)정보를 수집·이용하고자 하는 경우에는
              「신용정보의 이용 및 보호에 관한 법률」 제32조 및 제33조, 제34조,
              「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제22조,
              「개인정보보호법」 제15조 및 제22조, 제24조에 따라 본인의 동의를 얻어야 합니다.
            </p>
            <p>
              이에 본인은 귀사가 아래와 같이 본인의 개인(신용)정보를 수집·이용하는 것에 대하여 동의합니다.
              이 동의서는 계약의 갱신 등으로 변경되는 경우에도 유효합니다.
            </p>
            <h3 className="mt-2 font-semibold">1. 수집·이용 목적</h3>
            <p>
              회원제 서비스 이용에 따른 본인확인, 실명인증, 회원가입, 가맹점 정보 안내 등 서비스 제공.
            </p>
            <h3 className="mt-2 font-semibold">2. 수집 항목</h3>
            <p>
              가맹점번호, 사업자번호, 성명, 아이디, 비밀번호, 핸드폰번호, IP주소, 단말정보 등.
            </p>
            <h3 className="mt-2 font-semibold">3. 보유 및 이용 기간</h3>
            <p>
              개인정보는 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관될 수 있습니다.
            </p>
            <p className="font-medium text-red-600">
              ※ 귀하는 동의를 거부할 권리가 있으나, 동의하지 않을 경우 회원가입이 불가능할 수 있습니다.
            </p>
          </div>
        }
        confirmTitle="확인"
        confirmColor="#16A34A"
      />
    </div>
  );
};

export default AgreementForm;
