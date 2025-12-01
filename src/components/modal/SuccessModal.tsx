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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            {/* check icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;


