import { useState, useEffect } from "react";

interface PasswordFieldsProps {
  onValidChange?: (isValid: boolean) => void; // 상위로 전달용
  onPasswordChange?: (pw: string) => void;  // 추가
}

const PasswordFields = ({ onValidChange, onPasswordChange }: PasswordFieldsProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // 비밀번호 변경 시 부모에게 값 전달
  useEffect(() => {
    onPasswordChange?.(password);
  }, [password]);

  // 비밀번호 일치 여부 감시
  useEffect(() => {
    if (!password && !confirmPassword) {
      setError("");
      onValidChange?.(false);
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      onValidChange?.(false);
    } else if (password && confirmPassword && password === confirmPassword) {
      setError("");
      onValidChange?.(true);
    } else {
      onValidChange?.(false);
    }
  }, [password, confirmPassword]);

  return (
    <div className="space-y-[2rem]">
      {/* 비밀번호 */}
      <div>
        <label className="block text-[1.4rem] font-bold text-gray-700 mb-[0.8rem]">
          비밀번호
        </label>
        <input
          type="password"
          placeholder="설정할 비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg outline-none border border-gray-300 text-gray-800 bg-white focus:ring-green-300 transition"
        />
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label className="block text-[1.4rem] font-bold text-gray-700 mb-[0.8rem]">
          비밀번호 확인
        </label>
        <input
          type="password"
          placeholder="설정할 비밀번호를 재입력해주세요"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg outline-none border ${error ? "border-red-400" : "border-gray-300"
            } text-gray-800 bg-white focus:ring-green-300 transition`}
        />
        {error && (
          <p className="text-red-500 text-[1.2rem] mt-[0.4rem]">{error}</p>
        )}
      </div>
    </div>
  );
};

export default PasswordFields;
