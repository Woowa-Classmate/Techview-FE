import { useState, useEffect } from "react";

interface BirthInputProps {
  onValidChange?: (isValid: boolean) => void;

  setBirthDate?: (value: string) => void;   // 추가
  setBirthBack?: (value: string) => void;   // 추가
}

const BirthInput = ({ onValidChange, setBirthDate, setBirthBack }: BirthInputProps) => {
  const [front, setFront] = useState(""); // YYMMDD
  const [back, setBack] = useState("");   // 1자리 (1~4)

  // 유효성 검사
  useEffect(() => {
    const isValidDate = validateDate(front);
    const isValidBack = /^[1-4]$/.test(back);
    onValidChange?.(isValidDate && isValidBack);

    setBirthDate?.(front);
    setBirthBack?.(back);

  }, [front, back, onValidChange, setBirthDate, setBirthBack]);

  const validateDate = (value: string) => {
    if (!/^\d{6}$/.test(value)) return false;
    //const year = parseInt(value.slice(0, 2), 10);
    const month = parseInt(value.slice(2, 4), 10);
    const day = parseInt(value.slice(4, 6), 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    return true;
  };

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setFront(v);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    setBack(v);
  };

  return (
    <div>
      <label className="block text-[1.4rem] font-bold text-gray-700 mb-[0.8rem]">
        생년월일
      </label>
      <div className="flex flex-nowrap items-center gap-[0.8rem] whitespace-nowrap min-w-fit">
        <input
          type="text"
          value={front}
          onChange={handleFrontChange}
          maxLength={6}
          className="w-[13rem] px-4 py-3 rounded-lg outline-none border border-gray-300 text-gray-800 bg-white focus:ring-green-300 transition text-center"
        />
        <span className="text-gray-600">-</span>
        <input
          type="text"
          value={back}
          onChange={handleBackChange}
          maxLength={1}
          placeholder=""
          className="w-[3.5rem] px-4 py-3 rounded-lg outline-none border border-gray-300 text-gray-800 bg-white focus:ring-green-300 transition text-center"
        />
        <span className="text-[2rem] tracking-[0.6rem] text-gray-400 select-none">
          • • • • • •
        </span>
      </div>
    </div>
  );
};

export default BirthInput;
