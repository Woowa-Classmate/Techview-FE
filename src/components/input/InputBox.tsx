interface InputBoxProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  borderColor?: string; // Tailwind 클래스명 ex) 'border-green-400'
  textColor?: string;   // Tailwind 클래스명 ex) 'text-gray-800'
  bgColor?: string;     // Tailwind 클래스명 ex) 'bg-white'
  focusColor?: string;  // Tailwind 클래스명 ex) 'focus:ring-green-300'
  disabled?: boolean;
  type? :string;  //비밀번호 마스킹용

  maxLength? : number,
  isReadOnly?: boolean,
  onClick?: React.MouseEventHandler<HTMLInputElement> | undefined,
  className?: string,
  
  isError?: boolean, // isError 에러 발생시 true
}

const InputBox = ({
  value,
  onChange,
  placeholder = "",
  borderColor = "border-gray-300",
  textColor = "text-gray-800",
  bgColor = "bg-white",
  focusColor = "focus:ring-green-300",
  disabled = false,
  type = "text",
  maxLength,
  isReadOnly = false,
  onClick,
  className,
  isError = false,
}: InputBoxProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onClick={onClick}
      readOnly={isReadOnly}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`
        h-[3rem] text-[1.2rem] font-medium
        flex-1 px-4 py-3 w-full rounded-lg border transition outline-none 
         ${textColor} ${bgColor} ${focusColor} ${isError ? 'border-[#FF0000]' : `${borderColor}`}
        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed  focus:border-[#00C42E]
        ${className}
      `}
    />
  );
};

export default InputBox;