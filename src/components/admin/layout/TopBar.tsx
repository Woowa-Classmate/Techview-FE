import { useState, useEffect } from 'react'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/ui/dialog'
import { Label } from '@/components/admin/ui/label'
import { Button } from '@/components/admin/ui/button'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  })

  const t = {
    settings: '설정',
    settingsDesc: '관리자 페이지 설정을 변경할 수 있습니다.',
    theme: '테마',
    darkMode: '다크 모드',
    lightMode: '라이트 모드',
    cancel: '취소',
    save: '저장',
  }

  useEffect(() => {
    // 초기 로드 시 localStorage에서 테마를 읽어서 적용
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    logout()
    navigate('/admin/login')
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSettingsOpen(true)
  }

  return (
    <>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#1a1a1a] text-gray-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">{t.settings}</DialogTitle>
            <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
              {t.settingsDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.theme}</Label>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => {
                    document.documentElement.classList.add('dark')
                    localStorage.setItem('theme', 'dark')
                    setTheme('dark')
                  }}
                  className={`px-5 py-3 rounded text-base font-medium transition-colors border ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.darkMode}
                </button>
                <button
                  onClick={() => {
                    document.documentElement.classList.remove('dark')
                    localStorage.setItem('theme', 'light')
                    setTheme('light')
                  }}
                  className={`px-5 py-3 rounded text-base font-medium transition-colors border ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.lightMode}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#1a1a1a]">
            <Button
              variant="ghost"
              onClick={() => setIsSettingsOpen(false)}
              className="px-5 py-2 text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(false)}
              className="px-5 py-2 text-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              {t.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#1a1a1a]">
      <div className="flex gap-4 items-center">
        <button
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] p-2.5 rounded transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {title && (
          <div className="flex gap-3 items-center min-w-0">
            {TitleIcon ? (
              <TitleIcon className="flex-shrink-0 w-6 h-6 text-gray-900 dark:text-white" />
            ) : (
              <ShoppingBag className="flex-shrink-0 w-6 h-6 text-gray-900 dark:text-white" />
            )}
            <span className="text-xl font-semibold text-gray-900 truncate dark:text-white">{title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 gap-3 items-center">
        {showActionButtons && (
          <>
            {onCreate && (
              <button
                onClick={onCreate}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-4 py-2 rounded text-xl font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                CREATE
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-4 py-2 rounded text-xl font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                EXPORT
              </button>
            )}
          </>
        )}
        <button
          type="button"
          onClick={handleSettingsClick}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] p-2.5 rounded transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] p-2.5 rounded transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-4 py-2 rounded text-xl font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
    </>
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
