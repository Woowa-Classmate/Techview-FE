import React from "react";

interface ToggleSwiitchBtnProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const ToggleSwiitchBtn: React.FC<ToggleSwiitchBtnProps> = ({ label, checked, onChange, className }) => {
  return (
    <div className={`flex items-center justify-between max-w-[26rem] mx-auto ${className}`}>
      <span className="text-[1.4rem] font-semibold text-gray-700">{label}</span>
      <div className="flex flex-col items-center">
        <div
          className={`relative w-20 h-10 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
            checked ? "bg-green-300" : "bg-yellow-50"
          }`}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`w-8 h-8 bg-green-500 rounded-full shadow-md transform transition-transform duration-300 ${
              checked ? "translate-x-10" : "translate-x-0"
            }`}
          />
        </div>
        <div className="flex justify-between w-full text-xs mt-1 text-gray-400">
          <span>OFF</span>
          <span>ON</span>
        </div>
      </div>
    </div>
  );
};

export default ToggleSwiitchBtn;
