import type { ReactNode } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  onConfirm: () => void;
}

const SuccessModal = ({
  isOpen,
  title,
  message,
  confirmText = "확인",
  onConfirm,
}: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30 animate-fade-in">
      <div className="mx-4 w-full max-w-sm">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
          {/* 아이콘과 제목 */}
          <div className="mb-4 text-center">
            <div className="inline-flex justify-center items-center mb-3 w-12 h-12 bg-green-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* 버튼 */}
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;


