import { useState, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAdminHeader } from '@/contexts/AdminHeaderContext'
import { TopBar } from './TopBar'
import { AppSidebar } from './AppSidebar'
import { UsersIcon, ActivityIcon, MissionIcon } from './AppSidebar'

interface AdminLayoutProps {
  children?: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { actions } = useAdminHeader()

  const currentPageTitle = () => {
    if (location.pathname.includes('/users')) return '사용자'
    if (location.pathname.includes('/cards')) return '미션'
    if (location.pathname.includes('/behavior')) return '고객 행동 분석'
    return '미션'
  }

  const currentPageIcon = () => {
    if (location.pathname.includes('/users')) return UsersIcon
    if (location.pathname.includes('/cards')) return MissionIcon
    if (location.pathname.includes('/behavior')) return ActivityIcon
    return MissionIcon
  }

  const showActionButtons = location.pathname.includes('/cards') || location.pathname.includes('/users')
  const isUsersPage = location.pathname.includes('/users')

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#000000]">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-56' : 'ml-0'
        }`}
      >
        <TopBar
          title={currentPageTitle()}
          titleIcon={currentPageIcon()}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showActionButtons={showActionButtons}
          onCreate={isUsersPage ? undefined : actions.onCreate}
          onExport={actions.onExport}
          onRefresh={actions.onRefresh}
          sidebarOpen={sidebarOpen}
        />

        <main className="relative flex-1 p-0 bg-white dark:bg-[#000000]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
