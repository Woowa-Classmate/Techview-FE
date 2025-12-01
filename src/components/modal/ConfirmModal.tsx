import type { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmTitle?: string;
  confirmColor?: string;
}

const ConfirmModal = ({
  isOpen,
  message,
  onCancel,
  onConfirm,
  confirmTitle = "확인",
  confirmColor = "#16A34A",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 animate-fade-in">
        <div className="mb-4 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-gray-700">
          {message}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ backgroundColor: confirmColor }}
            className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
          >
            {confirmTitle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


