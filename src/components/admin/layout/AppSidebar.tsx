import { useNavigate, useLocation } from 'react-router-dom'

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: '소비 패턴 분석', icon: DashboardIcon },
    { path: '/admin/cards', label: '카드', icon: ShoppingBagIcon },
    { path: '/admin/users', label: '사용자', icon: UsersIcon },
    { path: '/admin/behavior', label: '고객 행동 분석', icon: ActivityIcon },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#1a1a1a] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 50 }}
      >
        <nav className="flex flex-col h-full">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  onClose()
                }}
                className={`flex items-center gap-4 px-6 py-5 font-medium transition-colors border-b border-gray-200 dark:border-[#1a1a1a] ${
                  active 
                    ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xl">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

export { DashboardIcon, ShoppingBagIcon, UsersIcon, ActivityIcon }
