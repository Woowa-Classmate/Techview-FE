export default function BottomButtonWrapper({ 
  children, 
  paddingBottom = "pb-[4rem]" 
}: { 
  children: React.ReactNode;
  paddingBottom?: string;
}) {
  return (
    <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[32rem] bg-white py-10 ${paddingBottom}`}>
      {children}
    </div>
  );
}
