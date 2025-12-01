const SubText = ({ text, className }: { text: string, className? : string}) => {
  return (
    <p className={`text-[#858585] text-xl leading-relaxed ${className}`}>
      {text}
    </p>
  );
};

export default SubText;
