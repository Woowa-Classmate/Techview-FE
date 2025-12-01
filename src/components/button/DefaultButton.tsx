interface DefaultButtonProps {
  text: string;               // 버튼 문구
  onClick?: () => void;       // 클릭 이벤트
  disabled?: boolean;         // 비활성 상태
  className?: string;         // 추가 커스텀 스타일
}

const DefaultButton = ({
  text,
  onClick,
  disabled = false,
  className = "",
}: DefaultButtonProps) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        w-full max-w-[32rem]
        rounded-2xl py-5       
        text-center text-white text-lg font-semibold
        transition-all duration-200
        ${disabled 
          ? "bg-gray-300 cursor-not-allowed" 
          : "bg-[#8BC34A] hover:bg-[#7EB73F] active:scale-[0.98]"} 
        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default DefaultButton;