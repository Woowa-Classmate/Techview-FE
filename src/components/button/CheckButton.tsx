import { useState } from "react";

interface CheckButtonProps {
  defaultChecked?: boolean; // 비제어 초기값
  checked?: boolean; // 제어 값
  onChange?: (nextChecked: boolean) => void; // 제어 변경 핸들러
  size?: number; // px 단위
  disabled?: boolean;
}

const CheckButton = ({
  defaultChecked = false,
  checked: controlledChecked,
  onChange,
  size = 24,
  disabled = false,
}: CheckButtonProps) => {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);

  const isControlled = typeof controlledChecked === "boolean";
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    if (isControlled) {
      onChange?.(next);
    } else {
      setUncontrolledChecked(next);
      onChange?.(next);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`
        flex items-center justify-center
        rounded-full border transition-all duration-200
        ${checked ? "border-green-500 bg-green-500" : "border-gray-300 bg-white"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
      `}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={checked ? "white" : "gray"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[60%] h-[60%]"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
};

export default CheckButton;
