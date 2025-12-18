import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useNavigate } from 'react-router-dom'
import LogoutModal from '@/components/modal/LogoutModal'
import { useState } from 'react'

interface TopBarProps {
  onMenuClick: () => void
  title?: string
  titleIcon?: React.ComponentType<{ className?: string }>
  showActionButtons?: boolean
  onCreate?: () => void
  onExport?: () => void
  onRefresh?: () => void
  sidebarOpen?: boolean
}

export function TopBar({ onMenuClick, title, titleIcon: TitleIcon, showActionButtons = false, onCreate, onExport, onRefresh }: TopBarProps) {
  const logout = useAdminAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowLogoutModal(true)
  }

  const handleConfirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/admin/login')
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRefresh) {
      onRefresh()
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#1a1a1a]">
      <div className="flex gap-3 items-center">
        <button
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] p-2 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {title && (
          <div className="flex gap-2 items-center min-w-0">
            {TitleIcon ? (
              <TitleIcon className="shrink-0 w-5 h-5 text-gray-900 dark:text-white" />
            ) : (
              <ShoppingBag className="shrink-0 w-5 h-5 text-gray-900 dark:text-white" />
            )}
            <span className="text-base font-semibold text-gray-900 truncate dark:text-white">{title}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2 items-center">
        {showActionButtons && (
          <>
            {onCreate && (
              <button
                onClick={onCreate}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                CREATE
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                EXPORT
              </button>
            )}
          </>
        )}
        <button
          type="button"
          onClick={handleRefresh}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] p-2 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        redirectPath="/admin/login"
      />
    </header>
  )
}

function ShoppingBag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

