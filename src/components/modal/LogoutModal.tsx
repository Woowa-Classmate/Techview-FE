import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // 커스텀 확인 핸들러 (관리자 로그아웃 등)
  redirectPath?: string; // 로그아웃 후 이동할 경로
}

const LogoutModal = ({ isOpen, onClose, onConfirm, redirectPath = "/" }: LogoutModalProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleConfirm = async () => {
    if (onConfirm) {
      // 커스텀 핸들러가 있으면 사용
      onConfirm();
    } else {
      // 기본 로그아웃 처리
      await logout();
      navigate(redirectPath);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/50 animate-fade-in">
      <div className="mx-4 w-full max-w-sm">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-lg">
          {/* 아이콘과 제목 */}
          <div className="mb-4 text-center">
            <div className="inline-flex justify-center items-center mb-3 w-12 h-12 bg-amber-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">로그아웃</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              정말 로그아웃하시겠습니까?
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

